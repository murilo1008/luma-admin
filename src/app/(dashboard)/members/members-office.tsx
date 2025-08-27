"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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
import { ArrowUpDown, Crown, Users, Shield, Eye, EyeOff, Pencil, Trash2, RotateCcw, Settings, Plus, Search, Filter, Clock, Activity, Check, X, Mail, Phone, FileText, MoreHorizontal, ChevronDown, Handshake, Building2, Star } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tipos de dados
export type OfficeAdmin = {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  officeId?: string | null
  office?: {
    id: string
    name: string
  } | null
  advisor?: {
    id: string
    name: string
    code: string
    officeId: string | null
  } | null
}

export type Advisor = {
  id: string
  name: string
  email: string
  phone?: string | null
  cpf?: string | null
  code: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  officeId?: string | null
  avatar?: string | null
  offices?: {
    id: string
    name: string
  } | null
  _count?: {
    clients: number
  }
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

// Definição das colunas da tabela de Administradores
export const officeAdminColumns: ColumnDef<OfficeAdmin>[] = [
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
      return <OfficeAdminActionsCell admin={admin} />
    },
  },
]

// Definição das colunas da tabela de Assessores
export const advisorColumns: ColumnDef<Advisor>[] = [
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
          Assessor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const advisor = row.original
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getRandomAvatar(advisor.id)} alt={advisor.name} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {getAvatarFallback(advisor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{advisor.name}</span>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                <Handshake className="mr-1 h-3 w-3" />
                {advisor.code}
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">{advisor.email}</span>
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
          <Mail className="h-4 w-4 text-secondary" />
          <span className="text-foreground truncate max-w-[200px]">{email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      return (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-secondary" />
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 font-mono">
            {code}
          </Badge>
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
      const advisor = row.original
      return <AdvisorActionsCell advisor={advisor} />
    },
  },
]

// Componente separado para as ações dos Administradores
function OfficeAdminActionsCell({ admin }: { admin: OfficeAdmin }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.users.delete.useMutation({
    onSuccess: (data) => {
      toast.success(`🔒 Administrador desativado!`, {
        description: `${data.name} foi desativado com sucesso.`
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao desativar administrador`, {
        description: error.message
      })
    }
  })

  const reactivateMutation = api.users.reactivate.useMutation({
    onSuccess: (data) => {
      toast.success(`🔓 Administrador reativado!`, {
        description: `${data.name} foi reativado com sucesso.`
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Falha ao reativar administrador`, {
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
                toast.success("📋 ID copiado!")
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

      {/* Dialogs de OFFICE_ADMIN */}
      <ViewOfficeAdminDialog 
        admin={admin}
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
      />

      <EditOfficeAdminDialog 
        admin={admin}
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}

// Componente separado para as ações dos Assessores
function AdvisorActionsCell({ advisor }: { advisor: Advisor }) {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const utils = api.useUtils()
  
  const deleteMutation = api.advisors.delete.useMutation({
    onSuccess: (data) => {
      toast.success(`🔒 Assessor desativado!`, {
        description: `${data.name} foi desativado com sucesso.`
      })
      utils.advisors.getAll.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao desativar assessor`, {
        description: error.message
      })
    }
  })

  const reactivateMutation = api.advisors.reactivate.useMutation({
    onSuccess: (data) => {
      toast.success(`🔓 Assessor reativado!`, {
        description: `${data.name} foi reativado com sucesso.`
      })
      utils.advisors.getAll.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Falha ao reativar assessor`, {
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
                navigator.clipboard.writeText(advisor.id)
                toast.success("📋 ID copiado!")
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
            {advisor.isActive ? (
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

      {/* Dialogs de ADVISOR */}
      <ViewAdvisorDialog 
        advisor={advisor}
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
      />

      <EditAdvisorDialog 
        advisor={advisor}
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
      />
    </>
  )
}

interface OfficeManagerProps {
  officeId: string
  officeName: string
}

export default function OfficeMembers({ officeId, officeName }: OfficeManagerProps) {
  const pathname = usePathname()
  
  // Garantir que temos um officeId válido - fallback para URL se necessário
  const validOfficeId = React.useMemo(() => {
    if (officeId && officeId.trim() !== "") {
      return officeId
    }
    
    // Fallback: tentar extrair da URL se estivermos em uma página de escritório específico
    // Padrão: /offices/[officeId]/... ou similar
    const urlSegments = pathname.split('/')
    const possibleOfficeId = urlSegments.find(segment => 
      segment.length > 10 && // IDs geralmente são longos
      !segment.includes('-') && // Não é um slug
      segment !== 'members' && 
      segment !== 'offices'
    )
    
    console.warn("⚠️ OfficeId não fornecido via props, usando fallback da URL:", possibleOfficeId)
    return possibleOfficeId || ""
  }, [officeId, pathname])

  const [activeTab, setActiveTab] = React.useState("admins")
  
  // States para Administradores
  const [adminSorting, setAdminSorting] = React.useState<SortingState>([])
  const [adminColumnFilters, setAdminColumnFilters] = React.useState<ColumnFiltersState>([])
  const [adminColumnVisibility, setAdminColumnVisibility] = React.useState<VisibilityState>({})
  const [adminRowSelection, setAdminRowSelection] = React.useState({})
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = React.useState(false)

  // States para Assessores
  const [advisorSorting, setAdvisorSorting] = React.useState<SortingState>([])
  const [advisorColumnFilters, setAdvisorColumnFilters] = React.useState<ColumnFiltersState>([])
  const [advisorColumnVisibility, setAdvisorColumnVisibility] = React.useState<VisibilityState>({})
  const [advisorRowSelection, setAdvisorRowSelection] = React.useState({})
  const [createAdvisorDialogOpen, setCreateAdvisorDialogOpen] = React.useState(false)

  // Queries tRPC
  const { data: adminsResponse, isLoading: adminsLoading } = api.users.getOfficeAdminsByOfficeId.useQuery({
    officeId: validOfficeId,
    search: (adminColumnFilters.find(f => f.id === "name")?.value as string) || undefined,
    isActive: (adminColumnFilters.find(f => f.id === "isActive")?.value as boolean) || undefined,
    limit: 50,
    offset: 0
  }, { enabled: !!validOfficeId })

  const { data: advisorsResponse, isLoading: advisorsLoading } = api.advisors.getByOfficeId.useQuery({
    officeId: validOfficeId,
    search: (advisorColumnFilters.find(f => f.id === "name")?.value as string) || undefined,
    isActive: (advisorColumnFilters.find(f => f.id === "isActive")?.value as boolean) || undefined,
    limit: 50,
    offset: 0
  }, { enabled: !!validOfficeId })

  const { data: adminStats } = api.users.getOfficeAdminStatsByOffice.useQuery(
    { officeId: validOfficeId }, 
    { enabled: !!validOfficeId }
  )
  const { data: advisorStats } = api.advisors.getStatsByOffice.useQuery(
    { officeId: validOfficeId }, 
    { enabled: !!validOfficeId }
  )

  // Configurar tabela de Administradores
  const adminTable = useReactTable({
    data: adminsResponse?.data || [],
    columns: officeAdminColumns,
    onSortingChange: setAdminSorting,
    onColumnFiltersChange: setAdminColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setAdminColumnVisibility,
    onRowSelectionChange: setAdminRowSelection,
    state: {
      sorting: adminSorting,
      columnFilters: adminColumnFilters,
      columnVisibility: adminColumnVisibility,
      rowSelection: adminRowSelection,
    },
  })

  // Configurar tabela de Assessores
  const advisorTable = useReactTable({
    data: advisorsResponse?.data || [],
    columns: advisorColumns as any,
    onSortingChange: setAdvisorSorting,
    onColumnFiltersChange: setAdvisorColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setAdvisorColumnVisibility,
    onRowSelectionChange: setAdvisorRowSelection,
    state: {
      sorting: advisorSorting,
      columnFilters: advisorColumnFilters,
      columnVisibility: advisorColumnVisibility,
      rowSelection: advisorRowSelection,
    },
  })

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            Membros - {officeName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie administradores e assessores do escritório
          </p>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary mb-1">{adminStats?.total ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Administradores</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">{adminStats?.active ?? 0}</span> ativos
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{advisorStats?.total ?? 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Assessores</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">{advisorStats?.active ?? 0}</span> ativos
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
                <div className="text-4xl font-bold text-green-600 mb-1">{(adminStats?.active ?? 0) + (advisorStats?.active ?? 0)}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total Ativos</h3>
              <p className="text-sm text-muted-foreground">
                Membros ativos
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
                <div className="text-4xl font-bold text-orange-600 mb-1">{(adminStats?.recent ?? 0) + (advisorStats?.recent ?? 0)}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Membros</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-orange-600 font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Administradores e Assessores */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Administradores ({adminStats?.total ?? 0})
          </TabsTrigger>
          <TabsTrigger value="advisors" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            Assessores ({advisorStats?.total ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Administradores */}
        <TabsContent value="admins" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Administradores do Escritório
              </CardTitle>
              <CardDescription>
                Gerencie os administradores com acesso ao escritório {officeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                {/* Controles da Tabela de Administradores */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar administradores..."
                        value={(adminTable.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                          adminTable.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10 max-w-sm bg-background border-input"
                      />
                    </div>

                    <Select
                      value={(adminTable.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                      onValueChange={(value) => {
                        if (value === "all") {
                          adminTable.getColumn("isActive")?.setFilterValue("")
                        } else {
                          adminTable.getColumn("isActive")?.setFilterValue(value === "true")
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
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setCreateAdminDialogOpen(true)}>
                      <Crown className="mr-2 h-4 w-4" />
                      Adicionar Admin
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto border-input bg-background hover:bg-accent">
                          <Filter className="mr-2 h-4 w-4" />
                          Colunas <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        {adminTable
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
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

                {/* Tabela de Administradores */}
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      {adminTable.getHeaderGroups().map((headerGroup) => (
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
                      {adminTable.getRowModel().rows?.length ? (
                        adminTable.getRowModel().rows.map((row) => (
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
                            colSpan={officeAdminColumns.length}
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
                                  onClick={() => setCreateAdminDialogOpen(true)}
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

                {/* Paginação de Administradores */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {adminTable.getFilteredSelectedRowModel().rows.length} de{" "}
                    {adminTable.getFilteredRowModel().rows.length} linha(s) selecionada(s)
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground">
                        Linhas por página
                      </p>
                      <Select
                        value={`${adminTable.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          adminTable.setPageSize(Number(value))
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px] bg-background border-input">
                          <SelectValue placeholder={adminTable.getState().pagination.pageSize} />
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
                      Página {adminTable.getState().pagination.pageIndex + 1} de{" "}
                      {adminTable.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                        onClick={() => adminTable.setPageIndex(0)}
                        disabled={!adminTable.getCanPreviousPage()}
                      >
                        <span className="sr-only">Ir para primeira página</span>
                        <span className="text-foreground">{"<<"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                        onClick={() => adminTable.previousPage()}
                        disabled={!adminTable.getCanPreviousPage()}
                      >
                        <span className="sr-only">Ir para página anterior</span>
                        <span className="text-foreground">{"<"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                        onClick={() => adminTable.nextPage()}
                        disabled={!adminTable.getCanNextPage()}
                      >
                        <span className="sr-only">Ir para próxima página</span>
                        <span className="text-foreground">{">"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                        onClick={() => adminTable.setPageIndex(adminTable.getPageCount() - 1)}
                        disabled={!adminTable.getCanNextPage()}
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
        </TabsContent>

        {/* Tab de Assessores */}
        <TabsContent value="advisors" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Handshake className="h-5 w-5 text-secondary" />
                Assessores do Escritório
              </CardTitle>
              <CardDescription>
                Gerencie os assessores vinculados ao escritório {officeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                {/* Controles da Tabela de Assessores */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar assessores..."
                        value={(advisorTable.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                          advisorTable.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10 max-w-sm bg-background border-input"
                      />
                    </div>

                    <Select
                      value={(advisorTable.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                      onValueChange={(value) => {
                        if (value === "all") {
                          advisorTable.getColumn("isActive")?.setFilterValue("")
                        } else {
                          advisorTable.getColumn("isActive")?.setFilterValue(value === "true")
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
                    <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => setCreateAdvisorDialogOpen(true)}>
                      <Handshake className="mr-2 h-4 w-4" />
                      Adicionar Assessor
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto border-input bg-background hover:bg-accent">
                          <Filter className="mr-2 h-4 w-4" />
                          Colunas <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        {advisorTable
                          .getAllColumns()
                          .filter((column) => column.getCanHide())
                          .map((column) => {
                            const columnNames: Record<string, string> = {
                              name: "Nome",
                              email: "Email", 
                              code: "Código",
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

                {/* Tabela de Assessores */}
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      {advisorTable.getHeaderGroups().map((headerGroup) => (
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
                      {advisorTable.getRowModel().rows?.length ? (
                        advisorTable.getRowModel().rows.map((row) => (
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
                            colSpan={advisorColumns.length}
                            className="h-24 text-center text-muted-foreground"
                          >
                            {advisorsLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin mr-2" />
                                Carregando assessores...
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <Handshake className="h-8 w-8 text-muted-foreground" />
                                <span>Nenhum assessor encontrado.</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setCreateAdvisorDialogOpen(true)}
                                >
                                  <Handshake className="mr-2 h-4 w-4" />
                                  Adicionar Primeiro Assessor
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação de Assessores */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    {advisorTable.getFilteredSelectedRowModel().rows.length} de{" "}
                    {advisorTable.getFilteredRowModel().rows.length} linha(s) selecionada(s)
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-foreground">
                        Linhas por página
                      </p>
                      <Select
                        value={`${advisorTable.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                          advisorTable.setPageSize(Number(value))
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px] bg-background border-input">
                          <SelectValue placeholder={advisorTable.getState().pagination.pageSize} />
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
                      Página {advisorTable.getState().pagination.pageIndex + 1} de{" "}
                      {advisorTable.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                        onClick={() => advisorTable.setPageIndex(0)}
                        disabled={!advisorTable.getCanPreviousPage()}
                      >
                        <span className="sr-only">Ir para primeira página</span>
                        <span className="text-foreground">{"<<"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                        onClick={() => advisorTable.previousPage()}
                        disabled={!advisorTable.getCanPreviousPage()}
                      >
                        <span className="sr-only">Ir para página anterior</span>
                        <span className="text-foreground">{"<"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-input bg-background hover:bg-accent"
                        onClick={() => advisorTable.nextPage()}
                        disabled={!advisorTable.getCanNextPage()}
                      >
                        <span className="sr-only">Ir para próxima página</span>
                        <span className="text-foreground">{">"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-input bg-background hover:bg-accent"
                        onClick={() => advisorTable.setPageIndex(advisorTable.getPageCount() - 1)}
                        disabled={!advisorTable.getCanNextPage()}
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
        </TabsContent>
      </Tabs>

      {/* Dialogs de OFFICE_ADMIN */}
      <CreateOfficeAdminDialog 
        open={createAdminDialogOpen} 
        onOpenChange={setCreateAdminDialogOpen}
        officeId={validOfficeId}
      />

      {/* Dialogs de ADVISOR */}
      <CreateAdvisorDialog 
        open={createAdvisorDialogOpen} 
        onOpenChange={setCreateAdvisorDialogOpen}
        officeId={validOfficeId}
      />
    </div>
  )
}

// Dialog para criar OFFICE_ADMIN
function CreateOfficeAdminDialog({ 
  open, 
  onOpenChange, 
  officeId 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  officeId: string
}) {
  // Garantir que temos um officeId válido
  if (!officeId || officeId.trim() === "") {
    console.error("❌ CreateOfficeAdminDialog: officeId inválido ou vazio:", officeId)
    return null
  }
  
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [cpf, setCpf] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [advisorId, setAdvisorId] = React.useState<string>("none")

  const utils = api.useUtils()

  // Buscar assessores do escritório para vinculação opcional
  const { data: advisors } = api.advisors.getByOfficeId.useQuery({
    officeId,
    limit: 100,
    offset: 0
  })

  const createMutation = api.users.create.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Administrador criado!`, {
        description: `${data.name} foi criado com sucesso.`
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao criar administrador`, {
        description: error.message
      })
    }
  })

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCpf("")
    setPassword("")
    setAdvisorId("none")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim()) {
      toast.error("❌ Campos obrigatórios", {
        description: "Nome e email são obrigatórios."
      })
      return
    }

    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      cpf: cpf.trim() || undefined,
      role: "OFFICE_ADMIN" as const,
      officeId: officeId.trim(),
      advisorId: advisorId && advisorId !== "none" ? advisorId : undefined,
      password: password.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Adicionar Administrador do Escritório
          </DialogTitle>
          <DialogDescription>
            Crie um novo administrador para este escritório. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nome Completo *</Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo"
                className="bg-background border-input focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email *</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="bg-background border-input focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-phone">Telefone</Label>
              <Input
                id="admin-phone"
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="(11) 99999-9999"
                className="bg-background border-input focus:border-primary"
                maxLength={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-cpf">CPF</Label>
              <Input
                id="admin-cpf"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-background border-input focus:border-primary"
                maxLength={14}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-advisor">Assessor Vinculado (Opcional)</Label>
            <Select value={advisorId} onValueChange={setAdvisorId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione um assessor (opcional)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">Nenhum assessor</SelectItem>
                {advisors?.data?.map((advisor) => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.name} ({advisor.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha (Opcional)</Label>
            <PasswordInput
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite uma senha (deixe vazio para gerar automaticamente)"
              className="bg-background border-input focus:border-primary"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Criar Administrador
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog para criar ADVISOR
function CreateAdvisorDialog({ 
  open, 
  onOpenChange, 
  officeId 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  officeId: string
}) {
  // Garantir que temos um officeId válido
  if (!officeId || officeId.trim() === "") {
    console.error("❌ CreateAdvisorDialog: officeId inválido ou vazio:", officeId)
    return null
  }
  
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [cpf, setCpf] = React.useState("")
  const [code, setCode] = React.useState("")
  const [password, setPassword] = React.useState("")

  const utils = api.useUtils()

  const createMutation = api.advisors.create.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Assessor criado!`, {
        description: `${data.name} foi criado com sucesso.`
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao criar assessor`, {
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
    setPassword("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !code.trim()) {
      toast.error("❌ Campos obrigatórios", {
        description: "Nome, email e código são obrigatórios."
      })
      return
    }

    createMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      cpf: cpf.trim() || undefined,
      code: code.trim().toUpperCase(),
      officeId,
      password: password.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-secondary" />
            Adicionar Assessor do Escritório
          </DialogTitle>
          <DialogDescription>
            Crie um novo assessor para este escritório. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advisor-name">Nome Completo *</Label>
              <Input
                id="advisor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo"
                className="bg-background border-input focus:border-secondary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advisor-email">Email *</Label>
              <Input
                id="advisor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="bg-background border-input focus:border-secondary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advisor-phone">Telefone</Label>
              <Input
                id="advisor-phone"
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="(11) 99999-9999"
                className="bg-background border-input focus:border-secondary"
                maxLength={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advisor-cpf">CPF</Label>
              <Input
                id="advisor-cpf"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-background border-input focus:border-secondary"
                maxLength={14}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advisor-code">Código do Assessor *</Label>
            <Input
              id="advisor-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: ADV001"
              className="bg-background border-input focus:border-secondary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advisor-password">Senha (Opcional)</Label>
            <PasswordInput
              id="advisor-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite uma senha (deixe vazio para gerar automaticamente)"
              className="bg-background border-input focus:border-secondary"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Handshake className="mr-2 h-4 w-4" />
                  Criar Assessor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog para visualizar OFFICE_ADMIN
function ViewOfficeAdminDialog({ 
  admin, 
  open, 
  onOpenChange 
}: { 
  admin: OfficeAdmin
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Detalhes do Administrador
          </DialogTitle>
          <DialogDescription>
            Informações completas do administrador do escritório.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cabeçalho com Avatar */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getRandomAvatar(admin.id)} alt={admin.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getAvatarFallback(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{admin.name}</h3>
              <p className="text-muted-foreground">{admin.email}</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mt-2">
                <Crown className="mr-1 h-3 w-3" />
                OFFICE_ADMIN
              </Badge>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-foreground">{admin.email}</span>
              </div>
            </div>

            {admin.phone && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{admin.phone}</span>
                </div>
              </div>
            )}

            {admin.cpf && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-mono">{admin.cpf}</span>
                </div>
              </div>
            )}

            {admin.advisor && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Assessor Vinculado</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Handshake className="h-4 w-4 text-secondary" />
                  <span className="text-foreground">{admin.advisor.name} ({admin.advisor.code})</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={admin.isActive ? "default" : "secondary"} className={
                  admin.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {admin.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{new Date(admin.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Dialog para editar OFFICE_ADMIN
function EditOfficeAdminDialog({ 
  admin, 
  open, 
  onOpenChange 
}: { 
  admin: OfficeAdmin
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState(admin.name)
  const [email, setEmail] = React.useState(admin.email)
  const [phone, setPhone] = React.useState(admin.phone || "")
  const [cpf, setCpf] = React.useState(admin.cpf || "")
  const [isActive, setIsActive] = React.useState(admin.isActive)
  const [advisorId, setAdvisorId] = React.useState(admin.advisor?.id || "none")

  const utils = api.useUtils()

  // Buscar assessores do escritório para vinculação
  const { data: advisors } = api.advisors.getByOfficeId.useQuery({
    officeId: admin.officeId || "",
    limit: 100,
    offset: 0
  })

  const updateMutation = api.users.update.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Administrador atualizado!`, {
        description: `${data.name} foi atualizado com sucesso.`
      })
      utils.users.getOfficeAdminsByOfficeId.invalidate()
      utils.users.getOfficeAdminStatsByOffice.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao atualizar administrador`, {
        description: error.message
      })
    }
  })

  React.useEffect(() => {
    if (open) {
      setName(admin.name)
      setEmail(admin.email)
      setPhone(admin.phone || "")
      setCpf(admin.cpf || "")
      setIsActive(admin.isActive)
      setAdvisorId(admin.advisor?.id || "")
    }
  }, [open, admin])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim()) {
      toast.error("❌ Campos obrigatórios", {
        description: "Nome e email são obrigatórios."
      })
      return
    }

    updateMutation.mutate({
      id: admin.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      cpf: cpf.trim() || undefined,
      role: "OFFICE_ADMIN",
      officeId: admin.officeId || undefined,
      isActive,
      advisorId: advisorId && advisorId !== "none" ? advisorId : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Administrador do Escritório
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do administrador. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-admin-name">Nome Completo *</Label>
              <Input
                id="edit-admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo"
                className="bg-background border-input focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-admin-email">Email *</Label>
              <Input
                id="edit-admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="bg-background border-input focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-admin-phone">Telefone</Label>
              <Input
                id="edit-admin-phone"
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="(11) 99999-9999"
                className="bg-background border-input focus:border-primary"
                maxLength={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-admin-cpf">CPF</Label>
              <Input
                id="edit-admin-cpf"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-background border-input focus:border-primary"
                maxLength={14}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-admin-advisor">Assessor Vinculado</Label>
            <Select value={advisorId} onValueChange={setAdvisorId}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue placeholder="Selecione um assessor (opcional)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">Nenhum assessor</SelectItem>
                {advisors?.data?.map((advisor) => (
                  <SelectItem key={advisor.id} value={advisor.id}>
                    {advisor.name} ({advisor.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-admin-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label
              htmlFor="edit-admin-active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Usuário ativo
            </Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Dialog para visualizar ADVISOR
function ViewAdvisorDialog({ 
  advisor, 
  open, 
  onOpenChange 
}: { 
  advisor: Advisor
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-secondary" />
            Detalhes do Assessor
          </DialogTitle>
          <DialogDescription>
            Informações completas do assessor do escritório.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cabeçalho com Avatar */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getRandomAvatar(advisor.id)} alt={advisor.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                {getAvatarFallback(advisor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{advisor.name}</h3>
              <p className="text-muted-foreground">{advisor.email}</p>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 mt-2">
                <Handshake className="mr-1 h-3 w-3" />
                {advisor.code}
              </Badge>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Mail className="h-4 w-4 text-secondary" />
                <span className="text-foreground">{advisor.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Código</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Star className="h-4 w-4 text-secondary" />
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 font-mono">
                  {advisor.code}
                </Badge>
              </div>
            </div>

            {advisor.phone && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-foreground">{advisor.phone}</span>
                </div>
              </div>
            )}

            {advisor.cpf && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <FileText className="h-4 w-4 text-secondary" />
                  <span className="text-foreground font-mono">{advisor.cpf}</span>
                </div>
              </div>
            )}

            {advisor._count && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Clientes</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-foreground">{advisor._count.clients} cliente(s)</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={advisor.isActive ? "default" : "secondary"} className={
                  advisor.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {advisor.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{new Date(advisor.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Dialog para editar ADVISOR
function EditAdvisorDialog({ 
  advisor, 
  open, 
  onOpenChange 
}: { 
  advisor: Advisor
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = React.useState(advisor.name)
  const [email, setEmail] = React.useState(advisor.email)
  const [phone, setPhone] = React.useState(advisor.phone || "")
  const [cpf, setCpf] = React.useState(advisor.cpf || "")
  const [code, setCode] = React.useState(advisor.code)
  const [isActive, setIsActive] = React.useState(advisor.isActive)

  const utils = api.useUtils()

  const updateMutation = api.advisors.update.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Assessor atualizado!`, {
        description: `${data.name} foi atualizado com sucesso.`
      })
      utils.advisors.getByOfficeId.invalidate()
      utils.advisors.getStatsByOffice.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Falha ao atualizar assessor`, {
        description: error.message
      })
    }
  })

  React.useEffect(() => {
    if (open) {
      setName(advisor.name)
      setEmail(advisor.email)
      setPhone(advisor.phone || "")
      setCpf(advisor.cpf || "")
      setCode(advisor.code)
      setIsActive(advisor.isActive)
    }
  }, [open, advisor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !code.trim()) {
      toast.error("❌ Campos obrigatórios", {
        description: "Nome, email e código são obrigatórios."
      })
      return
    }

    updateMutation.mutate({
      id: advisor.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      cpf: cpf.trim() || undefined,
      code: code.trim().toUpperCase(),
      officeId: advisor.officeId || undefined,
      isActive,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-secondary" />
            Editar Assessor do Escritório
          </DialogTitle>
          <DialogDescription>
            Atualize as informações do assessor. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-advisor-name">Nome Completo *</Label>
              <Input
                id="edit-advisor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome completo"
                className="bg-background border-input focus:border-secondary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-advisor-email">Email *</Label>
              <Input
                id="edit-advisor-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email"
                className="bg-background border-input focus:border-secondary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-advisor-phone">Telefone</Label>
              <Input
                id="edit-advisor-phone"
                value={phone}
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                placeholder="(11) 99999-9999"
                className="bg-background border-input focus:border-secondary"
                maxLength={15}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-advisor-cpf">CPF</Label>
              <Input
                id="edit-advisor-cpf"
                value={cpf}
                onChange={(e) => setCpf(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-background border-input focus:border-secondary"
                maxLength={14}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-advisor-code">Código do Assessor *</Label>
            <Input
              id="edit-advisor-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: ADV001"
              className="bg-background border-input focus:border-secondary"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-advisor-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label
              htmlFor="edit-advisor-active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Assessor ativo
            </Label>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
