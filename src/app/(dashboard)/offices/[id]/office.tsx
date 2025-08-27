"use client"

import * as React from "react"
import { ArrowLeft, Building, Users, MapPin, Phone, Mail, FileText, Eye, EyeOff, Pencil, Trash2, RotateCcw, Settings, Plus, Search, Filter, SortAsc, SortDesc, UserPlus, Shield, Star, Clock, Activity, UserCheck, Crown, User, Check, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { UserRole } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/trpc/react"

// Tipos de dados
export type Office = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  cnpj?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    advisors: number
  }
}

export type Advisor = {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  code: string
  avatar?: string | null
  isActive: boolean
  officeId?: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    clients: number
  }
}

export type OfficeAdmin = {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  role: UserRole
  isActive: boolean
  advisorId?: string | null
  createdAt: Date
  updatedAt: Date
  advisor?: {
    id: string
    name: string
    code: string
    officeId?: string | null
  } | null
}

// Função para gerar avatar padrão
const getAvatarFallback = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Função para gerar URLs de avatar aleatórios
const getRandomAvatar = (seed: string) => {
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face&auto=format",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format"
  ]
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatars.length
  return avatars[index]
}

// Máscaras para telefone e CPF
const phoneMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1')
}

const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

const removeMask = (value: string) => {
  return value.replace(/\D/g, '')
}

// Componente de Input de Senha com validação
const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder, 
  disabled, 
  className,
  showValidation = true 
}: {
  id: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showValidation?: boolean
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  
  // Critérios de validação da senha
  const hasMinLength = value.length >= 8
  const hasUppercase = /[A-Z]/.test(value)
  const hasLowercase = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value)
  
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          minLength={8}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      
      {showValidation && value && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Critérios da senha:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-red-500'}`}>
              {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Mínimo 8 caracteres</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
              {hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Letra maiúscula</span>
            </div>
            <div className={`flex items-center gap-1 ${hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
              {hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Letra minúscula</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-red-500'}`}>
              {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>Número</span>
            </div>
          </div>
          {isValid && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
              <Check className="h-3 w-3" />
              <span>Senha válida!</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Office({ officeId }: { officeId: string }) {
  const router = useRouter()
  const [advisorSearch, setAdvisorSearch] = React.useState("")
  const [advisorStatusFilter, setAdvisorStatusFilter] = React.useState<boolean | undefined>()
  const [advisorSortOrder, setAdvisorSortOrder] = React.useState<string>("default")
  const [createAdvisorDialogOpen, setCreateAdvisorDialogOpen] = React.useState(false)

  const [adminSearch, setAdminSearch] = React.useState("")
  const [adminStatusFilter, setAdminStatusFilter] = React.useState<boolean | undefined>()
  const [adminSortOrder, setAdminSortOrder] = React.useState<string>("default")
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = React.useState(false)

  // Query para buscar o escritório
  const { data: office, isLoading: officeLoading } = api.offices.getById.useQuery({
    id: officeId
  })

  // Queries tRPC
  const { data: advisorsResponse, isLoading: advisorsLoading } = api.advisors.getByOfficeId.useQuery({
    officeId: officeId,
    search: advisorSearch || undefined,
    isActive: advisorStatusFilter,
    limit: 50,
    offset: 0
  })

  const { data: advisorStats } = api.advisors.getStatsByOffice.useQuery({
    officeId: officeId
  })

  const { data: adminsResponse, isLoading: adminsLoading } = api.users.getOfficeAdminsByOfficeId.useQuery({
    officeId: officeId,
    search: adminSearch || undefined,
    isActive: adminStatusFilter,
    limit: 50,
    offset: 0
  })

  const { data: adminStats } = api.users.getOfficeAdminStatsByOffice.useQuery({
    officeId: officeId
  })

  // Aplicar ordenação customizada aos assessores
  const sortedAdvisors = React.useMemo(() => {
    if (!advisorsResponse?.data) return []
    
    const data = [...advisorsResponse.data]
    
    switch (advisorSortOrder) {
      case "name-asc":
        return data.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return data.sort((a, b) => b.name.localeCompare(a.name))
      case "created-asc":
        return data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "created-desc":
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "clients-asc":
        return data.sort((a, b) => a._count.clients - b._count.clients)
      case "clients-desc":
        return data.sort((a, b) => b._count.clients - a._count.clients)
      case "status":
        return data.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1
          if (!a.isActive && b.isActive) return 1
          return 0
        })
      default:
        return data
    }
  }, [advisorsResponse?.data, advisorSortOrder])

  // Aplicar ordenação customizada aos administradores
  const sortedAdmins = React.useMemo(() => {
    if (!adminsResponse?.data) return []
    
    const data = [...adminsResponse.data]
    
    switch (adminSortOrder) {
      case "name-asc":
        return data.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return data.sort((a, b) => b.name.localeCompare(a.name))
      case "created-asc":
        return data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "created-desc":
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "status":
        return data.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1
          if (!a.isActive && b.isActive) return 1
          return 0
        })
      default:
        return data
    }
  }, [adminsResponse?.data, adminSortOrder])

  // Loading state
  if (officeLoading || !office) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-input bg-background hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-input bg-background hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Building className="h-6 w-6 text-white" />
              </div>
              {office.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as informações e equipe deste escritório
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={office.isActive ? "default" : "secondary"} className={
            office.isActive 
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
          }>
            {office.isActive ? "Ativo" : "Inativo"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            ID: {office.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Informações Básicas do Escritório */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-secondary" />
            Informações do Escritório
          </CardTitle>
          <CardDescription>
            Dados cadastrais e de contato do escritório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Endereço</label>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-foreground">
                    {office.address || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Telefone</label>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-foreground">
                    {office.phone || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-foreground">
                    {office.email || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  <p className="text-sm text-foreground">
                    {office.cnpj || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <div className="text-sm text-muted-foreground">
              <strong>Criado em:</strong> {new Date(office.createdAt).toLocaleDateString('pt-BR')} | 
              <strong> Atualizado em:</strong> {new Date(office.updatedAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {office._count.advisors} assessor{office._count.advisors !== 1 ? 'es' : ''} vinculado{office._count.advisors !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas dos Assessores */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{advisorStats?.total ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Assessores</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">+{advisorStats?.recent ?? 0}</span> novos esta semana
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-green-500/15 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600 mb-1">{advisorStats?.active ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Assessores Ativos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">
                  {advisorStats?.total ? ((advisorStats.active / advisorStats.total) * 100).toFixed(1) : '0'}%
                </span> do total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/15 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 mb-1">{advisorStats?.withClients ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Com Clientes</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-blue-600 font-medium">Assessores produtivos</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500/15 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-600 mb-1">{advisorStats?.recent ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Assessores</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-orange-600 font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Assessores */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Assessores do Escritório
              </CardTitle>
              <CardDescription>
                Gerencie a equipe de assessores deste escritório
              </CardDescription>
            </div>
            <Dialog open={createAdvisorDialogOpen} onOpenChange={setCreateAdvisorDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Assessor
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controles de Busca e Filtro */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar assessores..."
                  value={advisorSearch}
                  onChange={(event) => setAdvisorSearch(event.target.value)}
                  className="pl-10 max-w-sm bg-background border-input"
                />
              </div>

              <Select
                value={advisorStatusFilter === undefined ? "all" : advisorStatusFilter.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setAdvisorStatusFilter(undefined)
                  } else {
                    setAdvisorStatusFilter(value === "true")
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-background border-input">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={advisorSortOrder}
                onValueChange={(value) => setAdvisorSortOrder(value)}
              >
                <SelectTrigger className="w-[220px] bg-background border-input">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Ordenar por..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Padrão
                    </div>
                  </SelectItem>
                  <SelectItem value="name-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Nome (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Nome (Z-A)
                    </div>
                  </SelectItem>
                  <SelectItem value="created-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Mais Recentes
                    </div>
                  </SelectItem>
                  <SelectItem value="created-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Mais Antigos
                    </div>
                  </SelectItem>
                  <SelectItem value="clients-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Mais Clientes
                    </div>
                  </SelectItem>
                  <SelectItem value="clients-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Menos Clientes
                    </div>
                  </SelectItem>
                  <SelectItem value="status">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ativos Primeiro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de Cards dos Assessores */}
          {advisorsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedAdvisors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedAdvisors.map((advisor) => (
                <AdvisorCard key={advisor.id} advisor={advisor} office={office} />
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum assessor encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {advisorSearch || advisorStatusFilter !== undefined
                    ? "Tente ajustar os filtros para encontrar assessores."
                    : "Comece adicionando o primeiro assessor ao escritório."
                  }
                </p>
                {!advisorSearch && advisorStatusFilter === undefined && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setCreateAdvisorDialogOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Assessor
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição de Assessor */}
      <AdvisorEditDialog 
        open={createAdvisorDialogOpen} 
        onOpenChange={setCreateAdvisorDialogOpen}
        officeId={office.id}
      />

      {/* Seção de Administradores do Escritório */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-secondary" />
                Administradores do Escritório
              </CardTitle>
              <CardDescription>
                Gerencie os usuários administradores deste escritório
              </CardDescription>
            </div>
            <Dialog open={createAdminDialogOpen} onOpenChange={setCreateAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Adicionar Admin
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estatísticas dos Administradores */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="border-0 bg-gradient-to-br from-purple-500/15 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{adminStats?.total ?? 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Total Admins</h4>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-purple-600 font-medium">+{adminStats?.recent ?? 0}</span> novos
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-green-500/15 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{adminStats?.active ?? 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Ativos</h4>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 font-medium">
                      {adminStats?.total ? ((adminStats.active / adminStats.total) * 100).toFixed(1) : '0'}%
                    </span> do total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-500/15 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{adminStats?.withAdvisor ?? 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Com Assessor</h4>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-600 font-medium">Vínculo específico</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-orange-500/15 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{adminStats?.recent ?? 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Recentes</h4>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-orange-600 font-medium">Esta semana</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles de Busca e Filtro para Admins */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar administradores..."
                  value={adminSearch}
                  onChange={(event) => setAdminSearch(event.target.value)}
                  className="pl-10 max-w-sm bg-background border-input"
                />
              </div>

              <Select
                value={adminStatusFilter === undefined ? "all" : adminStatusFilter.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setAdminStatusFilter(undefined)
                  } else {
                    setAdminStatusFilter(value === "true")
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-background border-input">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={adminSortOrder}
                onValueChange={(value) => setAdminSortOrder(value)}
              >
                <SelectTrigger className="w-[220px] bg-background border-input">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Ordenar por..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Padrão
                    </div>
                  </SelectItem>
                  <SelectItem value="name-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Nome (A-Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="name-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Nome (Z-A)
                    </div>
                  </SelectItem>
                  <SelectItem value="created-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Mais Recentes
                    </div>
                  </SelectItem>
                  <SelectItem value="created-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Mais Antigos
                    </div>
                  </SelectItem>
                  <SelectItem value="status">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Ativos Primeiro
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de Cards dos Administradores */}
          {adminsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedAdmins.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedAdmins.map((admin) => (
                <OfficeAdminCard key={admin.id} admin={admin} office={office} />
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Crown className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum administrador encontrado
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {adminSearch || adminStatusFilter !== undefined
                    ? "Tente ajustar os filtros para encontrar administradores."
                    : "Comece adicionando o primeiro administrador ao escritório."
                  }
                </p>
                {!adminSearch && adminStatusFilter === undefined && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setCreateAdminDialogOpen(true)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Admin
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição de Admin */}
      <OfficeAdminEditDialog 
        officeId={office.id}
        open={createAdminDialogOpen} 
        onOpenChange={setCreateAdminDialogOpen}
      />

      {/* Dialog de Criação/Edição de Assessor */}
      <AdvisorEditDialog 
        open={createAdvisorDialogOpen} 
        onOpenChange={setCreateAdvisorDialogOpen}
        officeId={office.id}
      />
    </div>
  )
}

// Componente do Card do Assessor
function AdvisorCard({ advisor, office }: { advisor: Advisor; office: Office }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.advisors.delete.useMutation({
    onSuccess: () => {
      toast.success(`🔒 ${advisor.name} desativado!`, {
        description: "O assessor foi desativado com sucesso e pode ser reativado posteriormente.",
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: advisor.id })
          }
        }
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao desativar`, {
        description: error.message
      })
    }
  })

  const reactivateMutation = api.advisors.reactivate.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${advisor.name} reativado!`, {
        description: "O assessor foi reativado e está disponível novamente.",
        action: {
          label: "Ver Detalhes",
          onClick: () => setViewDialogOpen(true)
        }
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao reativar`, {
        description: error.message
      })
    }
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: advisor.id })
  }

  const handleReactivate = () => {
    reactivateMutation.mutate({ id: advisor.id })
  }

  return (
    <>
      <Card className={`group border-border hover:shadow-lg transition-all duration-300 ${
        advisor.isActive 
          ? 'hover:border-secondary/50 bg-gradient-to-br from-card to-card/50' 
          : 'opacity-75 bg-gradient-to-br from-muted/50 to-muted/20'
      }`}>
        <CardContent className="p-6">
          {/* Header do Card */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-secondary/20">
                <AvatarImage 
                  src={advisor.avatar || getRandomAvatar(advisor.id)} 
                  alt={advisor.name}
                />
                <AvatarFallback className="bg-secondary text-white text-lg font-bold">
                  {getAvatarFallback(advisor.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{advisor.name}</h3>
                <p className="text-sm text-muted-foreground">Código: {advisor.code}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={advisor.isActive ? "default" : "secondary"} className={
                    advisor.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }>
                    {advisor.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {advisor.isActive ? (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Desativar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    className="text-green-600 focus:text-green-600"
                    onClick={handleReactivate}
                    disabled={reactivateMutation.isPending}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reativar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="truncate">{advisor.email}</span>
            </div>
            {advisor.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-secondary" />
                <span>{advisor.phone}</span>
              </div>
            )}
            {advisor.cpf && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-secondary" />
                <span>CPF: {advisor.cpf}</span>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {advisor._count.clients} cliente{advisor._count.clients !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(advisor.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Botão de Ação Principal */}
          <Button 
            className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white"
            onClick={() => setViewDialogOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Mais Detalhes
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AdvisorViewDialog 
        advisor={advisor}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <AdvisorEditDialog 
        advisor={advisor}
        officeId={office.id}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o assessor "{advisor.name}"? 
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Componente para visualizar detalhes do assessor
function AdvisorViewDialog({ 
  advisor, 
  open, 
  onOpenChange 
}: { 
  advisor: Advisor
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.advisors.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.success(`🗑️ ${data.name} foi deletado permanentemente!`, {
        description: "Esta ação não pode ser desfeita."
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      onOpenChange(false)
      setPermanentDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao deletar permanentemente`, {
        description: error.message
      })
    }
  })

  const handlePermanentDelete = () => {
    permanentDeleteMutation.mutate({ id: advisor.id })
  }

  const canPermanentDelete = !advisor.isActive && advisor._count.clients === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-secondary/20">
              <AvatarImage 
                src={advisor.avatar || getRandomAvatar(advisor.id)} 
                alt={advisor.name}
              />
              <AvatarFallback className="bg-secondary text-white text-xl font-bold">
                {getAvatarFallback(advisor.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {advisor.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={advisor.isActive ? "default" : "secondary"} className={
                  advisor.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {advisor.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Código: {advisor.code}
                </span>
                <span className="text-sm text-muted-foreground">
                  {advisor._count.clients} clientes
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações de Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-secondary" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">{advisor.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {advisor.phone || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {advisor.cpf || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Código do Assessor</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground font-mono">{advisor.code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Clientes</p>
                      <p className="text-2xl font-bold text-secondary">{advisor._count.clients}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-green-600">
                        {advisor.isActive ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ID do Assessor</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <code className="text-sm font-mono text-foreground break-all">{advisor.id}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(advisor.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(advisor.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric', 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Clientes Vinculados</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {advisor._count.clients} {advisor._count.clients === 1 ? 'cliente' : 'clientes'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Ações Rápidas
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-secondary/20 text-secondary hover:bg-secondary/10"
                onClick={() => {
                  navigator.clipboard.writeText(advisor.id)
                  toast.success("📋 ID copiado!", {
                    description: "ID copiado para a área de transferência"
                  })
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Copiar ID
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                onClick={() => {
                  const text = `Assessor: ${advisor.name}\nCódigo: ${advisor.code}\nEmail: ${advisor.email}\nTelefone: ${advisor.phone || 'N/A'}\nCPF: ${advisor.cpf || 'N/A'}\nStatus: ${advisor.isActive ? 'Ativo' : 'Inativo'}\nClientes: ${advisor._count.clients}`
                  navigator.clipboard.writeText(text)
                  toast.success("📄 Detalhes copiados!", {
                    description: "Informações copiadas para a área de transferência"
                  })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Copiar Detalhes
              </Button>

              {/* Botão de Deletar Permanentemente - só aparece se for elegível */}
              {canPermanentDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                  onClick={() => setPermanentDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Permanentemente
                </Button>
              )}
            </div>

            {/* Aviso sobre deletar permanentemente */}
            {canPermanentDelete && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ <strong>Deletar Permanentemente:</strong> Esta ação removerá completamente o assessor do sistema e não pode ser desfeita.
                </p>
              </div>
            )}
            
            {!canPermanentDelete && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  ℹ️ <strong>Para deletar permanentemente:</strong> O assessor deve estar inativo e sem clientes vinculados.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-input bg-background hover:bg-accent"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>

      {/* Dialog de Confirmação de Deleção Permanente */}
      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Deletar Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja <strong>deletar permanentemente</strong> o assessor "{advisor.name}"?
              </p>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  🚨 Esta ação é irreversível e removerá completamente o registro do sistema.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setPermanentDeleteDialogOpen(false)}
              disabled={permanentDeleteMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {permanentDeleteMutation.isPending ? "Deletando..." : "Deletar Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

// Componente para criar/editar assessores
function AdvisorEditDialog({ 
  advisor, 
  officeId,
  open, 
  onOpenChange 
}: { 
  advisor?: Advisor
  officeId: string
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [name, setName] = React.useState(advisor?.name ?? "")
  const [email, setEmail] = React.useState(advisor?.email ?? "")
  const [phone, setPhone] = React.useState(advisor?.phone ?? "")
  const [cpf, setCpf] = React.useState(advisor?.cpf ?? "")
  const [code, setCode] = React.useState(advisor?.code ?? "")
  const [avatar, setAvatar] = React.useState(advisor?.avatar ?? "")
  const [advisorOfficeId, setAdvisorOfficeId] = React.useState(advisor?.officeId ?? officeId)
  const [isActive, setIsActive] = React.useState(advisor?.isActive ?? true)
  const [password, setPassword] = React.useState("")

  const utils = api.useUtils()
  const isEditing = !!advisor

  const createMutation = api.advisors.create.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} criado!`, {
        description: "O assessor foi criado com sucesso."
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      utils.offices.getById.invalidate()
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao criar`, {
        description: error.message
      })
    }
  })

  const updateMutation = api.advisors.update.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} atualizado!`, {
        description: "O assessor foi atualizado com sucesso."
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      utils.offices.getById.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao atualizar`, {
        description: error.message
      })
    }
  })

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCpf("")
    setCode("")
    setAvatar("")
    setAdvisorOfficeId(officeId)
    setIsActive(true)
    setPassword("")
  }

  // Reset form when dialog opens/closes or advisor changes
  React.useEffect(() => {
    if (open && advisor) {
      setName(advisor.name)
      setEmail(advisor.email)
      setPhone(advisor.phone ?? "")
      setCpf(advisor.cpf ?? "")
      setCode(advisor.code)
      setAvatar(advisor.avatar ?? "")
      setAdvisorOfficeId(advisor.officeId ?? officeId)
      setIsActive(advisor.isActive)
      setPassword("")
    } else if (open && !advisor) {
      resetForm()
    }
  }, [advisor, open, officeId])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do assessor."
      })
      return
    }

    if (!email.trim()) {
      toast.error("❌ Email é obrigatório", {
        description: "Por favor, preencha o email do assessor."
      })
      return
    }

    if (!code.trim()) {
      toast.error("❌ Código é obrigatório", {
        description: "Por favor, preencha o código do assessor."
      })
      return
    }

    if (!isEditing && password) {
      if (password.length < 8) {
        toast.error("❌ Senha muito curta", {
          description: "A senha deve ter pelo menos 8 caracteres."
        })
        return
      }
      
      // Validações adicionais de segurança
      if (!/[A-Z]/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos uma letra maiúscula."
        })
        return
      }
      
      if (!/[a-z]/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos uma letra minúscula."
        })
        return
      }
      
      if (!/\d/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos um número."
        })
        return
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Email inválido", {
        description: "Por favor, digite um email válido."
      })
      return
    }

    if (avatar && !/^https?:\/\/.+/.test(avatar)) {
      toast.error("❌ URL do avatar inválida", {
        description: "Por favor, digite uma URL válida para o avatar."
      })
      return
    }

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? removeMask(phone) : undefined,
      cpf: cpf ? removeMask(cpf) : undefined,
      code: code.trim(),
      avatar: avatar.trim() || undefined,
      officeId: advisorOfficeId || undefined,
      password: password || undefined
    }

    if (isEditing) {
      updateMutation.mutate({
        id: advisor.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? removeMask(phone) : undefined,
        cpf: cpf ? removeMask(cpf) : undefined,
        code: code.trim(),
        avatar: avatar.trim() || undefined,
        officeId: advisorOfficeId || undefined,
        isActive
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const maskedValue = phoneMask(value)
    setPhone(maskedValue)
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const maskedValue = cpfMask(value)
    setCpf(maskedValue)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header com Ícone */}
          <DialogHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-secondary/20">
                <AvatarImage 
                  src={avatar || (advisor ? getRandomAvatar(advisor.id) : undefined)} 
                  alt={name || "Novo assessor"}
                />
                <AvatarFallback className="bg-secondary text-white">
                  {name ? getAvatarFallback(name) : <UserPlus className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {isEditing ? "Editar Assessor" : "Novo Assessor"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing 
                    ? "Atualize as informações do assessor abaixo."
                    : "Preencha as informações para criar um novo assessor."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-secondary" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nome Completo *
                </Label>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva Santos"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@assessor.com"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
            </div>

            {/* Campo Senha - apenas para criação */}
            {!isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Senha
                  </Label>
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha segura"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  showValidation={password.length > 0}
                />
                <p className="text-xs text-muted-foreground">
                  Se não informar uma senha, o usuário deverá configurar uma senha no primeiro acesso.
                </p>
              </div>
            )}

            {/* Campo Código */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" />
                <Label htmlFor="code" className="text-sm font-semibold text-foreground">
                  Código do Assessor *
                </Label>
              </div>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ADV001, ASSESSOR123"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Código único para identificação do assessor.
              </p>
            </div>

            {/* Campos de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Telefone
                  </Label>
                </div>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: (11) 99999-9999
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  <Label htmlFor="cpf" className="text-sm font-semibold text-foreground">
                    CPF
                  </Label>
                </div>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: 000.000.000-00
                </p>
              </div>
            </div>

            {/* Campo Avatar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-secondary" />
                <Label htmlFor="avatar" className="text-sm font-semibold text-foreground">
                  URL do Avatar
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Input
                id="avatar"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://exemplo.com/avatar.jpg"
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
              <p className="text-xs text-muted-foreground">
                URL da imagem de perfil do assessor.
              </p>
            </div>

            {/* Campo Status - apenas para edição */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Status do Assessor
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="isActive" 
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Assessor Ativo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive 
                        ? "Este assessor estará disponível para atender clientes." 
                        : "Este assessor ficará inativo e não poderá atender novos clientes."
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className={
                      isActive 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }
                  >
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Preview Card - apenas para criação quando há dados */}
            {!isEditing && (name.trim() || email.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Pré-visualização
                  </Label>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="h-12 w-12 border-2 border-secondary/20">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="bg-secondary text-white">
                        {name ? getAvatarFallback(name) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome do Assessor"}
                      </h4>
                      {code.trim() && (
                        <p className="text-sm text-muted-foreground">Código: {code.trim()}</p>
                      )}
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                  {email.trim() && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email.trim()}
                    </p>
                  )}
                  {phone.trim() && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {phone.trim()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer com Botões */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-input bg-background hover:bg-accent flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !email.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Atualizando..." : "Criando..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      Atualizar Assessor
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Criar Assessor
                    </>
                  )}
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente do Card do Administrador do Escritório
function OfficeAdminCard({ admin, office }: { admin: OfficeAdmin; office: Office }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.users.delete.useMutation({
    onSuccess: () => {
      toast.success(`🔒 ${admin.name} desativado!`, {
        description: "O administrador foi desativado com sucesso e pode ser reativado posteriormente.",
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: admin.id })
          }
        }
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao desativar`, {
        description: error.message
      })
    }
  })

  const reactivateMutation = api.users.reactivate.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${admin.name} reativado!`, {
        description: "O administrador foi reativado e está disponível novamente.",
        action: {
          label: "Ver Detalhes",
          onClick: () => setViewDialogOpen(true)
        }
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao reativar`, {
        description: error.message
      })
    }
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: admin.id })
  }

  const handleReactivate = () => {
    reactivateMutation.mutate({ id: admin.id })
  }

  return (
    <>
      <Card className={`group border-border hover:shadow-lg transition-all duration-300 ${
        admin.isActive 
          ? 'hover:border-secondary/50 bg-gradient-to-br from-card to-card/50' 
          : 'opacity-75 bg-gradient-to-br from-muted/50 to-muted/20'
      }`}>
        <CardContent className="p-6">
          {/* Header do Card */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-500/20">
                <AvatarImage 
                  src={getRandomAvatar(admin.id)} 
                  alt={admin.name}
                />
                <AvatarFallback className="bg-purple-500 text-white text-lg font-bold">
                  {getAvatarFallback(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{admin.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    <Crown className="mr-1 h-3 w-3" />
                    ADMIN
                  </Badge>
                  <Badge variant={admin.isActive ? "default" : "secondary"} className={
                    admin.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }>
                    {admin.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {admin.advisor && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Assessor: {admin.advisor.name} ({admin.advisor.code})
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewDialogOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {admin.isActive ? (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Desativar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    className="text-green-600 focus:text-green-600"
                    onClick={handleReactivate}
                    disabled={reactivateMutation.isPending}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reativar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-secondary" />
              <span className="truncate">{admin.email}</span>
            </div>
            {admin.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-secondary" />
                <span>{admin.phone}</span>
              </div>
            )}
            {admin.cpf && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-secondary" />
                <span>CPF: {admin.cpf}</span>
              </div>
            )}
          </div>

          {/* Informações do Sistema */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                ID: {admin.id.slice(0, 8)}...
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Botão de Ação Principal */}
          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setViewDialogOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Mais Detalhes
          </Button>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OfficeAdminViewDialog 
        admin={admin}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <OfficeAdminEditDialog 
        admin={admin}
        officeId={office.id}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o administrador "{admin.name}"? 
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Componente para visualizar detalhes do administrador
function OfficeAdminViewDialog({ 
  admin, 
  open, 
  onOpenChange 
}: { 
  admin: OfficeAdmin
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.users.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.success(`🗑️ ${data.name} foi deletado permanentemente!`, {
        description: "Esta ação não pode ser desfeita."
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      onOpenChange(false)
      setPermanentDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao deletar permanentemente`, {
        description: error.message
      })
    }
  })

  const handlePermanentDelete = () => {
    permanentDeleteMutation.mutate({ id: admin.id })
  }

  const canPermanentDelete = !admin.isActive

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-purple-500/20">
              <AvatarImage 
                src={getRandomAvatar(admin.id)} 
                alt={admin.name}
              />
              <AvatarFallback className="bg-purple-500 text-white text-xl font-bold">
                {getAvatarFallback(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {admin.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                  <Crown className="mr-1 h-3 w-3" />
                  OFFICE_ADMIN
                </Badge>
                <Badge variant={admin.isActive ? "default" : "secondary"} className={
                  admin.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {admin.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações de Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-secondary" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">{admin.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {admin.phone || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CPF</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {admin.cpf || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground font-mono">{admin.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Assessor Vinculado */}
          {admin.advisor && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Assessor Vinculado
              </h3>
              <Card className="border-border bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{admin.advisor.name}</p>
                      <p className="text-sm text-muted-foreground">Código: {admin.advisor.code}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ID do Clerk</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <code className="text-sm font-mono text-foreground break-all">{admin.id}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(admin.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(admin.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric', 
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <Badge variant={admin.isActive ? "default" : "secondary"} className={
                    admin.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }>
                    {admin.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Ações Rápidas
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-secondary/20 text-secondary hover:bg-secondary/10"
                onClick={() => {
                  navigator.clipboard.writeText(admin.id)
                  toast.success("📋 ID copiado!", {
                    description: "ID do Clerk copiado para a área de transferência"
                  })
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Copiar ID
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10"
                onClick={() => {
                  const text = `Administrador: ${admin.name}\nEmail: ${admin.email}\nTelefone: ${admin.phone || 'N/A'}\nCPF: ${admin.cpf || 'N/A'}\nTipo: ${admin.role}\nStatus: ${admin.isActive ? 'Ativo' : 'Inativo'}\nAssessor: ${admin.advisor ? `${admin.advisor.name} (${admin.advisor.code})` : 'Nenhum'}`
                  navigator.clipboard.writeText(text)
                  toast.success("📄 Detalhes copiados!", {
                    description: "Informações copiadas para a área de transferência"
                  })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Copiar Detalhes
              </Button>

              {/* Botão de Deletar Permanentemente - só aparece se for elegível */}
              {canPermanentDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 text-red-600 hover:bg-red-500/10"
                  onClick={() => setPermanentDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Permanentemente
                </Button>
              )}
            </div>

            {/* Aviso sobre deletar permanentemente */}
            {canPermanentDelete && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ <strong>Deletar Permanentemente:</strong> Esta ação removerá completamente o administrador do sistema e não pode ser desfeita.
                </p>
              </div>
            )}
            
            {!canPermanentDelete && admin.isActive && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  ℹ️ <strong>Para deletar permanentemente:</strong> O administrador deve estar inativo.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-input bg-background hover:bg-accent"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>

      {/* Dialog de Confirmação de Deleção Permanente */}
      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Deletar Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja <strong>deletar permanentemente</strong> o administrador "{admin.name}"?
              </p>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  🚨 Esta ação é irreversível e removerá completamente o registro do sistema.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setPermanentDeleteDialogOpen(false)}
              disabled={permanentDeleteMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {permanentDeleteMutation.isPending ? "Deletando..." : "Deletar Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

// Componente para criar/editar administradores
function OfficeAdminEditDialog({ 
  admin, 
  officeId,
  open, 
  onOpenChange 
}: { 
  admin?: OfficeAdmin
  officeId: string
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [name, setName] = React.useState(admin?.name ?? "")
  const [email, setEmail] = React.useState(admin?.email ?? "")
  const [phone, setPhone] = React.useState(admin?.phone ?? "")
  const [cpf, setCpf] = React.useState(admin?.cpf ?? "")

  const [isActive, setIsActive] = React.useState(admin?.isActive ?? true)
  const [password, setPassword] = React.useState("")

  const utils = api.useUtils()
  const isEditing = !!admin

  const createMutation = api.users.create.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} criado!`, {
        description: "O administrador foi criado com sucesso."
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao criar`, {
        description: error.message
      })
    }
  })

  const updateMutation = api.users.update.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} atualizado!`, {
        description: "O administrador foi atualizado com sucesso."
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao atualizar`, {
        description: error.message
      })
    }
  })

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCpf("")
    setIsActive(true)
    setPassword("")
  }

  // Reset form when dialog opens/closes or admin changes
  React.useEffect(() => {
    if (open && admin) {
      setName(admin.name)
      setEmail(admin.email)
      setPhone(admin.phone ?? "")
      setCpf(admin.cpf ?? "")
      setIsActive(admin.isActive)
      setPassword("")
    } else if (open && !admin) {
      resetForm()
    }
  }, [admin, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do administrador."
      })
      return
    }

    if (!email.trim()) {
      toast.error("❌ Email é obrigatório", {
        description: "Por favor, preencha o email do administrador."
      })
      return
    }

    if (!isEditing && password) {
      if (password.length < 8) {
        toast.error("❌ Senha muito curta", {
          description: "A senha deve ter pelo menos 8 caracteres."
        })
        return
      }
      
      // Validações adicionais de segurança
      if (!/[A-Z]/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos uma letra maiúscula."
        })
        return
      }
      
      if (!/[a-z]/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos uma letra minúscula."
        })
        return
      }
      
      if (!/\d/.test(password)) {
        toast.error("❌ Senha insegura", {
          description: "A senha deve conter pelo menos um número."
        })
        return
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Email inválido", {
        description: "Por favor, digite um email válido."
      })
      return
    }

    const data = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? removeMask(phone) : undefined,
      cpf: cpf ? removeMask(cpf) : undefined,
      role: UserRole.OFFICE_ADMIN,
      officeId: officeId,
      password: password || undefined
    }

    if (isEditing) {
      updateMutation.mutate({
        id: admin.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? removeMask(phone) : undefined,
        cpf: cpf ? removeMask(cpf) : undefined,
        role: UserRole.OFFICE_ADMIN,
        officeId: officeId,
        isActive
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const maskedValue = phoneMask(value)
    setPhone(maskedValue)
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const maskedValue = cpfMask(value)
    setCpf(maskedValue)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header com Ícone */}
          <DialogHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                <AvatarImage 
                  src={admin ? getRandomAvatar(admin.id) : undefined} 
                  alt={name || "Novo administrador"}
                />
                <AvatarFallback className="bg-purple-500 text-white">
                  {name ? getAvatarFallback(name) : <UserCheck className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {isEditing ? "Editar Administrador" : "Novo Administrador"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing 
                    ? "Atualize as informações do administrador abaixo."
                    : "Preencha as informações para criar um novo administrador."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-secondary" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nome Completo *
                </Label>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva Santos"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@escritorio.com"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
            </div>

            {/* Campos de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Telefone
                  </Label>
                </div>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: (11) 99999-9999
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-secondary" />
                  <Label htmlFor="cpf" className="text-sm font-semibold text-foreground">
                    CPF
                  </Label>
                </div>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: 000.000.000-00
                </p>
              </div>
            </div>



            {/* Campo Status - apenas para edição */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Status do Administrador
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-secondary border-gray-300 rounded focus:ring-secondary"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="isActive" 
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Administrador Ativo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive 
                        ? "Este administrador estará disponível para operações." 
                        : "Este administrador ficará inativo e não poderá acessar o sistema."
                      }
                    </p>
                  </div>
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className={
                      isActive 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }
                  >
                    {isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            )}

            {/* Campo Senha - apenas para criação */}
            {!isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Senha
                  </Label>
                  <span className="text-xs text-muted-foreground">(Opcional)</span>
                </div>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha segura"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                  showValidation={password.length > 0}
                />
                <p className="text-xs text-muted-foreground">
                  Se não informar uma senha, o usuário deverá configurar uma senha no primeiro acesso.
                </p>
              </div>
            )}

            {/* Preview Card - apenas para criação quando há dados */}
            {!isEditing && (name.trim() || email.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Pré-visualização
                  </Label>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                      <AvatarFallback className="bg-purple-500 text-white">
                        {name ? getAvatarFallback(name) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome do Administrador"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs">
                          <Crown className="mr-1 h-3 w-3" />
                          OFFICE_ADMIN
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {email.trim() && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {email.trim()}
                    </p>
                  )}
                  {phone.trim() && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {phone.trim()}
                    </p>
                  )}

                </div>
              </div>
            )}
          </div>
          
          {/* Footer com Botões */}
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-input bg-background hover:bg-accent flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !email.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditing ? "Atualizando..." : "Criando..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Pencil className="h-4 w-4" />
                      Atualizar Administrador
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Criar Administrador
                    </>
                  )}
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
