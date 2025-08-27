import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc"
import { clerkClient } from "@clerk/nextjs/server"
import { UserRole } from "@prisma/client"



const createAdminSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
})

const updateAdminSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const adminRouter = createTRPCRouter({
  // Listar todos os administradores
  getAll: privateProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input

      const where: any = { role: UserRole.ADMIN }
      
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

      const [admins, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.db.user.count({ where })
      ])

      return {
        data: admins,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar por ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const admin = await ctx.db.user.findUnique({
        where: { 
          id: input.id,
          role: UserRole.ADMIN
        }
      })

      if (!admin) {
        throw new Error("Administrador não encontrado")
      }

      return admin
    }),

  // Criar novo administrador - integração com Clerk
  create: privateProcedure
    .input(createAdminSchema)
    .mutation(async ({ ctx, input }) => {
      let clerkUser: any = null
      
      try {
        // Verificar se já existe admin com mesmo email
        const existingEmail = await ctx.db.user.findUnique({
          where: { email: input.email }
        })

        if (existingEmail) {
          throw new Error("Já existe um usuário com este email")
        }

        // 1. Primeiro, criar o usuário no Clerk (sem telefone - será armazenado apenas no DB)
        try {
          clerkUser = await (await clerkClient()).users.createUser({
            emailAddress: [input.email],
            firstName: input.name.split(' ')[0],
            lastName: input.name.split(' ').slice(1).join(' ') || '',
            // phoneNumber removido - Clerk não suporta este parâmetro na criação
            password: input.password || undefined,
            skipPasswordChecks: !input.password,
            skipPasswordRequirement: !input.password,
            publicMetadata: {
              role: 'ADMIN',
            }
          })
        } catch (clerkError: any) {
          // Log detalhado do erro para debug
          console.error('=== CLERK ERROR DEBUG ===')
          console.error('Full error object:', clerkError)
          console.error('Error message:', clerkError.message)
          console.error('Error status:', clerkError.status)
          console.error('Error errors array:', clerkError.errors)
          console.error('Error stack:', clerkError.stack)
          console.error('========================')
          
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
            throw new Error(`Erro do sistema de autenticação: ${clerkError.errors[0].message}`)
          } else if (clerkError.message) {
            throw new Error(`Erro do sistema de autenticação: ${clerkError.message}`)
          } else {
            console.error('Erro do Clerk não identificado:', clerkError)
            throw new Error(`Erro interno do sistema de autenticação. Detalhes: ${JSON.stringify(clerkError)}`)
          }
        }

        // 2. Depois, criar o admin no banco de dados com o ID do Clerk
        const admin = await ctx.db.user.create({
          data: {
            id: clerkUser.id, // Usar o ID gerado pelo Clerk
            name: input.name,
            email: input.email,
            phone: input.phone,
            cpf: input.cpf,
            role: UserRole.ADMIN,
          }
        })

        return admin
      } catch (error: any) {
        // Se houver erro após criar no Clerk, tentar deletar o usuário do Clerk
        if (error.message?.includes("sistema de autenticação") === false && clerkUser?.id) {
          try {
            await (await clerkClient()).users.deleteUser(clerkUser.id)
          } catch (cleanupError) {
            console.error('Erro ao limpar admin do Clerk:', cleanupError)
          }
        }
        
        throw error
      }
    }),

  // Atualizar administrador existente - integração com Clerk
  update: privateProcedure
    .input(updateAdminSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      try {
        // Verificar se o admin existe
        const existingAdmin = await ctx.db.user.findUnique({
          where: { 
            id,
            role: UserRole.ADMIN
          }
        })

        if (!existingAdmin) {
          throw new Error("Administrador não encontrado")
        }

        // Verificar se existe outro admin com mesmo email
        if (data.email && data.email !== existingAdmin.email) {
          const existingEmail = await ctx.db.user.findFirst({
            where: { 
              email: data.email,
              id: { not: id }
            }
          })

          if (existingEmail) {
            throw new Error("Já existe um usuário com este email")
          }
        }

        // 1. Atualizar no Clerk se houve mudanças relevantes (sem telefone)
        if (data.name || data.email) {
          try {
            const updateData: any = {}
            
            if (data.name && data.name !== existingAdmin.name) {
              updateData.firstName = data.name.split(' ')[0]
              updateData.lastName = data.name.split(' ').slice(1).join(' ') || ''
            }
            
            if (data.email && data.email !== existingAdmin.email) {
              updateData.emailAddress = [data.email]
            }
            
            // phoneNumber não é suportado pelo Clerk - telefone será gerenciado apenas no DB
            // if (data.phone && data.phone !== existingAdmin.phone) {
            //   updateData.phoneNumber = data.phone ? [data.phone] : []
            // }

            // Atualizar metadados
            const clerkUser = await (await clerkClient()).users.getUser(id)
            updateData.publicMetadata = {
              ...(clerkUser.publicMetadata || {}),
              role: 'ADMIN',
            }

            if (Object.keys(updateData).length > 0) {
              await (await clerkClient()).users.updateUser(id, updateData)
            }
          } catch (clerkError: any) {
            // Tratar erros específicos do Clerk
            if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
              throw new Error("Este email já está sendo usado por outro usuário no sistema de autenticação")
            } else if (clerkError.errors?.[0]?.message) {
              throw new Error(`Erro do sistema de autenticação: ${clerkError.errors[0].message}`)
            } else {
              console.error('Erro do Clerk na atualização:', clerkError)
              throw new Error("Erro interno do sistema de autenticação. Tente novamente mais tarde.")
            }
          }
        }

        // 2. Atualizar no banco de dados
        const admin = await ctx.db.user.update({
          where: { id },
          data
        })

        return admin
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar administrador (soft delete - marcar como inativo) - integração com Clerk
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar se o admin existe
        const admin = await ctx.db.user.findUnique({
          where: { 
            id: input.id,
            role: UserRole.ADMIN
          }
        })

        if (!admin) {
          throw new Error("Administrador não encontrado")
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
          console.error('Erro ao desativar admin no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Marcar como inativo no banco de dados
        const updatedAdmin = await ctx.db.user.update({
          where: { id: input.id },
          data: { isActive: false }
        })

        return updatedAdmin
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar permanentemente (só funciona se estiver inativo)
  deletePermanently: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar o admin
        const admin = await ctx.db.user.findUnique({
          where: { 
            id: input.id,
            role: UserRole.ADMIN
          }
        })

        if (!admin) {
          throw new Error("Administrador não encontrado")
        }

        // Verificar se está inativo
        if (admin.isActive) {
          throw new Error("Não é possível deletar permanentemente um administrador ativo. Desative-o primeiro.")
        }

        // 1. Deletar permanentemente do Clerk
        try {
          await (await clerkClient()).users.deleteUser(input.id)
        } catch (clerkError: any) {
          console.error('Erro ao deletar admin do Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Deletar permanentemente do banco de dados
        await ctx.db.user.delete({
          where: { id: input.id }
        })

        return { success: true, name: admin.name }
      } catch (error: any) {
        throw error
      }
    }),

  // Reativar administrador - integração com Clerk
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
          console.error('Erro ao reativar admin no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Reativar no banco de dados
        const admin = await ctx.db.user.update({
          where: { id: input.id },
          data: { isActive: true }
        })

        return admin
      } catch (error: any) {
        throw error
      }
    }),

  // Estatísticas dos administradores
  getStats: privateProcedure
    .query(async ({ ctx }) => {
      const [total, active, recent] = await Promise.all([
        ctx.db.user.count({ where: { role: UserRole.ADMIN } }),
        ctx.db.user.count({ where: { role: UserRole.ADMIN, isActive: true } }),
        ctx.db.user.count({
          where: {
            role: UserRole.ADMIN,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
            }
          }
        })
      ])

      return {
        total,
        active,
        recent
      }
    }),
})
