"use client"

import * as React from "react"
import { Plus, Search, Filter, Building, Users, MapPin, Phone, Mail, FileText, Eye, Pencil, Trash2, RotateCcw, Settings, SortAsc, SortDesc, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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
import { api } from "@/trpc/react"

// Tipos de dados baseados no Prisma
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

// Funções de máscara
const phoneMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1')
}

const cnpjMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

// Funções para remover máscara (para envio ao backend)
const removeMask = (value: string) => {
  return value.replace(/\D/g, '')
}

// Função para validar CNPJ
const isValidCNPJ = (cnpj: string) => {
  const cleanCNPJ = removeMask(cnpj)
  
  if (cleanCNPJ.length !== 14) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false
  
  // Validação dos dígitos verificadores
  let tamanho = cleanCNPJ.length - 2
  let numeros = cleanCNPJ.substring(0, tamanho)
  const digitos = cleanCNPJ.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false
  
  tamanho = tamanho + 1
  numeros = cleanCNPJ.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  
  return resultado === parseInt(digitos.charAt(1))
}

// Função para validar telefone
const isValidPhone = (phone: string) => {
  const cleanPhone = removeMask(phone)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11
}

export default function Offices() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<boolean | undefined>()
  const [sortOrder, setSortOrder] = React.useState<string>("default")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Queries tRPC
  const { data: queryResponse, isLoading } = api.offices.getAll.useQuery({
    search: search || undefined,
    isActive: statusFilter,
    limit: 50,
    offset: 0
  })

  const { data: stats } = api.offices.getStats.useQuery()

  // Aplicar ordenação customizada aos dados
  const sortedData = React.useMemo(() => {
    if (!queryResponse?.data) return []
    
    const data = [...queryResponse.data]
    
    switch (sortOrder) {
      case "name-asc":
        return data.sort((a, b) => a.name.localeCompare(b.name))
      case "name-desc":
        return data.sort((a, b) => b.name.localeCompare(a.name))
      case "created-asc":
        return data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "created-desc":
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "advisors-asc":
        return data.sort((a, b) => a._count.advisors - b._count.advisors)
      case "advisors-desc":
        return data.sort((a, b) => b._count.advisors - a._count.advisors)
      case "status":
        return data.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1
          if (!a.isActive && b.isActive) return 1
          return 0
        })
      default:
        return data
    }
  }, [queryResponse?.data, sortOrder])

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Escritórios</h1>
          <p className="text-muted-foreground">
            Gerencie os escritórios parceiros da plataforma
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Escritório
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.total ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Escritórios</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">+{stats?.recent ?? 0}</span> novos esta semana
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-green-500/15 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600 mb-1">{stats?.active ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Escritórios Ativos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">
                  {stats?.total ? ((stats.active / stats.total) * 100).toFixed(1) : '0'}%
                </span> do total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/15 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 mb-1">{stats?.withAdvisors ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Com Assessores</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-blue-600 font-medium">Escritórios operacionais</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500/15 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-orange-600 mb-1">{stats?.recent ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Escritórios</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-orange-600 font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro e Busca */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Filtros e Busca</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar escritórios específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar escritórios..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10 max-w-sm bg-background border-input"
                />
              </div>

              <Select
                value={statusFilter === undefined ? "all" : statusFilter.toString()}
                onValueChange={(value) => {
                  if (value === "all") {
                    setStatusFilter(undefined)
                  } else {
                    setStatusFilter(value === "true")
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
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value)}
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
                  <SelectItem value="advisors-desc">
                    <div className="flex items-center gap-2">
                      <SortDesc className="h-4 w-4" />
                      Mais Assessores
                    </div>
                  </SelectItem>
                  <SelectItem value="advisors-asc">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      Menos Assessores
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
        </CardContent>
      </Card>

      {/* Grid de Cards dos Escritórios */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedData.map((office) => (
            <OfficeCard key={office.id} office={office} />
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum escritório encontrado
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {search || statusFilter !== undefined
                ? "Tente ajustar os filtros para encontrar escritórios."
                : "Comece adicionando o primeiro escritório à plataforma."
              }
            </p>
            {!search && statusFilter === undefined && (
              <Button 
                className="mt-4" 
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Escritório
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação/Edição */}
      <EditDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}

// Componente do Card do Escritório
function OfficeCard({ office }: { office: Office }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.offices.delete.useMutation({
    onSuccess: () => {
      toast.success(`🔒 ${office.name} desativado!`, {
        description: "O escritório foi desativado com sucesso e pode ser reativado posteriormente.",
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: office.id })
          }
        }
      })
      utils.offices.getAll.invalidate()
      utils.offices.getStats.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao desativar`, {
        description: error.message
      })
    }
  })

  const reactivateMutation = api.offices.reactivate.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${office.name} reativado!`, {
        description: "O escritório foi reativado e está disponível novamente.",
        action: {
          label: "Ver Detalhes",
          onClick: () => setViewDialogOpen(true)
        }
      })
      utils.offices.getAll.invalidate()
      utils.offices.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao reativar`, {
        description: error.message
      })
    }
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id: office.id })
  }

  const handleReactivate = () => {
    reactivateMutation.mutate({ id: office.id })
  }

  return (
    <>
      <Card className={`group border-border hover:shadow-lg transition-all duration-300 ${
        office.isActive 
          ? 'hover:border-secondary/50 bg-gradient-to-br from-card to-card/50' 
          : 'opacity-75 bg-gradient-to-br from-muted/50 to-muted/20'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                office.isActive ? 'bg-secondary' : 'bg-muted'
              }`}>
                <Building className={`h-6 w-6 ${office.isActive ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-foreground">{office.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={office.isActive ? "default" : "secondary"} className={
                    office.isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }>
                    {office.isActive ? "Ativo" : "Inativo"}
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
                {office.isActive ? (
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
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações de Contato */}
          <div className="space-y-2">
            {office.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="truncate">{office.address}</span>
              </div>
            )}
            {office.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-secondary" />
                <span>{office.phone}</span>
              </div>
            )}
            {office.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="truncate">{office.email}</span>
              </div>
            )}
            {office.cnpj && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 text-secondary" />
                <span>CNPJ: {office.cnpj}</span>
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {office._count.advisors} assessor{office._count.advisors !== 1 ? 'es' : ''}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(office.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Botão de Ação Principal */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => setViewDialogOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver Mais
            </Button>
            <Button 
              asChild
              variant="outline"
              className="border-secondary/20 text-secondary hover:bg-secondary/10"
            >
              <Link href={`/offices/${office.id}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Página
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ViewDialog 
        office={office}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditDialog 
        office={office}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o escritório "{office.name}"? 
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

// Componente para visualizar detalhes do escritório
function ViewDialog({ 
  office, 
  open, 
  onOpenChange 
}: { 
  office: Office
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.offices.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.success(`🗑️ ${data.name} foi deletado permanentemente!`, {
        description: "Esta ação não pode ser desfeita."
      })
      utils.offices.getAll.invalidate()
      utils.offices.getStats.invalidate()
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
    permanentDeleteMutation.mutate({ id: office.id })
  }

  const canPermanentDelete = !office.isActive && office._count.advisors === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {office.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={office.isActive ? "default" : "secondary"} className={
                  office.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {office.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {office._count.advisors} assessores
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações de Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {office.address || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {office.phone || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {office.email || "Não informado"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {office.cnpj || "Não informado"}
                  </p>
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
                      <p className="text-sm text-muted-foreground">Total de Assessores</p>
                      <p className="text-2xl font-bold text-secondary">{office._count.advisors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-green-600">
                        {office.isActive ? "Ativo" : "Inativo"}
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
                <label className="text-sm font-medium text-muted-foreground">ID do Escritório</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <code className="text-sm font-mono text-foreground break-all">{office.id}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(office.createdAt).toLocaleDateString('pt-BR', {
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
                    {new Date(office.updatedAt).toLocaleDateString('pt-BR', {
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
                <label className="text-sm font-medium text-muted-foreground">Assessores Vinculados</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {office._count.advisors} {office._count.advisors === 1 ? 'assessor' : 'assessores'}
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
                  navigator.clipboard.writeText(office.id)
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
                  const text = `Escritório: ${office.name}\nEndereço: ${office.address || 'N/A'}\nTelefone: ${office.phone || 'N/A'}\nEmail: ${office.email || 'N/A'}\nCNPJ: ${office.cnpj || 'N/A'}\nStatus: ${office.isActive ? 'Ativo' : 'Inativo'}\nAssessores: ${office._count.advisors}`
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
                  ⚠️ <strong>Deletar Permanentemente:</strong> Esta ação removerá completamente o escritório do sistema e não pode ser desfeita.
                </p>
              </div>
            )}
            
            {!canPermanentDelete && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  ℹ️ <strong>Para deletar permanentemente:</strong> O escritório deve estar inativo e sem assessores vinculados.
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
                Tem certeza que deseja <strong>deletar permanentemente</strong> o escritório "{office.name}"?
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

// Componente para criar/editar escritórios
function EditDialog({ 
  office, 
  open, 
  onOpenChange 
}: { 
  office?: Office
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [name, setName] = React.useState(office?.name ?? "")
  const [address, setAddress] = React.useState(office?.address ?? "")
  const [phone, setPhone] = React.useState(office?.phone ?? "")
  const [email, setEmail] = React.useState(office?.email ?? "")
  const [cnpj, setCnpj] = React.useState(office?.cnpj ?? "")
  const [isActive, setIsActive] = React.useState(office?.isActive ?? true)

  const utils = api.useUtils()
  const isEditing = !!office

  const createMutation = api.offices.create.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} criado!`, {
        description: "O escritório foi criado com sucesso."
      })
      utils.offices.getAll.invalidate()
      utils.offices.getStats.invalidate()
      onOpenChange(false)
      setName("")
      setAddress("")
      setPhone("")
      setEmail("")
      setCnpj("")
      setIsActive(true)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao criar`, {
        description: error.message
      })
    }
  })

  const updateMutation = api.offices.update.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} atualizado!`, {
        description: "O escritório foi atualizado com sucesso."
      })
      utils.offices.getAll.invalidate()
      utils.offices.getStats.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao atualizar`, {
        description: error.message
      })
    }
  })

  // Reset form when dialog opens/closes or office changes
  React.useEffect(() => {
    if (open && office) {
      setName(office.name)
      setAddress(office.address ?? "")
      setPhone(office.phone ?? "")
      setEmail(office.email ?? "")
      setCnpj(office.cnpj ?? "")
      setIsActive(office.isActive)
    } else if (open && !office) {
      setName("")
      setAddress("")
      setPhone("")
      setEmail("")
      setCnpj("")
      setIsActive(true)
    }
  }, [office, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do escritório."
      })
      return
    }

    if (name.trim().length < 3) {
      toast.error("❌ Nome muito curto", {
        description: "O nome deve ter pelo menos 3 caracteres."
      })
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Email inválido", {
        description: "Por favor, digite um email válido."
      })
      return
    }

    // Validação do telefone se preenchido
    if (phone && !isValidPhone(phone)) {
      toast.error("❌ Telefone inválido", {
        description: "Por favor, digite um telefone válido com 10 ou 11 dígitos."
      })
      return
    }

    // Validação do CNPJ se preenchido
    if (cnpj && !isValidCNPJ(cnpj)) {
      toast.error("❌ CNPJ inválido", {
        description: "Por favor, digite um CNPJ válido."
      })
      return
    }

    const data = {
      name: name.trim(),
      address: address.trim() || undefined,
      phone: phone ? removeMask(phone) : undefined,
      email: email.trim() || undefined,
      cnpj: cnpj ? removeMask(cnpj) : undefined,
    }

    if (isEditing) {
      updateMutation.mutate({
        id: office.id,
        ...data,
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

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const maskedValue = cnpjMask(value)
    setCnpj(maskedValue)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header com Ícone */}
          <DialogHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/80">
                {isEditing ? (
                  <Pencil className="h-6 w-6 text-white" />
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {isEditing ? "Editar Escritório" : "Novo Escritório"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing 
                    ? "Atualize as informações do escritório abaixo."
                    : "Preencha as informações para criar um novo escritório."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-secondary" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nome do Escritório *
                </Label>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Escritório Central, Filial São Paulo..."
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 3 caracteres. Este será o nome principal do escritório.
              </p>
            </div>
            
            {/* Campo Endereço */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <Label htmlFor="address" className="text-sm font-semibold text-foreground">
                  Endereço
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade, estado..."
                rows={2}
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20 resize-none"
                maxLength={200}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Endereço completo do escritório.
                </p>
                <span className="text-xs text-muted-foreground">
                  {address.length}/200
                </span>
              </div>
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email
                  </Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@escritorio.com"
                  disabled={isLoading}
                  className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Campo CNPJ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-secondary" />
                <Label htmlFor="cnpj" className="text-sm font-semibold text-foreground">
                  CNPJ
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={handleCnpjChange}
                placeholder="00.000.000/0000-00"
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
                maxLength={18}
              />
            </div>

            {/* Campo Status - apenas para edição */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Status do Escritório
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
                      Escritório Ativo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive 
                        ? "Este escritório estará disponível para operações." 
                        : "Este escritório ficará inativo e não poderá ser usado."
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
            {!isEditing && (name.trim() || address.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Pré-visualização
                  </Label>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                      <Building className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome do Escritório"}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                  {address.trim() && (
                    <p className="text-sm text-muted-foreground leading-relaxed flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {address.trim()}
                    </p>
                  )}
                  {(phone.trim() || email.trim()) && (
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {phone.trim() && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {phone.trim()}
                        </span>
                      )}
                      {email.trim() && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {email.trim()}
                        </span>
                      )}
                    </div>
                  )}
                  {cnpj.trim() && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      CNPJ: {cnpj.trim()}
                    </div>
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
              disabled={isLoading || !name.trim()}
              className="text-white flex-1 sm:flex-none"
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
                      Atualizar Escritório
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Criar Escritório
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