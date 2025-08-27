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
import { ArrowUpDown, Crown, Users, Shield, Eye, EyeOff, Pencil, Trash2, RotateCcw, Settings, Plus, Search, Filter, Clock, Activity, Check, X, Mail, Phone, FileText, MoreHorizontal, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { UserRole } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/trpc/react"

// Tipos de dados
export type Admin = {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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

// Definição das colunas da data table
export const columns: ColumnDef<Admin>[] = [
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
          Administrador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const admin = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getRandomAvatar(admin.id)} alt={admin.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getAvatarFallback(admin.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{admin.name}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Crown className="mr-1 h-3 w-3" />
                ADMIN
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{admin.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-foreground truncate max-w-[200px]">{email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => {
      const cpf = row.getValue("cpf") as string
      return (
        <div className="flex items-center gap-2">
          {cpf ? (
            <>
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-foreground font-mono text-sm">{cpf}</span>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
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
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-foreground">{date.toLocaleDateString('pt-BR')}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const admin = row.original

      return <AdminActionsCell admin={admin} />
    },
  },
]

// Componente separado para as ações da célula para evitar re-renders desnecessários
function AdminActionsCell({ admin }: { admin: Admin }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.admin.delete.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`🔒 Administrador desativado!`, {
        description: `${data.name} foi desativado com sucesso. O acesso foi removido temporariamente.`,
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: admin.id })
          }
        }
      })
      utils.admin.getAll.invalidate()
      utils.admin.getStats.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao desativar administrador`, {
        description: error.message,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            deleteMutation.mutate({ id: admin.id })
          }
        }
      })
    }
  })

  const reactivateMutation = api.admin.reactivate.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`🔓 Administrador reativado!`, {
        description: `${data.name} foi reativado com sucesso. O acesso foi restaurado.`,
        action: {
          label: "Ver Perfil",
          onClick: () => {
            // Implementar abertura do perfil se necessário
          }
        }
      })
      utils.admin.getAll.invalidate()
      utils.admin.getStats.invalidate()
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao reativar administrador`, {
        description: error.message,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            reactivateMutation.mutate({ id: admin.id })
          }
        }
      })
    }
  })

  const handleDelete = () => {
    const loadingToastId = toast.loading(`⏳ Desativando ${admin.name}...`, {
      description: "Processando a desativação do administrador. Aguarde um momento."
    })
    deleteMutation.mutate({ id: admin.id })
  }

  const handleReactivate = () => {
    const loadingToastId = toast.loading(`⏳ Reativando ${admin.name}...`, {
      description: "Processando a reativação do administrador. Aguarde um momento."
    })
    reactivateMutation.mutate({ id: admin.id })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewDialogOpen(true)}
          className="h-8 px-2"
        >
          <Eye className="mr-1 h-3 w-3" />
          Ver
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
                navigator.clipboard.writeText(admin.id)
                toast.success("📋 ID copiado!", {
                  description: `ID do administrador copiado para a área de transferência.`
                })
              }}
              className="cursor-pointer hover:bg-accent"
            >
              <Shield className="mr-2 h-4 w-4" />
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setViewDialogOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {admin.isActive ? (
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Desativar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent text-green-600 focus:text-green-600"
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

      {/* Dialogs */}
      <AdminViewDialog 
        admin={admin}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <AdminEditDialog 
        admin={admin}
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

export default function Members() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Queries tRPC
  const { data: adminsResponse, isLoading: adminsLoading } = api.admin.getAll.useQuery({
    search: (columnFilters.find(f => f.id === "name")?.value as string) || undefined,
    isActive: (columnFilters.find(f => f.id === "isActive")?.value as boolean) || undefined,
    limit: 50,
    offset: 0
  })

  const { data: stats } = api.admin.getStats.useQuery()

  // Configurar tabela
  const table = useReactTable({
    data: adminsResponse?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Crown className="h-6 w-6 text-white" />
            </div>
            Membros da Luma
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os administradores da plataforma Luma
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Crown className="mr-2 h-4 w-4" />
              Adicionar Admin
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Estatísticas dos Administradores */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary mb-1">{stats?.total ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Admins</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">+{stats?.recent ?? 0}</span> novos esta semana
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.active ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Admins Ativos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">
                  {stats?.total ? ((stats.active / stats.total) * 100).toFixed(1) : '0'}%
                </span> do total
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
                <div className="text-4xl font-bold text-orange-600 mb-1">{stats?.recent ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Admins</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-orange-600 font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Administradores */}
      <Card className="border-border">
        <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Administradores
            </CardTitle>
          <CardDescription>
            Visualize e gerencie todos os administradores da plataforma Luma
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
                    placeholder="Buscar administradores..."
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

              <div className="flex items-center gap-2">
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Crown className="mr-2 h-4 w-4" />
                      Adicionar Admin
                    </Button>
                  </DialogTrigger>
                </Dialog>

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
                          name: "Nome",
                          email: "Email", 
                          cpf: "CPF",
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
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-border hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
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
                        {adminsLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
                            Carregando administradores...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Crown className="h-8 w-8 text-muted-foreground" />
                            <span>Nenhum administrador encontrado.</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCreateDialogOpen(true)}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Adicionar Primeiro Admin
                            </Button>
                          </div>
                        )}
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
                {table.getFilteredRowModel().rows.length} linha(s) selecionada(s)
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

      {/* Dialog de Criação/Edição de Admin */}
      <AdminEditDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}

// Componente para visualizar detalhes do administrador
function AdminViewDialog({ 
  admin, 
  open, 
  onOpenChange 
}: { 
  admin: Admin
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.admin.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`🗑️ Administrador removido permanentemente!`, {
        description: `${data.name} foi completamente removido do sistema. Esta ação não pode ser desfeita.`,
        action: {
          label: "Entendido",
          onClick: () => {
            // Ação de confirmação de entendimento
          }
        }
      })
      utils.admin.getAll.invalidate()
      utils.admin.getStats.invalidate()
      onOpenChange(false)
      setPermanentDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao remover permanentemente`, {
        description: error.message,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            permanentDeleteMutation.mutate({ id: admin.id })
          }
        }
      })
    }
  })

  const handlePermanentDelete = () => {
    const loadingToastId = toast.loading(`⚠️ Removendo ${admin.name} permanentemente...`, {
      description: "Esta operação é irreversível. Processando remoção completa do sistema."
    })
    permanentDeleteMutation.mutate({ id: admin.id })
  }

  const canPermanentDelete = !admin.isActive

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage 
                src={getRandomAvatar(admin.id)} 
                alt={admin.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {getAvatarFallback(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {admin.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
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
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações de Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
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

          {/* Informações do Sistema */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ID do Sistema</label>
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
              <Settings className="h-5 w-5 text-primary" />
              Ações Rápidas
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => {
                  navigator.clipboard.writeText(admin.id)
                  toast.success("📋 ID copiado com sucesso!", {
                    description: `ID do administrador ${admin.name} foi copiado para a área de transferência.`
                  })
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Copiar ID
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-secondary/20 text-secondary hover:bg-secondary/10"
                onClick={() => {
                  const text = `Administrador: ${admin.name}\nEmail: ${admin.email}\nTelefone: ${admin.phone || 'N/A'}\nCPF: ${admin.cpf || 'N/A'}\nTipo: ${admin.role}\nStatus: ${admin.isActive ? 'Ativo' : 'Inativo'}`
                  navigator.clipboard.writeText(text)
                  toast.success("📄 Detalhes copiados com sucesso!", {
                    description: `Todas as informações de ${admin.name} foram copiadas para a área de transferência.`
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
function AdminEditDialog({ 
  admin, 
  open, 
  onOpenChange 
}: { 
  admin?: Admin
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

  const createMutation = api.admin.create.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`🎉 Administrador criado com sucesso!`, {
        description: `${data.name} foi adicionado à equipe da Luma. Bem-vindo!`,
        action: {
          label: "Ver Perfil",
          onClick: () => {
            // Implementar abertura do dialog de visualização se necessário
          }
        }
      })
      utils.admin.getAll.invalidate()
      utils.admin.getStats.invalidate()
      onOpenChange(false)
      resetForm()
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao criar administrador`, {
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

  const updateMutation = api.admin.update.useMutation({
    onSuccess: (data) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.success(`📝 Administrador atualizado!`, {
        description: `As informações de ${data.name} foram atualizadas com sucesso.`,
        action: {
          label: "Ver Alterações",
          onClick: () => {
            // Implementar visualização das alterações se necessário
          }
        }
      })
      utils.admin.getAll.invalidate()
      utils.admin.getStats.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.dismiss() // Remove qualquer toast anterior
      toast.error(`❌ Falha ao atualizar administrador`, {
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
      password: password || undefined
    }

    if (isEditing) {
      const loadingToastId = toast.loading(`📝 Atualizando ${name}...`, {
        description: "Salvando as alterações do administrador. Aguarde um momento."
      })
      updateMutation.mutate({
        id: admin.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone ? removeMask(phone) : undefined,
        cpf: cpf ? removeMask(cpf) : undefined,
        isActive
      })
    } else {
      const loadingToastId = toast.loading(`👤 Criando administrador...`, {
        description: "Criando nova conta de administrador na Luma. Aguarde um momento."
      })
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
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage 
                  src={admin ? getRandomAvatar(admin.id) : undefined} 
                  alt={name || "Novo administrador"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {name ? getAvatarFallback(name) : <Crown className="h-6 w-6" />}
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
                <Crown className="h-4 w-4 text-primary" />
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
                placeholder="joao@luma.com"
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

            {/* Campo Status - apenas para edição */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
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
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
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
            )}

            {/* Preview Card - apenas para criação quando há dados */}
            {!isEditing && (name.trim() || email.trim()) && (
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
                        {name.trim() || "Nome do Administrador"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                          <Crown className="mr-1 h-3 w-3" />
                          ADMIN
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
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
                      <Crown className="h-4 w-4" />
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