import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc"

// Schema de validação para escritórios
const createOfficeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  cnpj: z.string().optional(),
})

const updateOfficeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  address: z.string().optional(),
  phone: z.string().optional(), 
  email: z.string().email("Email inválido").optional(),
  cnpj: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const officesRouter = createTRPCRouter({
  // Listar escritórios ativos para seleção (simples)
  getActiveOffices: privateProcedure
    .query(async ({ ctx }) => {
      const offices = await ctx.db.office.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: 'asc' }
      })

      return offices
    }),

  // Listar todos os escritórios
  getAll: privateProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input

      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { cnpj: { contains: search, mode: 'insensitive' } },
        ]
      }
      
      if (isActive !== undefined) {
        where.isActive = isActive
      }

      const [offices, total] = await Promise.all([
        ctx.db.office.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            _count: {
              select: { advisors: true }
            }
          }
        }),
        ctx.db.office.count({ where })
      ])

      return {
        data: offices,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar por ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const office = await ctx.db.office.findUnique({
        where: { id: input.id },
        include: {
          advisors: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code: true,
              isActive: true,
              _count: {
                select: { clients: true }
              }
            }
          },
          _count: {
            select: { advisors: true }
          }
        }
      })

      if (!office) {
        throw new Error("Escritório não encontrado")
      }

      return office
    }),

  // Criar novo escritório
  create: privateProcedure
    .input(createOfficeSchema)
    .mutation(async ({ ctx, input }) => {
      const office = await ctx.db.office.create({
        data: input,
        include: {
          _count: {
            select: { advisors: true }
          }
        }
      })

      return office
    }),

  // Atualizar escritório existente
  update: privateProcedure
    .input(updateOfficeSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      const office = await ctx.db.office.update({
        where: { id },
        data,
        include: {
          _count: {
            select: { advisors: true }
          }
        }
      })

      return office
    }),

  // Deletar escritório (soft delete - marcar como inativo)
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se existem assessores ativos para este escritório
      const activeAdvisors = await ctx.db.advisor.count({
        where: {
          officeId: input.id,
          isActive: true
        }
      })

      if (activeAdvisors > 0) {
        throw new Error("Não é possível deletar este escritório pois existem assessores ativos associados")
      }

      const office = await ctx.db.office.update({
        where: { id: input.id },
        data: { isActive: false },
        include: {
          _count: {
            select: { advisors: true }
          }
        }
      })

      return office
    }),

  // Deletar permanentemente (só funciona se estiver inativo e sem assessores)
  deletePermanently: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Buscar o escritório
      const office = await ctx.db.office.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { advisors: true }
          }
        }
      })

      if (!office) {
        throw new Error("Escritório não encontrado")
      }

      // Verificar se está inativo
      if (office.isActive) {
        throw new Error("Não é possível deletar permanentemente um escritório ativo. Desative-o primeiro.")
      }

      // Verificar se não tem assessores conectados
      if (office._count.advisors > 0) {
        throw new Error("Não é possível deletar permanentemente este escritório pois existem assessores associados")
      }

      // Deletar permanentemente
      await ctx.db.office.delete({
        where: { id: input.id }
      })

      return { success: true, name: office.name }
    }),

  // Reativar escritório
  reactivate: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const office = await ctx.db.office.update({
        where: { id: input.id },
        data: { isActive: true },
        include: {
          _count: {
            select: { advisors: true }
          }
        }
      })

      return office
    }),

  // Estatísticas dos escritórios
  getStats: privateProcedure
    .query(async ({ ctx }) => {
      const [total, active, withAdvisors, recent] = await Promise.all([
        ctx.db.office.count(),
        ctx.db.office.count({ where: { isActive: true } }),
        ctx.db.office.count({
          where: {
            advisors: {
              some: {}
            }
          }
        }),
        ctx.db.office.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
            }
          }
        })
      ])

      return {
        total,
        active,
        withAdvisors,
        recent
      }
    }),
})
