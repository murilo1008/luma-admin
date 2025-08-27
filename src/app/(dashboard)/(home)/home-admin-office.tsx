"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { 
  Users, 
  UserCheck, 
  FileText, 
  TrendingUp, 
  Search,
  Building,
  Target,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Star,
  Activity,
  Crown
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, BarChart, Bar, ResponsiveContainer, Area, AreaChart } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dados mock para o dashboard do administrador do escritório
const officeMetrics = {
  totalAdvisors: 12,
  activeAdvisors: 10,
  totalClients: 347,
  totalPolicies: 892
}

// Dados para o gráfico de crescimento de clientes do escritório
const clientsGrowthData = [
  { month: "Julho", clients: 245 },
  { month: "Agosto", clients: 268 },
  { month: "Setembro", clients: 289 },
  { month: "Outubro", clients: 312 },
  { month: "Novembro", clients: 328 },
  { month: "Dezembro", clients: 347 },
]

const clientsGrowthConfig = {
  clients: {
    label: "Clientes",
    color: "#B796FF",
  },
} satisfies ChartConfig

// Dados para o gráfico de distribuição de clientes por assessor
const advisorPerformanceData = [
  { name: "João Silva", clients: 45, policies: 98 },
  { name: "Maria Santos", clients: 38, policies: 82 },
  { name: "Pedro Costa", clients: 42, policies: 89 },
  { name: "Ana Oliveira", clients: 35, policies: 76 },
  { name: "Carlos Lima", clients: 40, policies: 85 },
  { name: "Lucia Ferreira", clients: 33, policies: 71 },
]

const performanceConfig = {
  clients: {
    label: "Clientes",
    color: "#FF5F07",
  },
  policies: {
    label: "Apólices",
    color: "#B796FF",
  },
} satisfies ChartConfig

// Assessores mais produtivos
const topAdvisors = [
  { 
    id: 1, 
    name: "João Silva", 
    code: "ADV001",
    clients: 45, 
    policies: 98,
    revenue: 125000,
    avatar: "/avatars/advisor1.jpg",
    trend: "up"
  },
  { 
    id: 2, 
    name: "Pedro Costa", 
    code: "ADV003",
    clients: 42, 
    policies: 89,
    revenue: 118000,
    avatar: "/avatars/advisor2.jpg",
    trend: "up"
  },
  { 
    id: 3, 
    name: "Carlos Lima", 
    code: "ADV005",
    clients: 40, 
    policies: 85,
    revenue: 112000,
    avatar: "/avatars/advisor3.jpg",
    trend: "stable"
  },
  { 
    id: 4, 
    name: "Maria Santos", 
    code: "ADV002",
    clients: 38, 
    policies: 82,
    revenue: 108000,
    avatar: "/avatars/advisor4.jpg",
    trend: "up"
  },
  { 
    id: 5, 
    name: "Ana Oliveira", 
    code: "ADV004",
    clients: 35, 
    policies: 76,
    revenue: 98000,
    avatar: "/avatars/advisor5.jpg",
    trend: "down"
  },
]

// Clientes recentes do escritório
const recentClients = [
  { 
    id: 1, 
    name: "Roberto Silva", 
    advisor: "João Silva",
    joinDate: "Hoje",
    policies: 2,
    status: "novo",
    avatar: "/avatars/client1.jpg"
  },
  { 
    id: 2, 
    name: "Fernanda Costa", 
    advisor: "Maria Santos",
    joinDate: "Ontem",
    policies: 1,
    status: "novo",
    avatar: "/avatars/client2.jpg"
  },
  { 
    id: 3, 
    name: "Lucas Mendes", 
    advisor: "Pedro Costa",
    joinDate: "2 dias",
    policies: 3,
    status: "ativo",
    avatar: "/avatars/client3.jpg"
  },
  { 
    id: 4, 
    name: "Carla Oliveira", 
    advisor: "Ana Oliveira",
    joinDate: "3 dias",
    policies: 1,
    status: "novo",
    avatar: "/avatars/client4.jpg"
  },
  { 
    id: 5, 
    name: "Paulo Santos", 
    advisor: "Carlos Lima",
    joinDate: "5 dias",
    policies: 2,
    status: "ativo",
    avatar: "/avatars/client5.jpg"
  },
]

// Alertas e notificações
const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Meta mensal em risco",
    description: "3 assessores estão abaixo da meta de dezembro",
    priority: "alta",
    icon: Target
  },
  {
    id: 2,
    type: "info",
    title: "Novos clientes esta semana",
    description: "15 novos clientes adicionados pelos assessores",
    priority: "baixa",
    icon: Users
  },
  {
    id: 3,
    type: "success",
    title: "Meta de apólices atingida",
    description: "Escritório atingiu 105% da meta mensal",
    priority: "baixa",
    icon: FileText
  },
  {
    id: 4,
    type: "warning",
    title: "Assessor inativo",
    description: "Lucia Ferreira sem atividade há 5 dias",
    priority: "média",
    icon: AlertCircle
  }
]

export default function HomeAdminOffice() {
  return (
    <div className="space-y-8">

      {/* Resumo - Métricas do Escritório */}
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Total de Assessores */}
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10 border-secondary/20 dark:border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary dark:text-secondary">{officeMetrics.totalAdvisors}</p>
                  <p className="text-sm text-secondary/80 dark:text-secondary/80">Assessores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessores Ativos */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 dark:border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary dark:text-primary">{officeMetrics.activeAdvisors}</p>
                  <p className="text-sm text-primary/80 dark:text-primary/80">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Clientes do Escritório */}
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10 border-secondary/20 dark:border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary dark:text-secondary">{officeMetrics.totalClients}</p>
                  <p className="text-sm text-secondary/80 dark:text-secondary/80">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Apólices */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 dark:border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary dark:text-primary">{officeMetrics.totalPolicies}</p>
                  <p className="text-sm text-primary/80 dark:text-primary/80">Apólices Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Crescimento de Clientes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Crescimento de Clientes do Escritório</CardTitle>
            <CardDescription>Evolução da carteira - Jul a Dez 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={clientsGrowthConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={clientsGrowthData}
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
                  stroke="#B796FF"
                  strokeWidth={3}
                  dot={{
                    fill: "#B796FF",
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#B796FF",
                    stroke: "#fff",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium text-foreground">
              Crescimento de 12% este mês <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Carteira do escritório crescendo consistentemente
            </div>
          </CardFooter>
        </Card>

        {/* Performance dos Assessores */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Performance dos Assessores</CardTitle>
            <CardDescription>Clientes por assessor - Dezembro 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={advisorPerformanceData} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    tickFormatter={(value: string) => value.split(' ')[0] || value}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length && payload[0]) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-sm" style={{ color: "#FF5F07" }}>
                              {payload[0].value} clientes
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="clients" 
                    fill="#FF5F07" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium text-foreground">
              Média de 37 clientes por assessor
            </div>
            <div className="text-muted-foreground leading-none">
              João Silva lidera com 45 clientes
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Assessores e Atividades Recentes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Top Assessores */}
        <Card className="border-border xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Star className="h-5 w-5" />
              Assessores Mais Produtivos
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar assessor..."
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header da tabela */}
              <div className="grid grid-cols-6 gap-4 text-xs font-medium text-muted-foreground border-b border-border pb-2">
                <span className="col-span-2">Assessor</span>
                <span className="text-center">Clientes</span>
                <span className="text-center">Apólices</span>
                <span className="text-center">Receita</span>
                <span className="text-center">Trend</span>
              </div>
              
              {/* Linhas da tabela */}
              {topAdvisors.map((advisor, index) => (
                <div key={advisor.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-border/50 last:border-0">
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={advisor.avatar} alt={advisor.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {advisor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-xs text-foreground">{advisor.name}</span>
                      <p className="text-xs text-muted-foreground">{advisor.code}</p>
                    </div>
                  </div>
                  <span className="text-center font-medium text-foreground text-xs">{advisor.clients}</span>
                  <span className="text-center font-medium text-foreground text-xs">{advisor.policies}</span>
                  <span className="text-center font-medium text-foreground text-xs">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(advisor.revenue)}
                  </span>
                  <div className="flex justify-center">
                    <Badge variant={
                      advisor.trend === 'up' ? 'default' :
                      advisor.trend === 'stable' ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {advisor.trend === 'up' ? '↗️' : advisor.trend === 'stable' ? '→' : '↘️'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button className="w-full" variant="outline" size="sm">
                Ver Todos os Assessores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes e Alertas */}
        <div className="space-y-6">
          {/* Clientes Recentes */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Clientes Recentes</CardTitle>
              <CardDescription>Novos clientes do escritório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-xs text-foreground">{client.name}</p>
                        <p className="text-xs text-muted-foreground">via {client.advisor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={client.status === 'novo' ? 'default' : 'secondary'} className="text-xs">
                        {client.status === 'novo' ? 'Novo' : 'Ativo'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{client.joinDate}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" size="sm">
                Ver Todos os Clientes
              </Button>
            </CardContent>
          </Card>

          {/* Alertas e Notificações */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertas do Escritório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const IconComponent = alert.icon
                  return (
                    <div key={alert.id} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            alert.priority === 'alta' ? 'bg-destructive/10 text-destructive' :
                            alert.priority === 'média' ? 'bg-primary/10 text-primary' :
                            'bg-secondary/10 text-secondary'
                          }`}>
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-xs text-foreground">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                          </div>
                        </div>
                        <Badge variant={
                          alert.priority === 'alta' ? 'destructive' :
                          alert.priority === 'média' ? 'default' : 'secondary'
                        } className="text-xs">
                          {alert.priority}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button className="w-full mt-4" variant="outline" size="sm">
                Ver Todos os Alertas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
