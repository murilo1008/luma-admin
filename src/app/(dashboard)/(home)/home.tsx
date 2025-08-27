"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Dados mock para o dashboard
const metrics = {
  totalUsers: 2340,
  totalBrokers: 168,
  totalPolicies: 4850,
  totalClaims: 289
}

// Dados para o gráfico de crescimento de usuários
const usersChartData = [
  { month: "Julho", users: 1250 },
  { month: "Agosto", users: 1380 },
  { month: "Setembro", users: 1420 },
  { month: "Outubro", users: 1680 },
  { month: "Novembro", users: 1850 },
  { month: "Dezembro", users: 2340 },
]

const usersChartConfig = {
  users: {
    label: "Usuários",
    color: "#B796FF",
  },
} satisfies ChartConfig

// Dados para o gráfico de crescimento de corretores
const brokersChartData = [
  { month: "Julho", brokers: 85 },
  { month: "Agosto", brokers: 92 },
  { month: "Setembro", brokers: 98 },
  { month: "Outubro", brokers: 125 },
  { month: "Novembro", brokers: 142 },
  { month: "Dezembro", brokers: 168 },
]

const brokersChartConfig = {
  brokers: {
    label: "Corretores",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const activeUsers = [
  { id: 1, name: "Jonatas Silva", policies: 23, claims: 12, avatar: "/avatars/user1.jpg" },
  { id: 2, name: "Maria Santos", policies: 18, claims: 8, avatar: "/avatars/user2.jpg" },
  { id: 3, name: "Pedro Costa", policies: 15, claims: 5, avatar: "/avatars/user3.jpg" },
  { id: 4, name: "Ana Oliveira", policies: 21, claims: 9, avatar: "/avatars/user4.jpg" },
  { id: 5, name: "Carlos Mendes", policies: 19, claims: 7, avatar: "/avatars/user5.jpg" },
]

const brokers = [
  { id: 1, name: "Jonatas Silva", company: "Santander", clients: 12, avatar: "/avatars/broker1.jpg" },
  { id: 2, name: "Roberto Lima", company: "BB Corretora", clients: 8, avatar: "/avatars/broker2.jpg" },
  { id: 3, name: "Fernanda Reis", company: "Qualicorp Cons", clients: 15, avatar: "/avatars/broker3.jpg" },
  { id: 4, name: "Lucas Ferreira", company: "Porto Seguro", clients: 10, avatar: "/avatars/broker4.jpg" },
]

export default function Home() {
  return (
    <div className="space-y-8">

      {/* Resumo - Métricas Principais */}
      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Total de Usuários */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 dark:bg-purple-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{new Intl.NumberFormat('pt-BR').format(metrics.totalUsers)}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Usuários ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Corretores */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 dark:bg-blue-600 rounded-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{new Intl.NumberFormat('pt-BR').format(metrics.totalBrokers)}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Corretores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total de Apólices */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 dark:bg-green-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{new Intl.NumberFormat('pt-BR').format(metrics.totalPolicies)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Apólices Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultas ao Chat */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 dark:bg-orange-600 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">12,547</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Consultas ao Chat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos de Crescimento */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de Crescimento de Usuários */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Crescimento de Usuários</CardTitle>
            <CardDescription>Julho - Dezembro 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersChartConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={usersChartData}
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
                      "Usuários"
                    ]}
                  />}
                />
                <Line
                  dataKey="users"
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
              Crescimento de 26% este mês <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Mostrando total de usuários ativos nos últimos 6 meses
            </div>
          </CardFooter>
        </Card>

        {/* Gráfico de Crescimento de Corretores */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Crescimento de Corretores</CardTitle>
            <CardDescription>Julho - Dezembro 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={brokersChartConfig} className="h-[300px] w-full">
              <LineChart
                accessibilityLayer
                data={brokersChartData}
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
                      "Corretores"
                    ]}
                  />}
                />
                <Line
                  dataKey="brokers"
                  type="monotone"
                  stroke="#FF5F07"
                  strokeWidth={3}
                  dot={{
                    fill: "#FF5F07",
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#FF5F07",
                    stroke: "#fff",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium text-foreground">
              Crescimento de 18% este mês <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Mostrando total de corretores nos últimos 6 meses
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Tabelas de Usuários e Corretores */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Usuários Ativos */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Usuários Ativos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome"
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header da tabela */}
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
                <span>Nome</span>
                <span className="text-center">Apólices</span>
                <span className="text-center">Sinistros Acionados</span>
                <span className="text-center">Ações</span>
              </div>
              
              {/* Linhas da tabela */}
              {activeUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-foreground">{user.name}</span>
                  </div>
                  <span className="text-center font-medium text-foreground">{user.policies}</span>
                  <span className="text-center font-medium text-foreground">{user.claims}</span>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white text-xs px-3 py-1 shadow-sm"
                    >
                      Ver mais
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Corretores */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Corretores</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome"
                className="pl-10 bg-background text-foreground border-input"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header da tabela */}
              <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b border-border pb-2">
                <span>Nome</span>
                <span className="text-center">Corretora</span>
                <span className="text-center">Clientes na Luma</span>
                <span className="text-center">Ações</span>
              </div>
              
              {/* Linhas da tabela */}
              {brokers.map((broker) => (
                <div key={broker.id} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={broker.avatar} alt={broker.name} />
                      <AvatarFallback className="bg-muted text-muted-foreground">{broker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-foreground">{broker.name}</span>
                  </div>
                  <span className="text-center text-sm text-muted-foreground">{broker.company}</span>
                  <span className="text-center font-medium text-foreground">{broker.clients}</span>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white text-xs px-3 py-1 shadow-sm"
                    >
                      Ver mais
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
