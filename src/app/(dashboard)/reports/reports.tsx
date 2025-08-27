"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Building2,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Award,
  DollarSign,
  Phone,
  Mail,
  Download,
  Filter,
  RefreshCw,
  UserPlus
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import TitlePage from "@/components/title-page"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Line,
  LineChart
} from "recharts"

// Dados mockados para os gráficos
const clientGrowthData = [
  { month: "Jan", clients: 45, newClients: 8, policies: 87 },
  { month: "Fev", clients: 52, newClients: 7, policies: 94 },
  { month: "Mar", clients: 61, newClients: 9, policies: 108 },
  { month: "Abr", clients: 68, newClients: 7, policies: 115 },
  { month: "Mai", clients: 75, newClients: 7, policies: 128 },
  { month: "Jun", clients: 83, newClients: 8, policies: 142 },
  { month: "Jul", clients: 89, newClients: 6, policies: 156 },
  { month: "Ago", clients: 96, newClients: 7, policies: 168 },
  { month: "Set", clients: 104, newClients: 8, policies: 185 },
  { month: "Out", clients: 112, newClients: 8, policies: 198 },
  { month: "Nov", clients: 119, newClients: 7, policies: 212 },
  { month: "Dez", clients: 127, newClients: 8, policies: 228 }
]

const insuranceTypesData = [
  { name: "Seguro Auto", value: 45, color: "#FF5F07", count: 89 },
  { name: "Seguro Vida", value: 28, color: "#8B5CF6", count: 56 },
  { name: "Seguro Residencial", value: 15, color: "#FF8A4B", count: 30 },
  { name: "Seguro Viagem", value: 8, color: "#A78BFA", count: 16 },
  { name: "Seguro Saúde", value: 4, color: "#FFB07A", count: 8 }
]

const insurersData = [
  { name: "Porto Seguro", policies: 78, percentage: 34, growth: "+12%" },
  { name: "SulAmérica", policies: 52, percentage: 23, growth: "+8%" },
  { name: "Bradesco Seguros", policies: 41, percentage: 18, growth: "+15%" },
  { name: "Allianz", policies: 28, percentage: 12, growth: "+5%" },
  { name: "Zurich", policies: 18, percentage: 8, growth: "+22%" },
  { name: "Mapfre", policies: 11, percentage: 5, growth: "-3%" }
]

const newClientsData = [
  { month: "Jan", newClients: 8, activePolicies: 15, inactivePolicies: 3 },
  { month: "Fev", newClients: 7, activePolicies: 18, inactivePolicies: 2 },
  { month: "Mar", newClients: 9, activePolicies: 22, inactivePolicies: 4 },
  { month: "Abr", newClients: 7, activePolicies: 25, inactivePolicies: 3 },
  { month: "Mai", newClients: 7, activePolicies: 28, inactivePolicies: 2 },
  { month: "Jun", newClients: 8, activePolicies: 32, inactivePolicies: 4 },
  { month: "Jul", newClients: 6, activePolicies: 35, inactivePolicies: 3 },
  { month: "Ago", newClients: 7, activePolicies: 38, inactivePolicies: 2 },
  { month: "Set", newClients: 8, activePolicies: 42, inactivePolicies: 3 },
  { month: "Out", newClients: 8, activePolicies: 45, inactivePolicies: 2 },
  { month: "Nov", newClients: 7, activePolicies: 48, inactivePolicies: 3 },
  { month: "Dez", newClients: 8, activePolicies: 52, inactivePolicies: 2 }
]

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("12m")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  // Calcular métricas resumidas
  const lastClientData = clientGrowthData[clientGrowthData.length - 1]
  const firstClientData = clientGrowthData[0]
  const lastNewClientData = newClientsData[newClientsData.length - 1]
  
  const totalClients = lastClientData?.clients || 0
  const clientGrowth = firstClientData ? ((totalClients - firstClientData.clients) / firstClientData.clients * 100).toFixed(1) : "0"
  const totalPolicies = lastClientData?.policies || 0
  const policyGrowth = firstClientData ? ((totalPolicies - firstClientData.policies) / firstClientData.policies * 100).toFixed(1) : "0"
  
  // Calcular crescimento médio mensal de novos clientes
  const avgNewClients = clientGrowthData.length > 0 ? (clientGrowthData.reduce((acc, curr) => acc + curr.newClients, 0) / clientGrowthData.length).toFixed(1) : "0"
  
  // Calcular total de apólices ativas e inativas
  const totalActivePolicies = lastNewClientData?.activePolicies || 0
  const totalInactivePolicies = lastNewClientData?.inactivePolicies || 0
  const activePercentage = totalActivePolicies + totalInactivePolicies > 0 ? ((totalActivePolicies / (totalActivePolicies + totalInactivePolicies)) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <TitlePage 
          title="Relatórios & Analytics" 
          description="Acompanhe seu desempenho e insights de vendas"
        />
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="24m">Últimos 2 anos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="min-w-[100px]"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white border-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-[#FF5F07]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-[#FF5F07]">{totalClients}</p>
                  <Badge variant="secondary" className="bg-orange-100 text-[#FF5F07]">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{clientGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="h-6 w-6 text-[#FF5F07]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apólices Ativas</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-[#8B5CF6]">{totalPolicies}</p>
                  <Badge variant="secondary" className="bg-purple-100 text-[#8B5CF6]">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{policyGrowth}%
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FF5F07]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos Clientes/Mês</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold" style={{ color: '#FF5F07' }}>{avgNewClients}</p>
                  <Badge variant="secondary" className="bg-orange-100 text-[#FF5F07]">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.5%
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <UserPlus className="h-6 w-6 text-[#FF5F07]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8B5CF6]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Apólices Ativas</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-[#8B5CF6]">{activePercentage}%</p>
                  <Badge variant="secondary" className="bg-purple-100 text-[#8B5CF6]">
                    <Shield className="w-3 h-3 mr-1" />
                    {totalActivePolicies}/{totalActivePolicies + totalInactivePolicies}
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#FF5F07]" />
              Crescimento da Carteira
            </CardTitle>
            <CardDescription>
              Evolução mensal de clientes e apólices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                clients: {
                  label: "Clientes",
                  color: "#FF5F07",
                },
                policies: {
                  label: "Apólices",
                  color: "#8B5CF6",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="clients"
                    stackId="1"
                    stroke="#FF5F07"
                    fill="#FF5F07"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="policies"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Evolução de Novos Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#8B5CF6]" />
              Evolução de Novos Clientes
            </CardTitle>
            <CardDescription>
              Acompanhamento mensal de aquisição de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                newClients: {
                  label: "Novos Clientes",
                  color: "#FF5F07",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newClientsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="newClients" 
                    stroke="#FF5F07" 
                    strokeWidth={3}
                    dot={{ fill: "#FF5F07", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "#FF5F07", stroke: "#8B5CF6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Seguros e Seguradoras */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tipos de Seguros */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#8B5CF6]" />
              Tipos de Seguros
            </CardTitle>
            <CardDescription>
              Distribuição por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Percentual",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={insuranceTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {insuranceTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="space-y-2 mt-4">
              {insuranceTypesData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Seguradoras */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#FF5F07]" />
              Ranking de Seguradoras
            </CardTitle>
            <CardDescription>
              Performance por companhia de seguros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insurersData.map((insurer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF5F07] to-[#FF8A4B] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{insurer.name}</p>
                      <p className="text-sm text-muted-foreground">{insurer.policies} apólices</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{insurer.percentage}%</p>
                      <Badge 
                        variant={insurer.growth.startsWith('+') ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {insurer.growth}
                      </Badge>
                    </div>
                    <div className="w-20">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${insurer.percentage}%` }}
                        />
                      </div>
                    </div>
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