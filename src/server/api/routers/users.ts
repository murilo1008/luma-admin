import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc"
import { UserRole } from "@prisma/client"
import { clerkClient } from "@clerk/nextjs/server"

// Schema de validação para usuários
const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Tipo de usuário inválido" }) }),
  officeId: z.string().optional(),
  advisorId: z.string().optional(),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").optional(),
})
  .refine((data) => {
    // Se for OFFICE_ADMIN, officeId é obrigatório
    if (data.role === UserRole.OFFICE_ADMIN && !data.officeId) {
      return false
    }
    return true
  }, {
    message: "Escritório é obrigatório para administradores de escritório",
    path: ["officeId"]
  })

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Tipo de usuário inválido" }) }),
  isActive: z.boolean().optional(),
  officeId: z.string().optional(),
  advisorId: z.string().optional(),
})
  .refine((data) => {
    // Se for OFFICE_ADMIN, officeId é obrigatório
    if (data.role === UserRole.OFFICE_ADMIN && !data.officeId) {
      return false
    }
    return true
  }, {
    message: "Escritório é obrigatório para administradores de escritório",
    path: ["officeId"]
  })

export const usersRouter = createTRPCRouter({
  // Listar todos os usuários com role USER (usuários finais)
  getAllUsers: privateProcedure
    .input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { search, isActive, limit, offset } = input

      const where: any = { role: UserRole.USER }
      
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

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            _count: {
              select: { insurances: true }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }),
        ctx.db.user.count({ where })
      ])

      // Mapear os dados para incluir insurancesCount
      const mappedUsers = users.map(user => ({
        ...user,
        insurancesCount: user._count.insurances
      }))

      return {
        data: mappedUsers,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Estatísticas dos usuários
  getUserStats: privateProcedure
    .query(async ({ ctx }) => {
      const [total, active, totalPolicies, newThisWeek] = await Promise.all([
        ctx.db.user.count({ where: { role: UserRole.USER } }),
        ctx.db.user.count({ where: { role: UserRole.USER, isActive: true } }),
        ctx.db.insurance.count({
          where: {
            user: { role: UserRole.USER }
          }
        }),
        ctx.db.user.count({
          where: {
            role: UserRole.USER,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
            }
          }
        })
      ])

      return {
        totalUsers: total,
        activeUsers: active,
        totalPolicies,
        newThisWeek
      }
    }),

  // Listar usuários OFFICE_ADMIN por escritório
  getOfficeAdminsByOfficeId: privateProcedure
    .input(z.object({
      officeId: z.string(),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { officeId, search, isActive, limit, offset } = input

      // Filtrar diretamente por officeId - muito mais simples!
      const where: any = { 
        role: UserRole.OFFICE_ADMIN,
        officeId: officeId
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

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            office: {
              select: {
                id: true,
                name: true
              }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true,
                officeId: true
              }
            }
          }
        }),
        ctx.db.user.count({ where })
      ])

      return {
        data: users,
        total,
        hasMore: offset + limit < total
      }
    }),

  // Buscar usuário por ID
  getById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          advisor: {
            include: {
              offices: true
            }
          },
          conversations: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              isActive: true
            }
          },
          insurances: {
            select: {
              id: true,
              policyNumber: true,
              insurerName: true,
              status: true,
              createdAt: true
            }
          }
        }
      })

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      return user
    }),

  // Buscar dados completos do usuário para visualização detalhada
  getFullDetails: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          advisor: {
            include: {
              offices: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  phone: true,
                  email: true,
                  cnpj: true
                }
              }
            }
          },
          insurances: {
            include: {
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
            },
            orderBy: { createdAt: 'desc' }
          },
          conversations: {
            select: {
              id: true,
              title: true,
              createdAt: true,
              isActive: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Últimas 5 conversas
          }
        }
      })

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      return user
    }),

  // Criar novo usuário (OFFICE_ADMIN) - integração com Clerk
  create: privateProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      let clerkUser: any = null
      
      try {
        // Verificar se já existe usuário com mesmo email no banco local
        const existingEmailInDb = await ctx.db.user.findUnique({
          where: { email: input.email }
        })

        if (existingEmailInDb) {
          throw new Error("Já existe um usuário com este email no sistema")
        }

        // Verificar se escritório existe (para OFFICE_ADMIN)
        if (input.role === UserRole.OFFICE_ADMIN && input.officeId) {
          const office = await ctx.db.office.findUnique({
            where: { id: input.officeId }
          })

          if (!office) {
            throw new Error("Escritório não encontrado")
          }

          if (!office.isActive) {
            throw new Error("Não é possível vincular a um escritório inativo")
          }
        }

        // Se for OFFICE_ADMIN e tiver advisorId, verificar se o assessor existe
        if (input.role === UserRole.OFFICE_ADMIN && input.advisorId) {
          const advisor = await ctx.db.advisor.findUnique({
            where: { id: input.advisorId }
          })

          if (!advisor) {
            throw new Error("Assessor não encontrado")
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
              role: input.role, // Definir role no publicMetadata para reconhecimento na sidebar
              officeId: input.officeId || undefined,
              advisorId: input.advisorId || undefined,
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

        // 2. Depois, criar o usuário no banco de dados com o ID do Clerk
        const user = await ctx.db.user.create({
          data: {
            id: clerkUser.id, // Usar o ID gerado pelo Clerk
            name: input.name,
            email: input.email,
            phone: input.phone,
            cpf: input.cpf,
            role: input.role,
            officeId: input.officeId,
            advisorId: input.advisorId,
          },
          include: {
            office: {
              select: {
                id: true,
                name: true
              }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true,
                officeId: true
              }
            }
          }
        })

        return user
      } catch (error: any) {
        // Se houver erro após criar no Clerk, tentar deletar o usuário do Clerk
        if (error.message?.includes("Clerk") === false && clerkUser?.id) {
          // Se o erro não é do Clerk, pode ser que o usuário foi criado no Clerk mas falhou no banco
          // Neste caso, tentamos deletar o usuário do Clerk para manter consistência
          try {
            await (await clerkClient()).users.deleteUser(clerkUser.id)
          } catch (cleanupError) {
            console.error('Erro ao limpar usuário do Clerk:', cleanupError)
          }
        }
        
        throw error
      }
    }),

  // Atualizar usuário existente - integração com Clerk
  update: privateProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      try {
        // Verificar se o usuário existe no banco local
        const existingUser = await ctx.db.user.findUnique({
          where: { id }
        })

        if (!existingUser) {
          throw new Error("Usuário não encontrado")
        }

        // Verificar se existe outro usuário com mesmo email
        if (data.email && data.email !== existingUser.email) {
          const existingEmail = await ctx.db.user.findFirst({
            where: { 
              email: data.email,
              id: { not: id }
            }
          })

          if (existingEmail) {
            throw new Error("Já existe um usuário com este email no sistema")
          }
        }

        // Verificar se escritório existe (para OFFICE_ADMIN)
        if (data.role === UserRole.OFFICE_ADMIN && data.officeId) {
          const office = await ctx.db.office.findUnique({
            where: { id: data.officeId }
          })

          if (!office) {
            throw new Error("Escritório não encontrado")
          }

          if (!office.isActive) {
            throw new Error("Não é possível vincular a um escritório inativo")
          }
        }

        // Se for OFFICE_ADMIN e tiver advisorId, verificar se o assessor existe
        if (data.role === UserRole.OFFICE_ADMIN && data.advisorId) {
          const advisor = await ctx.db.advisor.findUnique({
            where: { id: data.advisorId }
          })

          if (!advisor) {
            throw new Error("Assessor não encontrado")
          }
        }

        // 1. Atualizar no Clerk se houve mudanças relevantes
        if (data.name || data.email || data.phone || data.role || data.officeId !== undefined || data.advisorId !== undefined) {
          try {
            const updateData: any = {}
            
            if (data.name && data.name !== existingUser.name) {
              updateData.firstName = data.name.split(' ')[0]
              updateData.lastName = data.name.split(' ').slice(1).join(' ') || ''
            }
            
            if (data.email && data.email !== existingUser.email) {
              updateData.emailAddress = [data.email]
            }
            
            if (data.phone && data.phone !== existingUser.phone) {
              updateData.phoneNumber = data.phone ? [data.phone] : []
            }

            // Atualizar publicMetadata se role, officeId ou advisorId mudaram
            if (data.role || data.officeId !== undefined || data.advisorId !== undefined) {
              updateData.publicMetadata = {
                role: data.role || existingUser.role,
                officeId: data.officeId !== undefined ? data.officeId : existingUser.officeId,
                advisorId: data.advisorId !== undefined ? data.advisorId : existingUser.advisorId,
              }
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
        const user = await ctx.db.user.update({
          where: { id },
          data,
          include: {
            office: {
              select: {
                id: true,
                name: true
              }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true,
                officeId: true
              }
            }
          }
        })

        return user
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar usuário (soft delete - marcar como inativo) - integração com Clerk
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
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
          console.error('Erro ao desativar usuário no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Marcar como inativo no banco de dados
        const user = await ctx.db.user.update({
          where: { id: input.id },
          data: { isActive: false },
          include: {
            office: {
              select: {
                id: true,
                name: true
              }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true,
                officeId: true
              }
            }
          }
        })

        return user
      } catch (error: any) {
        throw error
      }
    }),

  // Deletar permanentemente (só funciona se estiver inativo e não tiver dados relacionados)
  deletePermanently: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Buscar o usuário
        const user = await ctx.db.user.findUnique({
          where: { id: input.id },
          include: {
            conversations: true,
            insurances: true,
            messages: true
          }
        })

        if (!user) {
          throw new Error("Usuário não encontrado")
        }

        // Verificar se está inativo
        if (user.isActive) {
          throw new Error("Não é possível deletar permanentemente um usuário ativo. Desative-o primeiro.")
        }

        // Verificar se não tem dados relacionados
        if (user.conversations.length > 0 || user.insurances.length > 0 || user.messages.length > 0) {
          throw new Error("Não é possível deletar permanentemente este usuário pois existem dados relacionados")
        }

        // 1. Deletar permanentemente do Clerk
        try {
          await (await clerkClient()).users.deleteUser(input.id)
        } catch (clerkError: any) {
          console.error('Erro ao deletar usuário do Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Deletar permanentemente do banco de dados
        await ctx.db.user.delete({
          where: { id: input.id }
        })

        return { success: true, name: user.name }
      } catch (error: any) {
        throw error
      }
    }),

  // Reativar usuário - integração com Clerk
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
          console.error('Erro ao reativar usuário no Clerk:', clerkError)
          // Continua com a operação local mesmo se falhar no Clerk
        }

        // 2. Reativar no banco de dados
        const user = await ctx.db.user.update({
          where: { id: input.id },
          data: { isActive: true },
          include: {
            office: {
              select: {
                id: true,
                name: true
              }
            },
            advisor: {
              select: {
                id: true,
                name: true,
                code: true,
                officeId: true
              }
            }
          }
        })

        return user
      } catch (error: any) {
        throw error
      }
    }),

  // Atualizar perfil do usuário logado - integração com Clerk
  updateMyProfile: privateProcedure
    .input(z.object({
      firstName: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
      lastName: z.string().min(1, "Sobrenome é obrigatório").max(50, "Sobrenome deve ter no máximo 50 caracteres"),
      phone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId
      
      if (!userId) {
        throw new Error("Usuário não autenticado")
      }

      try {
        // 1. Atualizar no Clerk primeiro
        const updateData: any = {
          firstName: input.firstName,
          lastName: input.lastName,
        }

        // Atualizar telefone se fornecido
        if (input.phone) {
          const phoneNumbers = input.phone.replace(/\D/g, '')
          if (phoneNumbers.length >= 10) {
            updateData.phoneNumber = [`+55${phoneNumbers}`]
          }
        }

        await (await clerkClient()).users.updateUser(userId, updateData)

        // 2. Verificar se existe no banco de dados local e atualizar se necessário
        const existingUser = await ctx.db.user.findUnique({
          where: { id: userId }
        })

        if (existingUser) {
          // Atualizar no banco de dados local também
          const fullName = `${input.firstName} ${input.lastName}`.trim()
          await ctx.db.user.update({
            where: { id: userId },
            data: {
              name: fullName,
              phone: input.phone
            }
          })
        }

        // Se é um advisor, atualizar na tabela de advisors também
        const existingAdvisor = await ctx.db.advisor.findUnique({
          where: { id: userId }
        })

        if (existingAdvisor) {
          const fullName = `${input.firstName} ${input.lastName}`.trim()
          await ctx.db.advisor.update({
            where: { id: userId },
            data: {
              name: fullName,
              phone: input.phone
            }
          })
        }

        return { success: true }
      } catch (error: any) {
        console.error("Erro ao atualizar perfil:", error)
        
        if (error.errors?.[0]?.code === 'form_identifier_exists') {
          throw new Error("Este email já está sendo usado por outro usuário")
        } else if (error.errors?.[0]?.message) {
          throw new Error(`Erro do Clerk: ${error.errors[0].message}`)
        } else {
          throw new Error(error.message || "Erro ao atualizar perfil")
        }
      }
    }),

  // Buscar dados do usuário atual logado
  getCurrentUser: privateProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId
      
      if (!userId) {
        return null
      }

      // Primeiro, tentar buscar na tabela User
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          name: true,
          email: true,
          isActive: true,
          officeId: true,
          advisorId: true,
          office: {
            select: {
              id: true,
              name: true
            }
          },
          advisor: {
            select: {
              id: true,
              name: true,
              code: true,
              officeId: true,
              offices: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      if (user) {
        return user
      }

      // Se não encontrou, tentar buscar na tabela Advisor
      const advisor = await ctx.db.advisor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          code: true,
          isActive: true,
          officeId: true,
          offices: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (advisor) {
        return {
          id: advisor.id,
          role: 'ADVISOR' as const,
          name: advisor.name,
          email: advisor.email,
          isActive: advisor.isActive,
          advisorId: null,
          advisor: {
            id: advisor.id,
            name: advisor.name,
            code: advisor.code,
            officeId: advisor.officeId,
            offices: advisor.offices
          }
        }
      }

      return null
    }),

  // Estatísticas dos OFFICE_ADMIN por escritório
  getOfficeAdminStatsByOffice: privateProcedure
    .input(z.object({ officeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { officeId } = input

      // Filtrar diretamente por officeId - muito mais simples!
      const [total, active, withAdvisor, recent] = await Promise.all([
        ctx.db.user.count({ 
          where: { 
            role: UserRole.OFFICE_ADMIN,
            officeId: officeId
          } 
        }),
        ctx.db.user.count({ 
          where: { 
            role: UserRole.OFFICE_ADMIN,
            officeId: officeId,
            isActive: true
          } 
        }),
        ctx.db.user.count({
          where: {
            role: UserRole.OFFICE_ADMIN,
            officeId: officeId,
            advisorId: { not: null }
          }
        }),
        ctx.db.user.count({
          where: {
            role: UserRole.OFFICE_ADMIN,
            officeId: officeId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // últimos 7 dias
            }
          }
        })
      ])

      return {
        total,
        active,
        withAdvisor,
        recent
      }
    }),
}) 