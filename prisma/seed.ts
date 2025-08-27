import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Limpar dados existentes
  await prisma.insuranceType.deleteMany()
  console.log('Dados existentes removidos...')

  // Criar tipos de seguro organizados por categoria
  const insuranceTypes = [
    // Seguros de Veículos e Mobilidade
    {
      name: 'Seguro Auto',
      description: 'Cobertura completa para automóveis contra roubo, furto, colisão, danos a terceiros e assistência 24 horas',
      isActive: true
    },
    {
      name: 'Seguro Moto',
      description: 'Proteção para motocicletas incluindo cobertura contra acidentes, roubo e responsabilidade civil',
      isActive: true
    },
    {
      name: 'Seguro Bike',
      description: 'Seguro especializado para bicicletas contra roubo, furto e acidentes durante uso urbano ou esportivo',
      isActive: true
    },
    {
      name: 'Seguro Naútico',
      description: 'Cobertura para embarcações de recreio e pesca, incluindo casco, motor e responsabilidade civil aquática',
      isActive: true
    },
    {
      name: 'Seguro Avião',
      description: 'Proteção para aeronaves particulares cobrindo casco, responsabilidade civil e acidentes pessoais',
      isActive: true
    },
    {
      name: 'Seguro Helicóptero',
      description: 'Seguro especializado para helicópteros incluindo cobertura de casco, motor e operações especiais',
      isActive: true
    },

    // Seguros Patrimoniais
    {
      name: 'Seguro Residencial',
      description: 'Proteção completa para residências contra incêndio, roubo, danos elétricos e responsabilidade civil familiar',
      isActive: true
    },
    {
      name: 'Seguro Imobiliária',
      description: 'Cobertura para imóveis comerciais e residenciais durante locação, venda ou administração predial',
      isActive: true
    },
    {
      name: 'Seguro Fiança',
      description: 'Garantia de cumprimento de obrigações contratuais em locações residenciais e comerciais',
      isActive: true
    },
    {
      name: 'Seguro Mudança',
      description: 'Proteção para bens durante transporte e mudanças residenciais ou comerciais contra danos e extravios',
      isActive: true
    },
    {
      name: 'Máquinas e Equipamentos',
      description: 'Cobertura para máquinas industriais, equipamentos profissionais e aparelhos contra quebra acidental',
      isActive: true
    },

    // Seguros Profissionais e Empresariais
    {
      name: 'Responsabilidade Civil Profissional',
      description: 'Proteção contra danos causados a terceiros no exercício de atividades profissionais específicas',
      isActive: true
    },
    {
      name: 'Proteção Combinada',
      description: 'Seguro empresarial que combina múltiplas coberturas patrimoniais e de responsabilidade civil',
      isActive: true
    },
    {
      name: 'Seguro Cyber',
      description: 'Proteção contra crimes cibernéticos, vazamento de dados e ataques de hackers para empresas',
      isActive: true
    },
    {
      name: 'Seguro D&O Pessoa Física',
      description: 'Cobertura para diretores e administradores contra responsabilização civil em decisões corporativas',
      isActive: true
    },
    {
      name: 'Seguro de Erros e Omissões (E&O)',
      description: 'Proteção profissional contra erros, omissões ou negligência no exercício de atividades especializadas',
      isActive: true
    },

    // Seguros Pessoais
    {
      name: 'Seguro Vida',
      description: 'Proteção financeira para beneficiários em caso de morte ou invalidez permanente do segurado',
      isActive: true
    },
    {
      name: 'Seguro Viagem',
      description: 'Cobertura para emergências médicas, cancelamentos, bagagens e assistência durante viagens nacionais e internacionais',
      isActive: true
    },
    {
      name: 'Plano de Saúde',
      description: 'Assistência médica e hospitalar completa com rede credenciada nacional para consultas e internações',
      isActive: true
    },
    {
      name: 'Seguro Saúde',
      description: 'Reembolso de despesas médicas e hospitalares sem limite de rede credenciada para livre escolha',
      isActive: true
    },
    {
      name: 'Seguro Odontológico',
      description: 'Cobertura para tratamentos dentários preventivos, restauradores e cirúrgicos com rede credenciada',
      isActive: true
    },
    {
      name: 'Seguro Hospitalar',
      description: 'Cobertura específica para internações hospitalares com diárias e reembolso de despesas médicas',
      isActive: true
    },
    {
      name: 'Seguro Educacional',
      description: 'Garantia de continuidade dos estudos em caso de morte ou invalidez do responsável financeiro',
      isActive: true
    },
    {
      name: 'Seguro Prestamista',
      description: 'Quitação de financiamentos e empréstimos em caso de morte, invalidez ou desemprego involuntário',
      isActive: true
    },
    {
      name: 'Seguro de Renda',
      description: 'Complementação de renda mensal em caso de incapacidade temporária ou permanente para o trabalho',
      isActive: true
    },
    {
      name: 'Seguro de Acidentes Pessoais',
      description: 'Indenização por morte ou invalidez decorrente exclusivamente de acidentes pessoais súbitos',
      isActive: true
    },
    {
      name: 'Seguro Funeral',
      description: 'Cobertura para despesas funerárias e assistência completa em momentos de luto familiar',
      isActive: true
    },
    {
      name: 'Seguro para Doenças Graves',
      description: 'Indenização única para diagnóstico de doenças graves como câncer, infarto e AVC',
      isActive: true
    },
    {
      name: 'Seguro Equipamentos Eletrônicos',
      description: 'Proteção para smartphones, laptops, tablets e equipamentos eletrônicos contra roubo, furto e danos',
      isActive: true
    },
    {
      name: 'Seguro contra Sequestro e Resgate',
      description: 'Cobertura especializada contra sequestro, extorsão e resgate para pessoas de alto risco',
      isActive: true
    }
  ]

  // Criar todos os tipos de seguro
  await prisma.insuranceType.createMany({
    data: insuranceTypes
  })

  console.log(`${insuranceTypes.length} tipos de seguro criados com sucesso!`)
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 