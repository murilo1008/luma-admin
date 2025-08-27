"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search, Filter, UserCheck, Users as UsersIcon, Shield, Eye, Mail, Phone, FileText, Crown, MapPin, Building, Clock, Calendar, CreditCard, DollarSign, CheckCircle, AlertTriangle, X, EyeOff, Check, Pencil, Trash2 } from "lucide-react"
import { api } from "@/trpc/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Tipos de dados - dados reais do banco
export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  role: string
  isActive: boolean
  advisorId: string | null
  createdAt: Date
  updatedAt: Date
  insurancesCount: number
  advisor?: {
    id: string
    name: string
    code: string
  } | null
}

// Tipos para o dialog de detalhes
type UserFullDetails = {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  advisor?: {
    id: string
    name: string
    email: string
    code: string
    offices?: {
      id: string
      name: string
      address: string | null
      phone: string | null
      email: string | null
      cnpj: string | null
    } | null
  } | null
  insurances: Array<{
    id: string
    policyNumber: string
    insurerName: string
    contractNumber: string | null
    startDate: Date
    endDate: Date
    premiumValue: any // Prisma Decimal
    insuredAmount: any // Prisma Decimal
    status: string
    createdAt: Date
    insuranceType: {
      id: string
      name: string
      description: string | null
    }
    insurer: {
      id: string
      name: string
      photoUrl: string | null
    }
    coverages: Array<{
      id: string
      name: string
      description: string | null
      coveredAmount: any // Prisma Decimal
      deductible: any | null // Prisma Decimal
      waitingPeriod: number | null
      conditions: string | null
      exclusions: string | null
      isActive: boolean
    }>
    beneficiaries: Array<{
      id: string
      name: string
      cpf: string
      relationship: string
      percentage: any // Prisma Decimal
      birthDate: Date | null
      phone: string | null
      email: string | null
      address: string | null
      isActive: boolean
    }>
  }>
}

// Função para gerar avatar padrão baseado no nome
const getAvatarFallback = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

// Definição das colunas
export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Usuário
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getAvatarFallback(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground truncate">{user.name}</span>
              {user.advisor && (
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                  {user.advisor.code}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      return <div className="text-foreground">{phone || "-"}</div>
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => {
      const cpf = row.getValue("cpf") as string
      return <div className="text-foreground font-mono">{cpf || "-"}</div>
    },
  },
  {
    accessorKey: "insurancesCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Apólices
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("insurancesCount") as number
      return <div className="text-center font-medium text-foreground">{count}</div>
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "secondary"} className={
          isActive 
            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }>
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div className="text-foreground">{date.toLocaleDateString('pt-BR')}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original

      return <UserActionsCell user={user} />
    },
  },
]

// Componente separado para as ações da célula
function UserActionsCell({ user }: { user: User }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()

  const toggleActiveMutation = api.users.update.useMutation({
    onSuccess: (updatedUser: any) => {
      toast.success(`✅ Usuário ${updatedUser.isActive ? 'ativado' : 'desativado'}!`, {
        description: `${updatedUser.name} foi ${updatedUser.isActive ? 'ativado' : 'desativado'} com sucesso.`,
        action: {
          label: "Desfazer",
          onClick: () => {
            toggleActiveMutation.mutate({ 
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as any,
              isActive: !updatedUser.isActive
            })
          }
        }
      })
      utils.users.getAllUsers.invalidate()
      utils.users.getUserStats.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error: any) => {
      toast.error(`❌ Erro ao ${user.isActive ? 'desativar' : 'ativar'} usuário`, {
        description: error.message
      })
    }
  })

  const handleToggleActive = () => {
    toast.loading(`🔄 ${user.isActive ? 'Desativando' : 'Ativando'} usuário...`, {
      description: `Processando alteração de status do usuário.`,
      id: `toggle-${user.id}`
    })
    toggleActiveMutation.mutate({ 
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      isActive: !user.isActive
    })
  }

  return (
    <>
        <div className="flex items-center gap-2">
          <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDialogOpen(true)}
          className="h-8 px-2 sm:px-3 text-xs sm:text-sm hover:bg-accent/80 transition-all duration-200 transform hover:scale-105 active:scale-95 rounded-full min-w-0 flex-shrink-0"
          >
          <Eye className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Ver Mais</span>
          </Button>
        
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.id)
                  toast.success("📋 ID copiado!", {
                    description: "ID copiado para a área de transferência"
                  })
                }}
                className="cursor-pointer hover:bg-accent"
              >
                Copiar ID do usuário
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent"
                onClick={() => setEditDialogOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar usuário
              </DropdownMenuItem>
              {user.isActive ? (
                <>
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-accent text-destructive focus:text-destructive"
                    onClick={handleToggleActive}
                    disabled={toggleActiveMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {toggleActiveMutation.isPending ? "Desativando..." : "Desativar usuário"}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-accent text-orange-600 focus:text-orange-600"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Desativar com Confirmação
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-accent text-green-600 focus:text-green-600"
                  onClick={handleToggleActive}
                  disabled={toggleActiveMutation.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {toggleActiveMutation.isPending ? "Ativando..." : "Ativar usuário"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      {/* Dialog de Visualização */}
      <UserDetailsDialog 
        userId={user.id}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Dialog de Edição */}
      <UserEditDialog 
        user={user}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => {
          utils.users.getAllUsers.invalidate()
          utils.users.getUserStats.invalidate()
        }}
      />

      {/* Dialog de Confirmação de Desativação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar {user.isActive ? 'Desativação' : 'Ativação'}</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {user.isActive ? 'desativar' : 'ativar'} o usuário "{user.name}"? 
              {user.isActive 
                ? " O usuário perderá acesso à plataforma, mas os dados serão mantidos."
                : " O usuário voltará a ter acesso à plataforma."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={toggleActiveMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
              className={user.isActive ? "bg-destructive hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700"}
            >
              {toggleActiveMutation.isPending 
                ? (user.isActive ? "Desativando..." : "Ativando...") 
                : (user.isActive ? "Desativar" : "Ativar")
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Função para obter status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'EXPIRED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

// Função para traduzir status
const translateStatus = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Ativa'
    case 'EXPIRED':
      return 'Expirada'
    case 'CANCELLED':
      return 'Cancelada'
    case 'SUSPENDED':
      return 'Suspensa'
    default:
      return status
  }
}

// Componente para visualizar detalhes completos do usuário
function UserDetailsDialog({ 
  userId, 
  open, 
  onOpenChange 
}: { 
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const { data: userDetails, isLoading } = api.users.getFullDetails.useQuery(
    { id: userId },
    { enabled: open }
  ) as { data: UserFullDetails | undefined, isLoading: boolean }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Carregando usuário...</DialogTitle>
              <DialogDescription>
                Buscando informações do usuário, aguarde um momento
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[150px] w-full" />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </div>
        ) : userDetails ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {userDetails.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {userDetails.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Informações completas do usuário e suas apólices
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={userDetails.isActive ? "default" : "secondary"} className={
                      userDetails.isActive 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }>
                      {userDetails.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline" className="text-primary">
                      {userDetails.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna da Esquerda - Informações Pessoais */}
              <div className="space-y-6">
                {/* Informações de Contato */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Informações de Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-sm text-foreground">{userDetails.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-sm text-foreground">
                          {userDetails.phone || "Não informado"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-sm text-foreground font-mono">
                          {userDetails.cpf || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações do Advisor/Escritório */}
                {userDetails.advisor && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Advisor Responsável
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome</label>
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-sm text-foreground font-medium">{userDetails.advisor.name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-sm text-foreground">{userDetails.advisor.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Código</label>
                        <div className="p-3 rounded-lg bg-muted/30 border">
                          <p className="text-sm text-foreground font-mono">{userDetails.advisor.code}</p>
                        </div>
                      </div>

                      {userDetails.advisor.offices && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                              <Building className="h-4 w-4 text-primary" />
                              Escritório
                            </h4>
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-sm font-medium text-foreground">{userDetails.advisor.offices.name}</p>
                              {userDetails.advisor.offices.address && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 inline mr-1" />
                                  {userDetails.advisor.offices.address}
                                </p>
                              )}
                              {userDetails.advisor.offices.phone && (
                                <p className="text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3 inline mr-1" />
                                  {userDetails.advisor.offices.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Informações do Sistema */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Informações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-sm text-foreground">
                          {new Date(userDetails.createdAt).toLocaleDateString('pt-BR', {
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
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-sm text-foreground">
                          {new Date(userDetails.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna da Direita - Apólices */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      Apólices de Seguro ({userDetails.insurances.length})
                    </CardTitle>
                    <CardDescription>
                      Todas as apólices vinculadas a este usuário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userDetails.insurances.length > 0 ? (
                      <div className="space-y-6">
                        {userDetails.insurances.map((insurance) => (
                          <div key={insurance.id} className="border rounded-lg p-6 space-y-4">
                            {/* Header da Apólice */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                  <Shield className="h-5 w-5 text-primary" />
                                  {insurance.insuranceType.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {insurance.insuranceType.description}
                                </p>
                              </div>
                              <Badge className={getStatusColor(insurance.status)}>
                                {translateStatus(insurance.status)}
                              </Badge>
                            </div>

                            {/* Informações da Apólice */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Número da Apólice</label>
                                  <p className="text-sm font-mono text-foreground">{insurance.policyNumber}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Seguradora</label>
                                  <p className="text-sm text-foreground">{insurance.insurer.name}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Período</label>
                                  <p className="text-sm text-foreground">
                                    {new Date(insurance.startDate).toLocaleDateString('pt-BR')} até{' '}
                                    {new Date(insurance.endDate).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Valor do Prêmio</label>
                                  <p className="text-sm font-medium text-foreground">
                                    {formatCurrency(Number(insurance.premiumValue))}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Valor Segurado</label>
                                  <p className="text-sm font-medium text-foreground">
                                    {formatCurrency(Number(insurance.insuredAmount))}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">Criado em</label>
                                  <p className="text-sm text-foreground">
                                    {new Date(insurance.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Coberturas */}
                            {insurance.coverages.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Coberturas ({insurance.coverages.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {insurance.coverages.map((coverage) => (
                                    <div key={coverage.id} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                      <h5 className="text-sm font-medium text-foreground">{coverage.name}</h5>
                                      {coverage.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{coverage.description}</p>
                                      )}
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                                          {formatCurrency(Number(coverage.coveredAmount))}
                                        </span>
                                        {coverage.deductible && (
                                          <span className="text-xs text-muted-foreground">
                                            Franquia: {formatCurrency(Number(coverage.deductible))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Beneficiários */}
                            {insurance.beneficiaries.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                                  <UsersIcon className="h-4 w-4 text-blue-600" />
                                  Beneficiários ({insurance.beneficiaries.length})
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {insurance.beneficiaries.map((beneficiary) => (
                                    <div key={beneficiary.id} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                      <h5 className="text-sm font-medium text-foreground">{beneficiary.name}</h5>
                                      <p className="text-xs text-muted-foreground">{beneficiary.relationship}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                                          {Number(beneficiary.percentage)}%
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {beneficiary.cpf}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma apólice encontrada</h3>
                        <p className="text-sm text-muted-foreground">
                          Este usuário ainda não possui apólices cadastradas.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-600">Usuário não encontrado</DialogTitle>
              <DialogDescription>
                Não foi possível carregar os dados deste usuário
              </DialogDescription>
            </DialogHeader>
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Usuário não encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os dados deste usuário.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente para editar usuários
function UserEditDialog({ 
  user,
  open, 
  onOpenChange,
  onSuccess
}: { 
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [phone, setPhone] = React.useState(user.phone ? phoneMask(user.phone) : "")
  const [cpf, setCpf] = React.useState(user.cpf ? cpfMask(user.cpf) : "")
  const [advisorId, setAdvisorId] = React.useState(user.advisorId || "")

  // Buscar todos os advisors ativos para o select
  const { data: advisorsResponse, isLoading: advisorsLoading } = api.advisors.getAll.useQuery({
    isActive: true,
    limit: 100
  })

  const updateMutation = api.users.update.useMutation({
    onSuccess: (data) => {
      toast.dismiss()
      toast.success(`🎉 Usuário atualizado com sucesso!`, {
        description: `${data.name} foi atualizado na plataforma.`,
        action: {
          label: "Ver Perfil",
          onClick: () => {
            // Implementar abertura do perfil se necessário
          }
        }
      })
      onSuccess()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.dismiss()
      toast.error(`❌ Falha ao atualizar usuário`, {
        description: error.message,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            // O usuário pode tentar submeter novamente
          }
        }
      })
    }
  })

  // Reset form when dialog opens/closes or user changes
  React.useEffect(() => {
    if (open) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone ? phoneMask(user.phone) : "")
      setCpf(user.cpf ? cpfMask(user.cpf) : "")
      setAdvisorId(user.advisorId || "")
    }
  }, [open, user])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do usuário."
      })
      return
    }

    if (!email.trim()) {
      toast.error("❌ Email é obrigatório", {
        description: "Por favor, preencha o email do usuário."
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Email inválido", {
        description: "Por favor, digite um email válido."
      })
      return
    }

    const loadingToastId = toast.loading(`👤 Atualizando usuário...`, {
      description: "Salvando alterações do usuário na plataforma. Aguarde um momento."
    })

    updateMutation.mutate({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
      role: user.role as any,
      phone: phone ? removeMask(phone) : undefined,
      cpf: cpf ? removeMask(cpf) : undefined,
      advisorId: (advisorId && advisorId !== "none") ? advisorId : undefined
    })
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

  const isLoading = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header com Ícone */}
          <DialogHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getAvatarFallback(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Editar Usuário
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Atualize as informações do usuário {user.name}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" />
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
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Campos de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
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
                  className="bg-background border-input focus:border-primary focus:ring-primary/20"
                  maxLength={15}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
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
                  className="bg-background border-input focus:border-primary focus:ring-primary/20"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Campo Advisor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <Label htmlFor="advisor" className="text-sm font-semibold text-foreground">
                  Advisor Responsável
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Select
                value={advisorId || undefined}
                onValueChange={(value) => setAdvisorId(value === "none" ? "" : value || "")}
                disabled={isLoading || advisorsLoading}
              >
                <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder={
                    advisorsLoading 
                      ? "Carregando advisors..." 
                      : "Selecione um advisor (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[200px]">
                  <SelectItem value="none" className="text-muted-foreground">
                    Nenhum advisor
                  </SelectItem>
                  {advisorsResponse?.data?.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{advisor.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>#{advisor.code}</span>
                            {advisor.offices && (
                              <>
                                <span>•</span>
                                <span>{advisor.offices.name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{advisor._count.clients} clientes</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Atualizando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Atualizar Usuário
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para criar usuários
function UserCreateDialog({ 
  open, 
  onOpenChange,
  onSuccess
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [cpf, setCpf] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [advisorId, setAdvisorId] = React.useState("")

  // Buscar todos os advisors ativos para o select
  const { data: advisorsResponse, isLoading: advisorsLoading } = api.advisors.getAll.useQuery({
    isActive: true,
    limit: 100
  })

  const createMutation = api.users.create.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`🎉 Usuário criado com sucesso!`, {
        description: `${data.name} foi adicionado à plataforma. Bem-vindo!`,
        action: {
          label: "Ver Perfil",
          onClick: () => {
            // Implementar abertura do perfil se necessário
          }
        }
      })
      onSuccess()
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao criar usuário`, {
        description: error.message,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            // O usuário pode tentar submeter novamente
          }
        }
      })
    }
  })

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCpf("")
    setPassword("")
    setAdvisorId("")
  }

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do usuário."
      })
      return
    }

    if (!email.trim()) {
      toast.error("❌ Email é obrigatório", {
        description: "Por favor, preencha o email do usuário."
      })
      return
    }

    if (password) {
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

    const loadingToastId = toast.loading(`👤 Criando usuário...`, {
      description: "Criando nova conta de usuário na plataforma. Aguarde um momento."
    })

    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? removeMask(phone) : undefined,
      cpf: cpf ? removeMask(cpf) : undefined,
      role: "USER" as any,
      advisorId: (advisorId && advisorId !== "none") ? advisorId : undefined,
      password: password || undefined
    })
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

  const isLoading = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header com Ícone */}
          <DialogHeader className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {name ? getAvatarFallback(name) : <UsersIcon className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Novo Usuário
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Preencha as informações para criar um novo usuário da plataforma.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" />
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
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email *
                </Label>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@email.com"
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Campos de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
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
                  className="bg-background border-input focus:border-primary focus:ring-primary/20"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: (11) 99999-9999
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
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
                  className="bg-background border-input focus:border-primary focus:ring-primary/20"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: 000.000.000-00
                </p>
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
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
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
                showValidation={password.length > 0}
              />
              <p className="text-xs text-muted-foreground">
                Se não informar uma senha, o usuário deverá configurar uma senha no primeiro acesso.
              </p>
            </div>

            {/* Campo Advisor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <Label htmlFor="advisor" className="text-sm font-semibold text-foreground">
                  Advisor Responsável
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Select
                value={advisorId || undefined}
                onValueChange={(value) => setAdvisorId(value === "none" ? "" : value || "")}
                disabled={isLoading || advisorsLoading}
              >
                <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-primary/20">
                  <SelectValue placeholder={
                    advisorsLoading 
                      ? "Carregando advisors..." 
                      : "Selecione um advisor (opcional)"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[200px]">
                  <SelectItem value="none" className="text-muted-foreground">
                    Nenhum advisor
                  </SelectItem>
                  {advisorsResponse?.data?.map((advisor) => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{advisor.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>#{advisor.code}</span>
                            {advisor.offices && (
                              <>
                                <span>•</span>
                                <span>{advisor.offices.name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{advisor._count.clients} clientes</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                O advisor será responsável por este usuário. Se não selecionado, o usuário ficará sem advisor.
              </p>
            </div>

            {/* Preview Card quando há dados */}
            {(name.trim() || email.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Pré-visualização
                  </Label>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {name ? getAvatarFallback(name) : "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome do Usuário"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-primary text-xs">
                          USUÁRIO
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                          Ativo
                        </Badge>
                        {advisorId && advisorId !== "none" && advisorsResponse?.data && (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs">
                            {advisorsResponse.data.find(a => a.id === advisorId)?.code}
                          </Badge>
                        )}
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
                  {advisorId && advisorId !== "none" && advisorsResponse?.data && (() => {
                    const selectedAdvisor = advisorsResponse.data.find(a => a.id === advisorId)
                    return selectedAdvisor ? (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Crown className="h-3 w-3" />
                        Advisor: {selectedAdvisor.name}
                        {selectedAdvisor.offices && (
                          <span className="text-xs">
                            • {selectedAdvisor.offices.name}
                          </span>
                        )}
                      </p>
                    ) : null
                  })()}
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Usuário
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Users() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Buscar dados reais dos usuários
  const { data: usersResponse, isLoading: usersLoading } = api.users.getAllUsers.useQuery({
    search: (columnFilters.find(f => f.id === "name")?.value as string) || undefined,
    isActive: (columnFilters.find(f => f.id === "isActive")?.value as boolean) || undefined,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  })

  // Buscar estatísticas reais
  const { data: stats } = api.users.getUserStats.useQuery()

  // Utils para invalidar queries
  const utils = api.useUtils()

  const table = useReactTable({
    data: usersResponse?.data || [],
    columns,
    pageCount: usersResponse?.total ? Math.ceil(usersResponse.total / pagination.pageSize) : -1,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualFiltering: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.totalUsers ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Usuários</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">+{stats?.newThisWeek ?? 0}</span> novos esta semana
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.activeUsers ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Usuários Ativos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">
                  {stats?.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'}%
                </span> do total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.totalPolicies ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Apólices</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">
                  {stats?.totalUsers ? (stats.totalPolicies / stats.totalUsers).toFixed(1) : '0'}
                </span> por usuário
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.newThisWeek ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Usuários</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Usuários */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os clientes cadastrados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {/* Controles da Tabela */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="pl-10 max-w-sm bg-background border-input"
                  />
                </div>

                <Select
                  value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      table.getColumn("isActive")?.setFilterValue("")
                    } else {
                      table.getColumn("isActive")?.setFilterValue(value === "true")
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
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto border-input bg-background hover:bg-accent">
                    <Filter className="mr-2 h-4 w-4" />
                    Colunas <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      // Mapeamento de nomes das colunas para português
                      const columnNames: Record<string, string> = {
                        name: "Usuário",
                        phone: "Telefone",
                        cpf: "CPF",
                        insurancesCount: "Apólices",
                        isActive: "Status",
                        createdAt: "Data de Criação"
                      }
                      
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="cursor-pointer hover:bg-accent"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {columnNames[column.id] || column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tabela */}
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-border hover:bg-muted/50">
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} className="bg-muted/30">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    // Estados de loading
                    Array.from({ length: pagination.pageSize }).map((_, index) => (
                      <TableRow key={index}>
                        {columns.map((column, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-border hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <UsersIcon className="h-8 w-8 text-muted-foreground" />
                          <span>Nenhum usuário encontrado.</span>
                          <p className="text-xs text-muted-foreground">
                            Tente ajustar os filtros ou adicionar novos usuários
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {usersResponse?.total ?? 0} linha(s) selecionada(s)
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground">
                    Linhas por página
                  </p>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] bg-background border-input">
                      <SelectValue placeholder={table.getState().pagination.pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top" className="bg-popover border-border">
                      {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium text-foreground">
                  Página {table.getState().pagination.pageIndex + 1} de{" "}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Ir para primeira página</span>
                    <span className="text-foreground">{"<<"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Ir para página anterior</span>
                    <span className="text-foreground">{"<"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Ir para próxima página</span>
                    <span className="text-foreground">{">"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Ir para última página</span>
                    <span className="text-foreground">{">>"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Criação de Usuário */}
      <UserCreateDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Invalidar queries para atualizar a lista
          utils.users.getAllUsers.invalidate()
          utils.users.getUserStats.invalidate()
        }}
      />
    </div>
  )
}