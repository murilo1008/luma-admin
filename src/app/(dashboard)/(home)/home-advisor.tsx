"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { 
  Users, 
  FileText, 
  TrendingUp, 
  Search,
  Heart,
  Car,
  Home,
  Briefcase,
  Target,
  AlertCircle
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dados mock para o dashboard do advisor
const advisorMetrics = {
  totalClients: 127,
  activePolicies: 284,
  totalClaims: 18
}

// Dados para o gráfico de crescimento de clientes
const clientsChartData = [
  { month: "Julho", clients: 85 },
  { month: "Agosto", clients: 92 },
  { month: "Setembro", clients: 98 },
  { month: "Outubro", clients: 110 },
  { month: "Novembro", clients: 118 },
  { month: "Dezembro", clients: 127 },
]

const clientsChartConfig = {
  clients: {
    label: "Clientes",
    color: "#10B981",
  },
} satisfies ChartConfig

// Dados para o gráfico de apólices por tipo
const policyTypesData = [
  { name: "Seguro de Vida", value: 45, color: "#8B5CF6" },
  { name: "Seguro Auto", value: 32, color: "#06B6D4" },
  { name: "Seguro Residencial", value: 23, color: "#F59E0B" },
  { name: "Seguro Empresarial", value: 15, color: "#EF4444" },
  { name: "Outros", value: 10, color: "#6B7280" },
]

// Clientes mais ativos
const topClients = [
  { id: 1, name: "Maria Silva", policies: 5, lastContact: "2 dias", avatar: "/avatars/client1.jpg" },
  { id: 2, name: "João Santos", policies: 4, lastContact: "5 dias", avatar: "/avatars/client2.jpg" },
  { id: 3, name: "Ana Costa", policies: 3, lastContact: "1 semana", avatar: "/avatars/client3.jpg" },
  { id: 4, name: "Pedro Oliveira", policies: 6, lastContact: "3 dias", avatar: "/avatars/client4.jpg" },
  { id: 5, name: "Carla Mendes", policies: 2, lastContact: "1 dia", avatar: "/avatars/client5.jpg" },
]

// Sugestões de coberturas
const coverageSuggestions = [
  { 
    id: 1, 
    title: "Seguro de Vida com Doenças Graves", 
    description: "35% dos seus clientes não possuem cobertura para doenças graves",
    priority: "alta",
    potentialClients: 44,
    icon: Heart
  },
  { 
    id: 2, 
    title: "Seguro Residencial Completo", 
    description: "Muitos clientes têm apenas cobertura básica",
    priority: "média",
    potentialClients: 28,
    icon: Home
  },
  { 
    id: 3, 
    title: "Seguro Empresarial MEI", 
    description: "Crescimento de microempreendedores na sua carteira",
    priority: "média",
    potentialClients: 15,
    icon: Briefcase
  },
  { 
    id: 4, 
    title: "Assistência 24h Automotiva", 
    description: "Upgrade para clientes de seguro auto básico",
    priority: "baixa",
    potentialClients: 22,
    icon: Car
  },
]

export default function HomeAdvisor() {
  return (
    <div className="space-y-8">

      {/* Resumo - Métricas do Advisor */}
      <div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total de Clientes */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{advisorMetrics.totalClients}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Meus Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apólices Ativas */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{advisorMetrics.activePolicies}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Apólices Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sinistros Abertos */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{advisorMetrics.totalClaims}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Sinistros Abertos</p>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Gráficos e Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Crescimento de Clientes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Crescimento da Carteira</CardTitle>
            <CardDescription>Evolução dos seus clientes - Jul a Dez 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={clientsChartConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={clientsChartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.slice(0, 3)}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent 
                    hideLabel 
                    formatter={(value) => [
                      new Intl.NumberFormat('pt-BR').format(value as number),
                      "Clientes"
                    ]}
                  />}
                />
                <Line
                  dataKey="clients"
                  type="monotone"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{
                    fill: "#10B981",
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#10B981",
                    stroke: "#fff",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium text-foreground">
              Crescimento de 8% este mês <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Sua carteira está crescendo consistentemente
            </div>
          </CardFooter>
        </Card>

        {/* Distribuição por Tipo de Seguro */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Tipos de Apólices na Carteira</CardTitle>
            <CardDescription>Distribuição dos seguros dos seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={policyTypesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {policyTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} apólices ({Math.round((data.value / advisorMetrics.activePolicies) * 100)}%)
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {policyTypesData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sugestões de Coberturas e Top Clientes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Sugestões de Coberturas */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="h-5 w-5" />
              Oportunidades de Venda
            </CardTitle>
            <CardDescription>
              Coberturas que você deveria oferecer aos seus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverageSuggestions.map((suggestion) => {
                const IconComponent = suggestion.icon
                return (
                  <div key={suggestion.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          suggestion.priority === 'alta' ? 'bg-red-500/10 text-red-600' :
                          suggestion.priority === 'média' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                        </div>
                      </div>
                      <Badge variant={
                        suggestion.priority === 'alta' ? 'destructive' :
                        suggestion.priority === 'média' ? 'default' : 'secondary'
                      } className="text-xs">
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {suggestion.potentialClients} clientes potenciais
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver Lista
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Meus Principais Clientes</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar cliente"
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header da tabela */}
              <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                <span>Cliente</span>
                <span className="text-center">Apólices</span>
                <span className="text-center">Último Contato</span>
              </div>
              
              {/* Linhas da tabela */}
              {topClients.map((client) => (
                <div key={client.id} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-xs text-foreground">{client.name}</span>
                  </div>
                  <span className="text-center font-medium text-foreground text-xs">{client.policies}</span>
                  <span className="text-center text-xs text-muted-foreground">{client.lastContact}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button className="w-full" variant="outline" size="sm">
                Ver Todos os Clientes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
