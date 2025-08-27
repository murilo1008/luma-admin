import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc"
import { clerkClient } from "@clerk/nextjs/server"

const createAdvisorSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  code: z.string().min(1).max(20),
  avatar: z.string().url().optional(),
  officeId: z.string().optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
})

const updateAdvisorSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  code: z.string().min(1).max(20),
  avatar: z.string().url().optional(),
  isActive: z.boolean().optional(),
  officeId: z.string().optional(),
})

export const advisorsRouter = createTRPCRouter({
  // Listar todos os assessores ativos (para selects)
  getAll: privateProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional().default(true),
      limit: z.number().min(1).max(100).default(100),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input

      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ]
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive
      }

      const [advisors, total] = await Promise.all([
        ctx.db.advisor.findMany({
          where,
          orderBy: { name: 'asc' },
          take: limit,
          skip: offset,
          include: {
            offices: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: { clients: true }
            }
          }
        }),
        ctx.db.advisor.count({ where })
      ])

      return {
        data: advisors,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Listar assessores por escritório
  getByOfficeId: privateProcedure
    .input(z.object({
      officeId: z.string(),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { officeId, search, isActive, limit, offset } = input

      const where: any = { officeId }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ]
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive
      }

      const [advisors, total] = await Promise.all([
        ctx.db.advisor.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            _count: {
              select: { clients: true }
            }
          }
        }),
        ctx.db.advisor.count({ where })
      ])

      return {
        data: advisors,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar assessor por ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const advisor = await ctx.db.advisor.findUnique({
        where: { id: input.id },
        include: {
          offices: true,
          clients: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: { clients: true }
          }
        }
      })

      if (!advisor) {
        throw new Error("Assessor não encontrado")
      }

      return advisor
    }),

  // Buscar clientes de um assessor específico
  getMyClients: privateProcedure
    .input(z.object({
      advisorId: z.string(),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { advisorId, search, isActive, limit, offset } = input

      const where: any = { 
        advisorId,
        role: "USER" // Apenas usuários finais (clientes)
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { cpf: { contains: search, mode: 'insensitive' } },
        ]
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive
      }

      const [clients, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            _count: {
              select: { 
                insurances: true,
                conversations: true 
              }
            },
            insurances: {
              select: {
                id: true,
                status: true,
                startDate: true,
                endDate: true,
                insuranceType: {
                  select: { name: true }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 3 // Últimas 3 apólices para preview
            }
          }
        }),
        ctx.db.user.count({ where })
      ])

      return {
        data: clients,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar estatísticas dos clientes de um assessor
  getMyClientsStats: privateProcedure
    .input(z.object({ advisorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { advisorId } = input

      const [
        totalClients,
        activeClients,
        totalPolicies,
        activePolicies,
        totalConversations,
        recentClients
      ] = await Promise.all([
        // Total de clientes
        ctx.db.user.count({
          where: { 
            advisorId,
            role: "USER"
          }
        }),
        // Clientes ativos
        ctx.db.user.count({
          where: { 
            advisorId,
            role: "USER",
            isActive: true
          }
        }),
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
        // Total de conversas
        ctx.db.conversation.count({
          where: {
            user: {
              advisorId,
              role: "USER"
            }
          }
        }),
        // Clientes recentes (últimos 30 dias)
        ctx.db.user.count({
          where: {
            advisorId,
            role: "USER",
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])

      return {
        totalClients,
        activeClients,
        totalPolicies,
        activePolicies,
        totalConversations,
        recentClients
      }
    }),

  // Criar novo cliente para o assessor
  createClient: privateProcedure
    .input(z.object({
      advisorId: z.string(),
      name: z.string().min(1, "Nome é obrigatório").max(100),
      email: z.string().email("Email inválido"),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { advisorId, password, ...clientData } = input
      
      let clerkUser: any = null
      
      try {
        // Verificar se o assessor existe
        const advisor = await ctx.db.advisor.findUnique({
          where: { id: advisorId }
        })
        
        if (!advisor) {
          throw new Error("Assessor não encontrado")
        }

        // Criar usuário no Clerk
        const clerk = await clerkClient()
        clerkUser = await clerk.users.createUser({
          emailAddress: [clientData.email],
          password: password,
          firstName: clientData.name.split(' ')[0],
          lastName: clientData.name.split(' ').slice(1).join(' ') || '',
          publicMetadata: {
            role: "USER"
          }
        })

        // Criar cliente no banco de dados
        const client = await ctx.db.user.create({
          data: {
            id: clerkUser.id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            cpf: clientData.cpf,
            role: "USER",
            advisorId: advisorId,
            isActive: true
          },
          include: {
            _count: {
              select: {
                insurances: true,
                conversations: true
              }
            }
          }
        })

        return client
        
      } catch (error: any) {
        console.error("Erro ao criar cliente:", error)
        
        // Se criou no Clerk mas falhou no banco, limpar o Clerk
        if (clerkUser?.id) {
          try {
            const clerk = await clerkClient()
            await clerk.users.deleteUser(clerkUser.id)
          } catch (cleanupError) {
            console.error("Erro ao limpar usuário do Clerk:", cleanupError)
          }
        }

        if (error.message?.includes("E11000") || error.message?.includes("unique constraint")) {
          throw new Error("Email já está em uso")
        }
        
        throw new Error(error.message || "Erro ao criar cliente")
      }
    }),

  // Criar novo assessor - integração com Clerk
  create: privateProcedure
    .input(createAdvisorSchema)
    .mutation(async ({ ctx, input }) => {
      let clerkUser: any = null
      
      try {
        // Verificar se já existe assessor com mesmo email
        const existingEmail = await ctx.db.advisor.findUnique({
          where: { email: input.email }
        })

        if (existingEmail) {
          throw new Error("Já existe um assessor com este email")
        }

        // Verificar se já existe assessor com mesmo código
        const existingCode = await ctx.db.advisor.findUnique({
          where: { code: input.code }
        })

        if (existingCode) {
          throw new Error("Já existe um assessor com este código")
        }

        // Verificar se o escritório existe
        if (input.officeId) {
          const office = await ctx.db.office.findUnique({
            where: { id: input.officeId }
          })

          if (!office) {
            throw new Error("Escritório não encontrado")
          }
        }

        // 1. Primeiro, criar o usuário no Clerk (sem telefone - será armazenado apenas no DB)
        try {
          clerkUser = await (await clerkClient()).users.createUser({
            emailAddress: [input.email],
            firstName: input.name.split(' ')[0],
            lastName: input.name.split(' ').slice(1).join(' ') || '',
            // phoneNumber removido - Clerk não suporta este parâmetro na criação
            password: input.password || undefined,
            skipPasswordChecks: !input.password, // Se não tem senha, pula a verificação
            skipPasswordRequirement: !input.password, // Se não tem senha, pula o requisito
            publicMetadata: {
              role: 'ADVISOR',
              code: input.code,
              officeId: input.officeId,
            }
          })
        } catch (clerkError: any) {
          // Tratar erros específicos do Clerk
          if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
            throw new Error("Este email já está sendo usado por outro usuário no sistema de autenticação")
          } else if (clerkError.errors?.[0]?.code === 'form_password_pwned') {
            throw new Error("Esta senha é muito comum e insegura. Por favor, escolha uma senha mais forte")
          } else if (clerkError.errors?.[0]?.code === 'form_password_length_too_short') {
            throw new Error("A senha deve ter pelo menos 8 caracteres")
          } else if (clerkError.errors?.[0]?.code === 'form_password_validation_failed') {
            throw new Error("A senha não atende aos critérios de segurança necessários")
          } else if (clerkError.errors?.[0]?.message) {
            throw new Error(`Erro do Clerk: ${clerkError.errors[0].message}`)
          } else {
            console.error('Erro do Clerk:', clerkError)
            throw new Error("Erro interno do sistema de autenticação. Tente novamente mais tarde.")
          }
        }

        // 2. Depois, criar o assessor no banco de dados com o ID do Clerk
        const advisor = await ctx.db.advisor.create({
          data: {
            id: clerkUser.id, // Usar o ID gerado pelo Clerk
            name: input.name,
            email: input.email,
            phone: input.phone,
            cpf: input.cpf,
            code: input.code,
            avatar: input.avatar,
            officeId: input.officeId,
          },
          include: {
            _count: {
              select: { clients: true }
            }
          }
        })

        return advisor
      } catch (error: any) {
        // Se houver erro após criar no Clerk, tentar deletar o usuário do Clerk
        if (error.message?.includes("Clerk") === false && clerkUser?.id) {
          try {
            await (await clerkClient()).users.deleteUser(clerkUser.id)
          } catch (cleanupError) {
            console.error('Erro ao limpar assessor do Clerk:', cleanupError)
          }
        }
        
        throw error
      }
    }),

  // Atualizar assessor existente - integração com Clerk
  update: privateProcedure
    .input(updateAdvisorSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      try {
        // Verificar se o assessor existe
        const existingAdvisor = await ctx.db.advisor.findUnique({
          where: { id }
        })

        if (!existingAdvisor) {
          throw new Error("Assessor não encontrado")
        }

        // Verificar se existe outro assessor com mesmo email
        if (data.email && data.email !== existingAdvisor.email) {
          const existingEmail = await ctx.db.advisor.findFirst({
            where: { 
              email: data.email,
              id: { not: id }
            }
          })

          if (existingEmail) {
            throw new Error("Já existe um assessor com este email")
          }
        }

        // Verificar se existe outro assessor com mesmo código
        if (data.code && data.code !== existingAdvisor.code) {
          const existingCode = await ctx.db.advisor.findFirst({
            where: { 
              code: data.code,
              id: { not: id }
            }
          })

          if (existingCode) {
            throw new Error("Já existe um assessor com este código")
          }
        }

        // Verificar se o escritório existe
        if (data.officeId) {
          const office = await ctx.db.office.findUnique({
            where: { id: data.officeId }
          })

          if (!office) {
            throw new Error("Escritório não encontrado")
          }
        }

        // 1. Atualizar no Clerk se houve mudanças relevantes
        if (data.name || data.email || data.phone) {
          try {
            const updateData: any = {}
            
            if (data.name && data.name !== existingAdvisor.name) {
              updateData.firstName = data.name.split(' ')[0]
              updateData.lastName = data.name.split(' ').slice(1).join(' ') || ''
            }
            
            if (data.email && data.email !== existingAdvisor.email) {
              updateData.emailAddress = [data.email]
            }
            
            if (data.phone && data.phone !== existingAdvisor.phone) {
              updateData.phoneNumber = data.phone ? [data.phone] : []
            }

            // Atualizar metadados
            const clerkUser = await (await clerkClient()).users.getUser(id)
            updateData.publicMetadata = {
              ...(clerkUser.publicMetadata || {}),
              role: 'ADVISOR',
              code: data.code || existingAdvisor.code,
              officeId: data.officeId || existingAdvisor.officeId,
            }

            if (Object.keys(updateData).length > 0) {
              await (await clerkClient()).users.updateUser(id, updateData)
            }
          } catch (clerkError: any) {
            // Tratar erros específicos do Clerk
            if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
              throw new Error("Este email já está sendo usado por outro usuário no sistema de autenticação")
            } else if (clerkError.errors?.[0]?.message) {
              throw new Error(`Erro do Clerk: ${clerkError.errors[0].message}`)
            } else {
              console.error('Erro do Clerk na atualização:', clerkError)
              throw new Error("Erro interno do sistema de autenticação. Tente novamente mais tarde.")
            }
          }
        }

        // 2. Atualizar no banco de dados
        const advisor = await ctx.db.advisor.update({
          where: { id },
          data,
          include: {
            _count: {
              select: { clients: true }
            }
          }
        })

        return advisor
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar assessor (soft delete - marcar como inativo) - integração com Clerk
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar se existem clientes ativos para este assessor
        const activeClients = await ctx.db.user.count({
          where: {
            advisorId: input.id,
            isActive: true
          }
        })

        if (activeClients > 0) {
          throw new Error("Não é possível deletar este assessor pois existem clientes ativos associados")
        }

        // 1. Desativar no Clerk (não deletar completamente)
        try {
          const clerkUser = await (await clerkClient()).users.getUser(input.id)
          await (await clerkClient()).users.updateUser(input.id, {
            publicMetadata: { 
              ...(clerkUser.publicMetadata || {}),
              isActive: false 
            }
          })
        } catch (clerkError: any) {
          console.error('Erro ao desativar assessor no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Marcar como inativo no banco de dados
        const advisor = await ctx.db.advisor.update({
          where: { id: input.id },
          data: { isActive: false },
          include: {
            _count: {
              select: { clients: true }
            }
          }
        })

        return advisor
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar permanentemente (só funciona se estiver inativo e sem clientes)
  deletePermanently: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar o assessor
        const advisor = await ctx.db.advisor.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: { clients: true }
            }
          }
        })

        if (!advisor) {
          throw new Error("Assessor não encontrado")
        }

        // Verificar se está inativo
        if (advisor.isActive) {
          throw new Error("Não é possível deletar permanentemente um assessor ativo. Desative-o primeiro.")
        }

        // Verificar se não tem clientes conectados
        if (advisor._count.clients > 0) {
          throw new Error("Não é possível deletar permanentemente este assessor pois existem clientes associados")
        }

        // 1. Deletar permanentemente do Clerk
        try {
          await (await clerkClient()).users.deleteUser(input.id)
        } catch (clerkError: any) {
          console.error('Erro ao deletar assessor do Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Deletar permanentemente do banco de dados
        await ctx.db.advisor.delete({
          where: { id: input.id }
        })

        return { success: true, name: advisor.name }
      } catch (error: any) {
        throw error
      }
    }),

  // Reativar assessor - integração com Clerk
  reactivate: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Reativar no Clerk
        try {
          const clerkUser = await (await clerkClient()).users.getUser(input.id)
          await (await clerkClient()).users.updateUser(input.id, {
            publicMetadata: { 
              ...(clerkUser.publicMetadata || {}),
              isActive: true 
            }
          })
        } catch (clerkError: any) {
          console.error('Erro ao reativar assessor no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Reativar no banco de dados
        const advisor = await ctx.db.advisor.update({
          where: { id: input.id },
          data: { isActive: true },
          include: {
            _count: {
              select: { clients: true }
            }
          }
        })

        return advisor
      } catch (error: any) {
        throw error
      }
    }),

  // Estatísticas dos assessores por escritório
  getStatsByOffice: privateProcedure
    .input(z.object({ officeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { officeId } = input

      const [total, active, withClients, recent] = await Promise.all([
        ctx.db.advisor.count({ where: { officeId } }),
        ctx.db.advisor.count({ where: { officeId, isActive: true } }),
        ctx.db.advisor.count({
          where: {
            officeId,
            clients: {
              some: {}
            }
          }
        }),
        ctx.db.advisor.count({
          where: {
            officeId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
            }
          }
        })
      ])

      return {
        total,
        active,
        withClients,
        recent
      }
    }),
}) 