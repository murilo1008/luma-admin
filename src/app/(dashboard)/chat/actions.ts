"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/server/db"
import OpenAI from "openai"

interface User {
  id: string
  name: string
  email: string
  role: string
  advisor?: {
    id: string
    name: string
  }
  office?: {
    id: string
    name: string
  }
}

interface UserPolicy {
  policyNumber: string
  insurerName: string
  type: string
  insuredAmount: string
  premiumValue: string
  startDate: string
  endDate: string
  status: string
  coverages?: Array<{
    name: string
    coveredAmount: string
    description?: string
  }>
  beneficiaries?: Array<{
    name: string
    relationship: string
    percentage: number
  }>
}

// Buscar usuários baseado no role do usuário atual
export async function getAvailableUsersAction(currentUserId: string, currentUserRole: string, currentUserOfficeId?: string): Promise<User[]> {
  try {
    const { userId } = await auth()
    
    if (!userId || userId !== currentUserId) {
      throw new Error('Unauthorized')
    }

    let whereClause: any = { isActive: true }

    switch (currentUserRole) {
      case 'ADMIN':
        // Admin pode ver todos os usuários
        break

      case 'OFFICE_ADMIN':
        // Office Admin pode ver usuários do seu escritório
        if (currentUserOfficeId) {
          whereClause.officeId = currentUserOfficeId
        }
        break

      case 'ADVISOR':
        // Advisor pode ver apenas seus clientes
        whereClause.advisorId = currentUserId
        break

      default:
        return []
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        advisor: {
          select: { id: true, name: true }
        },
        office: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      advisor: user.advisor,
      office: user.office
    }))
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }
}

// Buscar apólices de um usuário para contexto da IA
export async function getUserPoliciesAction(userId: string): Promise<UserPolicy[]> {
  try {
    const { userId: authUserId } = await auth()
    
    if (!authUserId) {
      throw new Error('Unauthorized')
    }

    const insurances = await db.insurance.findMany({
      where: { userId },
      include: {
        insuranceType: true,
        insurer: true,
        coverages: {
          where: { isActive: true }
        },
        beneficiaries: {
          where: { isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return insurances.map((insurance: any) => {
      const startDate = insurance.startDate.toLocaleDateString('pt-BR')
      const endDate = insurance.endDate.toLocaleDateString('pt-BR')
      // Dividir por 100 para converter centavos para reais
      const premiumValue = (insurance.premiumValue.toNumber() / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      const insuredAmount = (insurance.insuredAmount.toNumber() / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

      return {
        policyNumber: insurance.policyNumber,
        insurerName: insurance.insurerName,
        type: insurance.insuranceType.name,
        insuredAmount,
        premiumValue,
        startDate,
        endDate,
        status: insurance.status === 'ACTIVE' ? 'Ativa' : 
               insurance.status === 'EXPIRED' ? 'Expirada' :
               insurance.status === 'CANCELLED' ? 'Cancelada' : 'Suspensa',
        coverages: insurance.coverages.map((coverage: any) => ({
          name: coverage.name,
          // Dividir por 100 para converter centavos para reais
          coveredAmount: (coverage.coveredAmount.toNumber() / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          description: coverage.description || undefined
        })),
        beneficiaries: insurance.beneficiaries.map((beneficiary: any) => ({
          name: beneficiary.name,
          relationship: beneficiary.relationship === 'SPOUSE' ? 'Cônjuge' :
                       beneficiary.relationship === 'CHILD' ? 'Filho(a)' :
                       beneficiary.relationship === 'PARENT' ? 'Pai/Mãe' :
                       beneficiary.relationship === 'SIBLING' ? 'Irmão(ã)' :
                       beneficiary.relationship === 'GRANDPARENT' ? 'Avô/Avó' :
                       beneficiary.relationship === 'GRANDCHILD' ? 'Neto(a)' : 'Outro',
          percentage: beneficiary.percentage.toNumber()
        }))
      }
    })
  } catch (error) {
    console.error('Erro ao buscar apólices:', error)
    return []
  }
}

// Gerar contexto das apólices para a IA
export async function getPolicyContextAction(selectedUserId: string): Promise<string> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Buscar apólices do usuário selecionado
    const policies = await getUserPoliciesAction(selectedUserId)
    
    // Construir contexto das apólices
    if (policies.length === 0) {
      return "O usuário selecionado ainda não possui apólices cadastradas."
    }

    const policyContext = policies.map((policy, index) => {
      let policyInfo = `📋 APÓLICE ${index + 1}:
🔢 Número: ${policy.policyNumber}
🏢 Seguradora: ${policy.insurerName}
📂 Tipo: ${policy.type}
🛡️ Valor Segurado: ${policy.insuredAmount}
💰 Prêmio: ${policy.premiumValue}
📅 Vigência: ${policy.startDate} até ${policy.endDate}
📊 Status: ${policy.status}`

      if (policy.coverages && policy.coverages.length > 0) {
        policyInfo += `\n\n🛡️ COBERTURAS:`
        policy.coverages.forEach(coverage => {
          policyInfo += `\n  • ${coverage.name}: ${coverage.coveredAmount}`
          if (coverage.description) {
            policyInfo += ` - ${coverage.description}`
          }
        })
      }

      if (policy.beneficiaries && policy.beneficiaries.length > 0) {
        policyInfo += `\n\n👥 BENEFICIÁRIOS:`
        policy.beneficiaries.forEach(beneficiary => {
          policyInfo += `\n  • ${beneficiary.name} (${beneficiary.percentage}%) - ${beneficiary.relationship}`
        })
      }

      return policyInfo
    }).join('\n\n' + '='.repeat(50) + '\n\n')

    return policyContext
  } catch (error) {
    console.error('Erro ao buscar contexto:', error)
    return "Erro ao carregar informações das apólices."
  }
}
