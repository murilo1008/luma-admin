"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MessageCircle, 
  Calendar,
  Shield,
  Clock,
  MapPin,
  Edit,
  MoreHorizontal,
  Download,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Heart,
  Home,
  Plane,
  Smartphone,
  PawPrint,
  Zap,
  Activity
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import TitlePage from "@/components/title-page"
import { toast } from "sonner"
import { AddPolicyDialog } from "@/components/dialogs/add-policy-dialog"

// Dados mockados para o cliente específico
const getClientMockData = (id: string) => {
  const clients = {
    "1": {
      id: "1",
      name: "Jonatas Silva",
      email: "jonatassilva@gmail.com",
      phone: "(11) 92839-2930",
      cpf: "109.398.398-09",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      address: "Rua das Flores, 123, São Paulo - SP",
      birthDate: new Date("1985-03-20"),
      profession: "Desenvolvedor",
      _count: { insurances: 6, conversations: 54 },
      advisor: {
        name: "João Carlos",
        code: "ADV001",
        phone: "(11) 98888-7777"
      },
      insurances: [
        {
          id: "ins1",
          policyNumber: "AUTO-2024-001",
          insuranceType: { 
            name: "Seguro Auto",
            icon: "Car",
            color: "bg-purple-500"
          },
          insurer: { name: "Porto Seguro" },
          status: "ACTIVE",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2025-01-15"),
          premiumValue: 1200.00,
          insuredAmount: 45000.00,
          coverages: [
            { name: "Casco", coveredAmount: 45000.00 },
            { name: "Responsabilidade Civil", coveredAmount: 100000.00 },
            { name: "Roubo e Furto", coveredAmount: 45000.00 }
          ]
        },
        {
          id: "ins2",
          policyNumber: "SAU-2024-002",
          insuranceType: { 
            name: "Seguro Saúde",
            icon: "Heart",
            color: "bg-red-500"
          },
          insurer: { name: "Assist Card" },
          status: "ACTIVE",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2025-02-01"),
          premiumValue: 350.00,
          insuredAmount: 150000.00,
          coverages: [
            { name: "Consultas", coveredAmount: 5000.00 },
            { name: "Exames", coveredAmount: 8000.00 },
            { name: "Internação", coveredAmount: 150000.00 }
          ]
        },
        {
          id: "ins3",
          policyNumber: "VIA-2024-003",
          insuranceType: { 
            name: "Seguro Viagem",
            icon: "Plane",
            color: "bg-blue-500"
          },
          insurer: { name: "Allianz Travel" },
          status: "ACTIVE",
          startDate: new Date("2024-03-01"),
          endDate: new Date("2024-12-31"),
          premiumValue: 180.00,
          insuredAmount: 50000.00,
          coverages: [
            { name: "Despesas Médicas", coveredAmount: 50000.00 },
            { name: "Bagagem", coveredAmount: 2000.00 },
            { name: "Cancelamento", coveredAmount: 5000.00 }
          ]
        },
        {
          id: "ins4",
          policyNumber: "RES-2024-004",
          insuranceType: { 
            name: "Seguro Casa",
            icon: "Home",
            color: "bg-green-500"
          },
          insurer: { name: "Porto Seguro" },
          status: "ACTIVE",
          startDate: new Date("2024-04-01"),
          endDate: new Date("2025-04-01"),
          premiumValue: 280.00,
          insuredAmount: 400000.00,
          coverages: [
            { name: "Incêndio", coveredAmount: 400000.00 },
            { name: "Roubo", coveredAmount: 50000.00 },
            { name: "Danos Elétricos", coveredAmount: 10000.00 }
          ]
        },
        {
          id: "ins5",
          policyNumber: "VIA-2024-005",
          insuranceType: { 
            name: "Seguro Viagem",
            icon: "Plane",
            color: "bg-blue-500"
          },
          insurer: { name: "Allianz Travel" },
          status: "ACTIVE",
          startDate: new Date("2024-05-01"),
          endDate: new Date("2024-11-30"),
          premiumValue: 160.00,
          insuredAmount: 40000.00,
          coverages: [
            { name: "Despesas Médicas", coveredAmount: 40000.00 },
            { name: "Bagagem", coveredAmount: 1500.00 }
          ]
        },
        {
          id: "ins6",
          policyNumber: "RES-2024-006",
          insuranceType: { 
            name: "Seguro Casa",
            icon: "Home",
            color: "bg-green-500"
          },
          insurer: { name: "Assist Card" },
          status: "ACTIVE",
          startDate: new Date("2024-06-01"),
          endDate: new Date("2025-06-01"),
          premiumValue: 220.00,
          insuredAmount: 300000.00,
          coverages: [
            { name: "Incêndio", coveredAmount: 300000.00 },
            { name: "Vendaval", coveredAmount: 80000.00 }
          ]
        }
      ],
      conversations: [
        {
          id: "conv1",
          title: "Dúvidas sobre cobertura",
          createdAt: new Date("2024-11-20"),
          lastMessage: "Obrigada pela explicação sobre a cobertura de invalidez!"
        },
        {
          id: "conv2", 
          title: "Renovação de apólice",
          createdAt: new Date("2024-11-15"),
          lastMessage: "Quando posso renovar minha apólice de vida?"
        }
      ],
      recommendedInsurances: [
        {
          id: "rec1",
          name: "Seguro Portáteis",
          icon: "Smartphone",
          description: "Proteção para seus dispositivos móveis"
        },
        {
          id: "rec2", 
          name: "Seguro de Vida",
          icon: "Heart",
          description: "Proteção para você e sua família"
        },
        {
          id: "rec3",
          name: "Seguro Acidentes",
          icon: "Zap",
          description: "Cobertura em casos de acidentes pessoais"
        },
        {
          id: "rec4",
          name: "Seguro Pet",
          icon: "PawPrint", 
          description: "Cuidados veterinários para seu pet"
        }
      ]
    }
  }

  return clients[id as keyof typeof clients] || null
}

// Componente para renderizar ícones dinamicamente
const getIcon = (iconName: string, className: string = "h-6 w-6") => {
  const icons: { [key: string]: any } = {
    Car, Heart, Home, Plane, Smartphone, PawPrint, Zap, Activity
  }
  const IconComponent = icons[iconName] || Shield
  return <IconComponent className={className} />
}

// Componente do Mapa de Apólices - Nova implementação limpa
const InsuranceMap = ({ client }: { client: any }) => {
  const uniqueInsurances = client.insurances.reduce((acc: any[], insurance: any) => {
    const existing = acc.find(item => item.insuranceType.name === insurance.insuranceType.name)
    if (!existing) {
      acc.push(insurance)
    }
    return acc
  }, [])

  // Função para calcular posição usando matemática circular
  const getCircularPosition = (angle: number, radius: number, centerX: number = 50, centerY: number = 50) => {
    const radian = (angle * Math.PI) / 180
    const x = centerX + radius * Math.cos(radian - Math.PI / 2)
    const y = centerY + radius * Math.sin(radian - Math.PI / 2)
    return { x, y }
  }

  // Raios dos círculos (em % do container)
  const INNER_RADIUS = 25 // círculo interno
  const OUTER_RADIUS = 38 // círculo externo

  return (
    <div className="relative w-full h-80 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Círculo externo tracejado */}
        <circle
          cx="50"
          cy="50"
          r={OUTER_RADIUS}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="0.3"
          strokeDasharray="1,1"
          opacity="0.6"
        />
        
        {/* Círculo interno sólido */}
        <circle
          cx="50"
          cy="50"
          r={INNER_RADIUS}
          fill="rgba(168, 85, 247, 0.1)"
          stroke="#a855f7"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Linhas conectoras para seguros contratados */}
        {uniqueInsurances.slice(0, 4).map((insurance: any, index: number) => {
          const angle = index * 90 // 0°, 90°, 180°, 270°
          const outerPos = getCircularPosition(angle, INNER_RADIUS)
          
          return (
            <line
              key={`line-inner-${index}`}
              x1="50"
              y1="50"
              x2={outerPos.x}
              y2={outerPos.y}
              stroke={
                insurance.insuranceType.color === 'bg-purple-500' ? '#a855f7' :
                insurance.insuranceType.color === 'bg-red-500' ? '#ef4444' :
                insurance.insuranceType.color === 'bg-blue-500' ? '#3b82f6' :
                insurance.insuranceType.color === 'bg-green-500' ? '#22c55e' :
                '#a855f7'
              }
              strokeWidth="0.2"
              strokeDasharray="0.5,0.5"
              opacity="0.6"
            />
          )
        })}

        {/* Linhas conectoras para seguros recomendados */}
        {client.recommendedInsurances.slice(0, 8).map((insurance: any, index: number) => {
          const angle = index * 45 // 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
          const outerPos = getCircularPosition(angle, OUTER_RADIUS)
          
          return (
            <line
              key={`line-outer-${index}`}
              x1="50"
              y1="50"
              x2={outerPos.x}
              y2={outerPos.y}
              stroke="#9ca3af"
              strokeWidth="0.15"
              strokeDasharray="0.3,0.3"
              opacity="0.4"
            />
          )
        })}
      </svg>

      {/* Avatar central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg bg-white">
          <Avatar className="w-full h-full">
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold">
              {client.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Seguros Contratados (círculo interno) */}
      {uniqueInsurances.slice(0, 4).map((insurance: any, index: number) => {
        const angle = index * 90 // Distribuir uniformemente em 90°
        const position = getCircularPosition(angle, INNER_RADIUS)
        
        return (
          <div
            key={`contracted-${insurance.id}`}
            className="absolute z-20 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
          >
            <div className={`w-10 h-10 rounded-full ${insurance.insuranceType.color} flex items-center justify-center text-white shadow-lg transform transition-all duration-200 group-hover:scale-110 border-2 border-white`}>
              {getIcon(insurance.insuranceType.icon, "h-5 w-5")}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40">
              {insurance.insuranceType.name}
            </div>
          </div>
        )
      })}

      {/* Seguros Recomendados (círculo externo) */}
      {client.recommendedInsurances.slice(0, 5).map((insurance: any, index: number) => {
        const angle = index * 72 // Distribuir 5 itens em 360° (360/5 = 72)
        const position = getCircularPosition(angle, OUTER_RADIUS)
        
        return (
          <div
            key={`recommended-${insurance.id}`}
            className="absolute z-15 group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
          >
            <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-white shadow-md transform transition-all duration-200 group-hover:scale-110 border-2 border-white">
              {getIcon(insurance.icon, "h-4 w-4")}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40">
              {insurance.name}
            </div>
          </div>
        )
      })}

      {/* Círculos vazios no externo (para completar o visual) */}
      {Array.from({ length: 3 }).map((_, index) => {
        const angle = (index + 5) * 72 // Continuar a partir do 5º item
        const position = getCircularPosition(angle, OUTER_RADIUS)
        
        return (
          <div
            key={`empty-${index}`}
            className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`
            }}
          >
            <div className="w-9 h-9 rounded-full bg-gray-300 border-2 border-white shadow-sm opacity-40"></div>
          </div>
        )
      })}
    </div>
  )
}

export default function Client({ id }: { id: string }) {
  const router = useRouter()
  const client = getClientMockData(id)



  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Cliente não encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>
      case "EXPIRED":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Expirada</Badge>
      case "CANCELLED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Desconhecido</Badge>
    }
  }



  // Função para formatar número de telefone para WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, "").replace(/^0+/, "")
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = formatPhoneForWhatsApp(client.phone)
    const message = encodeURIComponent(`Olá ${client.name}! Sou seu assessor de seguros. Como posso ajudá-lo hoje?`)
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent(`Contato - ${client.name}`)
    const body = encodeURIComponent(`Olá ${client.name},\n\nEspero que esteja bem! Sou seu assessor de seguros e gostaria de conversar sobre suas apólices.\n\nAguardo seu retorno.\n\nAtenciosamente,`)
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`, '_blank')
  }

  const handlePhoneClick = () => {
    window.open(`tel:${client.phone}`, '_blank')
  }

  return (
    <div className="space-y-4">
      {/* Botão Voltar */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* Header do Cliente */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                <p className="text-sm text-muted-foreground">{client.cpf}</p>
                
                <div className="flex items-center space-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">E-mail</span>
                    <p className="font-medium text-foreground">{client.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone</span>
                    <p className="font-medium text-foreground">{client.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <AddPolicyDialog
              clientId={client.id}
              clientName={client.name}
              trigger={
                <Button className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white px-6 py-2">
                  <FileText className="mr-2 h-4 w-4" />
                  Registrar apólice
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{client._count.insurances}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Apólices cadastradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{client._count.conversations}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Conversas abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seguros Contratados */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Seguros contratados</h2>
          
          <div className="grid gap-3">
            {client.insurances.reduce((acc: any[], insurance: any) => {
              const existing = acc.find(item => item.insuranceType.name === insurance.insuranceType.name)
              if (!existing) {
                acc.push(insurance)
              }
              return acc
            }, []).map((insurance: any) => (
              <Card key={insurance.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${insurance.insuranceType.color}`}>
                        {getIcon(insurance.insuranceType.icon, "h-5 w-5 text-white")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{insurance.insuranceType.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {insurance.insurer.name}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1">
                      <Download className="mr-1 h-3 w-3" />
                      Baixar apólice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mapa de Seguros do Cliente */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Mapa de seguros do cliente</h2>
          
          <Card>
            <CardContent className="p-6">
              <InsuranceMap client={client} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seguros para Recomendar */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Seguros para recomendar</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {client.recommendedInsurances.map((insurance: any) => (
            <Card key={insurance.id} className="hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    {getIcon(insurance.icon, "h-6 w-6 text-gray-600 group-hover:text-primary")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{insurance.name}</h3>
                    <p className="text-xs text-muted-foreground">{insurance.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-3">
            <Button onClick={handlePhoneClick} variant="outline" className="flex-1 max-w-xs" size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Ligar
            </Button>
            <Button onClick={handleEmailClick} variant="outline" className="flex-1 max-w-xs" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Enviar email
            </Button>
            <Button onClick={handleWhatsAppClick} className="flex-1 max-w-xs bg-green-600 hover:bg-green-700 text-white" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
