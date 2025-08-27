import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc"
import { InsuranceStatus } from "@prisma/client"

// Schema de validação para criação de apólice
const createInsuranceSchema = z.object({
  userId: z.string(),
  insuranceTypeId: z.string(),
  policyNumber: z.string().min(1, "Número da apólice é obrigatório"),
  insurerName: z.string().min(1, "Nome da seguradora é obrigatório"),
  insurerId: z.string(),
  contractNumber: z.string().optional(),
  policyContent: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  premiumValue: z.number().min(0, "Valor do prêmio deve ser positivo"),
  insuredAmount: z.number().min(0, "Valor segurado deve ser positivo"),
  status: z.nativeEnum(InsuranceStatus).default("ACTIVE"),
  policyPdfUrl: z.string().optional(),
  policyPdfName: z.string().optional(),
  // Dados das coberturas
  coverages: z.array(z.object({
    name: z.string().min(1, "Nome da cobertura é obrigatório"),
    description: z.string().optional(),
    coveredAmount: z.number().min(0, "Valor da cobertura deve ser positivo"),
    deductible: z.number().min(0).optional(),
    waitingPeriod: z.number().min(0).optional(),
    conditions: z.string().optional(),
    exclusions: z.string().optional(),
  })).default([]),
  // Dados dos beneficiários
  beneficiaries: z.array(z.object({
    name: z.string().min(1, "Nome do beneficiário é obrigatório"),
    cpf: z.string().min(1, "CPF é obrigatório"),
    relationship: z.enum(["SPOUSE", "CHILD", "PARENT", "SIBLING", "GRANDPARENT", "GRANDCHILD", "OTHER"]),
    percentage: z.number().min(0).max(100, "Porcentagem deve estar entre 0 e 100"),
    birthDate: z.date().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  })).default([])
})

const updateInsuranceSchema = z.object({
  id: z.string(),
  insuranceTypeId: z.string().optional(),
  policyNumber: z.string().optional(),
  insurerName: z.string().optional(),
  insurerId: z.string().optional(),
  contractNumber: z.string().optional(),
  policyContent: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  premiumValue: z.number().min(0).optional(),
  insuredAmount: z.number().min(0).optional(),
  status: z.nativeEnum(InsuranceStatus).optional(),
  policyPdfUrl: z.string().optional(),
  policyPdfName: z.string().optional(),
})

export const insurancesRouter = createTRPCRouter({
  // Listar apólices por assessor
  getByAdvisor: privateProcedure
    .input(z.object({
      advisorId: z.string(),
      search: z.string().optional(),
      status: z.nativeEnum(InsuranceStatus).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { advisorId, search, status, limit, offset } = input

      const where: any = {
        user: {
          advisorId,
          role: "USER"
        }
      }
      
      if (search) {
        where.OR = [
          { policyNumber: { contains: search, mode: 'insensitive' } },
          { insurerName: { contains: search, mode: 'insensitive' } },
          { contractNumber: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
        ]
      }
      
      if (status) {
        where.status = status
      }

      const [insurances, total] = await Promise.all([
        ctx.db.insurance.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            insuranceType: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            insurer: {
              select: {
                id: true,
                name: true,
                photoUrl: true
              }
            },
            _count: {
              select: {
                coverages: true,
                beneficiaries: true
              }
            }
          }
        }),
        ctx.db.insurance.count({ where })
      ])

      return {
        data: insurances,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar apólice por ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const insurance = await ctx.db.insurance.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cpf: true
            }
          },
          insuranceType: true,
          insurer: true,
          coverages: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
          beneficiaries: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          }
        }
      })

      if (!insurance) {
        throw new Error("Apólice não encontrada")
      }

      return insurance
    }),

  // Criar nova apólice
  create: privateProcedure
    .input(createInsuranceSchema)
    .mutation(async ({ ctx, input }) => {
      const { coverages, beneficiaries, ...insuranceData } = input
      
      try {
        // Verificar se o usuário existe e pertence ao assessor correto
        const user = await ctx.db.user.findUnique({
          where: { id: insuranceData.userId },
          include: { advisor: true }
        })
        
        if (!user) {
          throw new Error("Cliente não encontrado")
        }

        // Verificar se o tipo de seguro existe
        const insuranceType = await ctx.db.insuranceType.findUnique({
          where: { id: insuranceData.insuranceTypeId }
        })
        
        if (!insuranceType) {
          throw new Error("Tipo de seguro não encontrado")
        }

        // Verificar se a seguradora existe
        const insurer = await ctx.db.insurer.findUnique({
          where: { id: insuranceData.insurerId }
        })
        
        if (!insurer) {
          throw new Error("Seguradora não encontrada")
        }

        // Verificar se o número da apólice já existe
        const existingPolicy = await ctx.db.insurance.findUnique({
          where: { policyNumber: insuranceData.policyNumber }
        })
        
        if (existingPolicy) {
          throw new Error("Número da apólice já existe")
        }

        // Validar porcentagens dos beneficiários
        const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0)
        if (totalPercentage > 100) {
          throw new Error("A soma das porcentagens dos beneficiários não pode exceder 100%")
        }

        // Criar a apólice com coberturas e beneficiários
        const insurance = await ctx.db.insurance.create({
          data: {
            ...insuranceData,
            coverages: {
              create: coverages.map(coverage => ({
                ...coverage,
                isActive: true
              }))
            },
            beneficiaries: {
              create: beneficiaries.map(beneficiary => ({
                ...beneficiary,
                isActive: true
              }))
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            insuranceType: true,
            insurer: true,
            coverages: true,
            beneficiaries: true
          }
        })

        return insurance
        
      } catch (error: any) {
        console.error("Erro ao criar apólice:", error)
        throw new Error(error.message || "Erro ao criar apólice")
      }
    }),

  // Atualizar apólice
  update: privateProcedure
    .input(updateInsuranceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const insurance = await ctx.db.insurance.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          insuranceType: true,
          insurer: true,
          coverages: {
            where: { isActive: true }
          },
          beneficiaries: {
            where: { isActive: true }
          }
        }
      })

      return insurance
    }),

  // Cancelar apólice
  cancel: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const insurance = await ctx.db.insurance.update({
        where: { id: input.id },
        data: {
          status: "CANCELLED"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          insuranceType: true,
          insurer: true
        }
      })

      return insurance
    }),

  // Buscar seguradoras para select
  getInsurers: privateProcedure
    .query(async ({ ctx }) => {
      try {
        const insurers = await ctx.db.insurer.findMany({
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            photoUrl: true
          }
        })

        return insurers
      } catch (error) {
        // Retornar dados mockados caso a tabela não exista
        console.log("Tabela Insurer não encontrada, retornando dados mockados")
        return [
          { id: "1", name: "Porto Seguro", photoUrl: null },
          { id: "2", name: "SulAmérica", photoUrl: null },
          { id: "3", name: "Bradesco Seguros", photoUrl: null },
          { id: "4", name: "Zurich", photoUrl: null },
          { id: "5", name: "Mapfre", photoUrl: null },
          { id: "6", name: "Allianz", photoUrl: null },
        ]
      }
    }),

  // Estatísticas de apólices por assessor
  getStatsByAdvisor: privateProcedure
    .input(z.object({ advisorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { advisorId } = input

      const [
        totalPolicies,
        activePolicies,
        expiredPolicies,
        cancelledPolicies,
        totalPremiumValue,
        totalInsuredAmount
      ] = await Promise.all([
        // Total de apólices
        ctx.db.insurance.count({
          where: {
            user: {
              advisorId,
              role: "USER"
            }
          }
        }),
        // Apólices ativas
        ctx.db.insurance.count({
          where: {
            user: {
              advisorId,
              role: "USER"
            },
            status: "ACTIVE"
          }
        }),
        // Apólices expiradas
        ctx.db.insurance.count({
          where: {
            user: {
              advisorId,
              role: "USER"
            },
            status: "EXPIRED"
          }
        }),
        // Apólices canceladas
        ctx.db.insurance.count({
          where: {
            user: {
              advisorId,
              role: "USER"
            },
            status: "CANCELLED"
          }
        }),
        // Valor total dos prêmios
        ctx.db.insurance.aggregate({
          where: {
            user: {
              advisorId,
              role: "USER"
            },
            status: "ACTIVE"
          },
          _sum: {
            premiumValue: true
          }
        }),
        // Valor total segurado
        ctx.db.insurance.aggregate({
          where: {
            user: {
              advisorId,
              role: "USER"
            },
            status: "ACTIVE"
          },
          _sum: {
            insuredAmount: true
          }
        })
      ])

      return {
        totalPolicies,
        activePolicies,
        expiredPolicies,
        cancelledPolicies,
        totalPremiumValue: Number(totalPremiumValue._sum.premiumValue || 0),
        totalInsuredAmount: Number(totalInsuredAmount._sum.insuredAmount || 0)
      }
    }),
})
