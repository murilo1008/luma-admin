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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search, Filter, Shield, FileType, Settings, Eye, Pencil, Trash2, RotateCcw, SortAsc, SortDesc } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { api } from "@/trpc/react"

// Tipos de dados baseados no Prisma
export type InsuranceType = {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    insurances: number
  }
}

// Definição das colunas
export const columns: ColumnDef<InsuranceType>[] = [
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
          Tipo de Seguro
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const insuranceType = row.original
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{insuranceType.name}</span>
          {insuranceType.description && (
            <span className="text-sm text-muted-foreground max-w-[200px] truncate">
              {insuranceType.description}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.insurances",
    id: "insurancesCount",
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
      const count = row.original._count.insurances
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
      return <div className="text-foreground">{new Date(date).toLocaleDateString('pt-BR')}</div>
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Atualizado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date
      return <div className="text-foreground">{new Date(date).toLocaleDateString('pt-BR')}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const insuranceType = row.original

      return <ActionsCell insuranceType={insuranceType} />
    },
  },
]

// Componente para ações da linha
function ActionsCell({ insuranceType }: { insuranceType: InsuranceType }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const deleteMutation = api.insuranceType.delete.useMutation({
    onSuccess: () => {
      toast.success(`🔒 ${insuranceType.name} desativado!`, {
        description: "O tipo de seguro foi desativado com sucesso e pode ser reativado posteriormente.",
        id: `delete-${insuranceType.id}`,
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: insuranceType.id })
          }
        }
      })
      utils.insuranceType.getAll.invalidate()
      utils.insuranceType.getStats.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao desativar`, {
        description: error.message,
        id: `delete-${insuranceType.id}`,
        action: {
          label: "Tentar Novamente", 
          onClick: () => setDeleteDialogOpen(true)
        }
      })
    }
  })

  const reactivateMutation = api.insuranceType.reactivate.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${insuranceType.name} reativado!`, {
        description: "O tipo de seguro foi reativado e está disponível novamente para uso.",
        id: `reactivate-${insuranceType.id}`,
        action: {
          label: "Ver Detalhes",
          onClick: () => setViewDialogOpen(true)
        }
      })
      utils.insuranceType.getAll.invalidate()
      utils.insuranceType.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao reativar`, {
        description: error.message,
        id: `reactivate-${insuranceType.id}`,
        action: {
          label: "Tentar Novamente",
          onClick: () => handleReactivate()
        }
      })
    }
  })

  const handleDelete = () => {
    toast.loading(`🔄 Desativando ${insuranceType.name}...`, {
      description: "Processando a desativação do tipo de seguro.",
      id: `delete-${insuranceType.id}`
    })
    deleteMutation.mutate({ id: insuranceType.id })
  }

  const handleReactivate = () => {
    toast.loading(`🔄 Reativando ${insuranceType.name}...`, {
      description: "Processando a reativação do tipo de seguro.",
      id: `reactivate-${insuranceType.id}`
    })
    reactivateMutation.mutate({ id: insuranceType.id })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="h-8 px-3 border-primary/20"
        onClick={() => setViewDialogOpen(true)}
      >
        <Eye className="mr-1 h-3 w-3" />
        Ver Mais
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
              navigator.clipboard.writeText(insuranceType.id)
              toast.success("📋 ID copiado!", {
                description: "ID copiado para a área de transferência"
              })
            }}
            className="cursor-pointer hover:bg-accent"
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-accent"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {insuranceType.isActive ? (
            <>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent text-destructive focus:text-destructive"
                onClick={() => {
                  toast.loading(`🔄 Desativando ${insuranceType.name}...`, {
                    description: "Processando a desativação do tipo de seguro.",
                    id: `delete-${insuranceType.id}`
                  })
                  deleteMutation.mutate({ id: insuranceType.id })
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteMutation.isPending ? "Desativando..." : "Desativar"}
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
              onClick={() => {
                toast.loading(`🔄 Reativando ${insuranceType.name}...`, {
                  description: "Processando a reativação do tipo de seguro.",
                  id: `reactivate-${insuranceType.id}`
                })
                reactivateMutation.mutate({ id: insuranceType.id })
              }}
              disabled={reactivateMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {reactivateMutation.isPending ? "Reativando..." : "Reativar"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Visualização */}
      <ViewDialog 
        insuranceType={insuranceType}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Dialog de Edição */}
      <EditDialog 
        insuranceType={insuranceType}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o tipo de seguro "{insuranceType.name}"? 
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Componente para visualizar detalhes do tipo de seguro
function ViewDialog({ 
  insuranceType, 
  open, 
  onOpenChange 
}: { 
  insuranceType: InsuranceType
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.insuranceType.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.success(`🗑️ ${data.name} foi deletado permanentemente!`, {
        description: "Esta ação não pode ser desfeita."
      })
      utils.insuranceType.getAll.invalidate()
      utils.insuranceType.getStats.invalidate()
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
    permanentDeleteMutation.mutate({ id: insuranceType.id })
  }

  const canPermanentDelete = !insuranceType.isActive && insuranceType._count.insurances === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {insuranceType.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={insuranceType.isActive ? "default" : "secondary"} className={
                  insuranceType.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {insuranceType.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {insuranceType._count.insurances} apólices
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Descrição */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileType className="h-5 w-5 text-secondary" />
              Descrição
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-foreground leading-relaxed">
                {insuranceType.description || "Nenhuma descrição disponível."}
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-secondary" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-border bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Shield className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Apólices</p>
                      <p className="text-2xl font-bold text-secondary">{insuranceType._count.insurances}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Eye className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-green-600">
                        {insuranceType.isActive ? "Ativo" : "Inativo"}
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
                <label className="text-sm font-medium text-muted-foreground">ID do Tipo</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <code className="text-sm font-mono text-foreground break-all">{insuranceType.id}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(insuranceType.createdAt).toLocaleDateString('pt-BR', {
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
                    {new Date(insuranceType.updatedAt).toLocaleDateString('pt-BR', {
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
                <label className="text-sm font-medium text-muted-foreground">Apólices Vinculadas</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {insuranceType._count.insurances} {insuranceType._count.insurances === 1 ? 'apólice' : 'apólices'}
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
                  navigator.clipboard.writeText(insuranceType.id)
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
                  const text = `Tipo de Seguro: ${insuranceType.name}\nDescrição: ${insuranceType.description || 'N/A'}\nStatus: ${insuranceType.isActive ? 'Ativo' : 'Inativo'}\nApólices: ${insuranceType._count.insurances}`
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
                  ⚠️ <strong>Deletar Permanentemente:</strong> Esta ação removerá completamente o tipo de seguro do sistema e não pode ser desfeita.
                </p>
              </div>
            )}
            
            {!canPermanentDelete && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  ℹ️ <strong>Para deletar permanentemente:</strong> O tipo deve estar inativo e sem apólices vinculadas.
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
                Tem certeza que deseja <strong>deletar permanentemente</strong> o tipo de seguro "{insuranceType.name}"?
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

// Componente para criar/editar tipos de seguro
function EditDialog({ 
  insuranceType, 
  open, 
  onOpenChange 
}: { 
  insuranceType?: InsuranceType
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [name, setName] = React.useState(insuranceType?.name ?? "")
  const [description, setDescription] = React.useState(insuranceType?.description ?? "")
  const [isActive, setIsActive] = React.useState(insuranceType?.isActive ?? true)

  const utils = api.useUtils()
  const isEditing = !!insuranceType

  const createMutation = api.insuranceType.create.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} criado!`, {
        description: "O tipo de seguro foi criado com sucesso."
      })
      utils.insuranceType.getAll.invalidate()
      utils.insuranceType.getStats.invalidate()
      onOpenChange(false)
      setName("")
      setDescription("")
      setIsActive(true)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao criar`, {
        description: error.message
      })
    }
  })

  const updateMutation = api.insuranceType.update.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} atualizado!`, {
        description: "O tipo de seguro foi atualizado com sucesso."
      })
      utils.insuranceType.getAll.invalidate()
      utils.insuranceType.getStats.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao atualizar`, {
        description: error.message
      })
    }
  })

  // Reset form when dialog opens/closes or insuranceType changes
  React.useEffect(() => {
    if (open && insuranceType) {
      setName(insuranceType.name)
      setDescription(insuranceType.description ?? "")
      setIsActive(insuranceType.isActive)
    } else if (open && !insuranceType) {
      setName("")
      setDescription("")
      setIsActive(true)
    }
  }, [insuranceType, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome do tipo de seguro."
      })
      return
    }

    if (name.trim().length < 3) {
      toast.error("❌ Nome muito curto", {
        description: "O nome deve ter pelo menos 3 caracteres."
      })
      return
    }

    if (isEditing) {
      updateMutation.mutate({
        id: insuranceType.id,
        name: name.trim(),
        description: description.trim() || undefined,
        isActive
      })
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined
      })
    }
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
                  {isEditing ? "Editar Tipo de Seguro" : "Novo Tipo de Seguro"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing 
                    ? "Atualize as informações do tipo de seguro abaixo."
                    : "Preencha as informações para criar um novo tipo de seguro."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Campo Nome */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4 text-secondary" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nome do Tipo de Seguro *
                </Label>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Seguro de Vida, Seguro Auto..."
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 3 caracteres. Este será o nome principal do tipo de seguro.
              </p>
            </div>
            
            {/* Campo Descrição */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-secondary" />
                <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                  Descrição
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o tipo de seguro, suas principais características e cobertura..."
                rows={4}
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20 resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Esta descrição ajudará na identificação e organização dos tipos de seguro.
                </p>
                <span className="text-xs text-muted-foreground">
                  {description.length}/500
                </span>
              </div>
            </div>

            {/* Campo Status - apenas para edição */}
            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Status do Tipo
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(!!checked)}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="isActive" 
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      Tipo Ativo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive 
                        ? "Este tipo estará disponível para criação de novas apólices." 
                        : "Este tipo ficará inativo e não poderá ser usado em novas apólices."
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
            {!isEditing && (name.trim() || description.trim()) && (
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
                      <Shield className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome do Tipo"}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                  {description.trim() && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description.trim()}
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
              disabled={isLoading || !name.trim()}
              className="bg-secondary hover:bg-secondary/90 text-white flex-1 sm:flex-none"
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
                      Atualizar Tipo
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Criar Tipo
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

export default function InsuranceTypes() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<boolean | undefined>()
  const [sortOrder, setSortOrder] = React.useState<string>("default")

  // Queries tRPC
  const { data: queryResponse, isLoading } = api.insuranceType.getAll.useQuery({
    search: search || undefined,
    isActive: statusFilter,
    limit: 50,
    offset: 0
  })

  const { data: stats } = api.insuranceType.getStats.useQuery()

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
      case "updated-asc":
        return data.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      case "updated-desc":
        return data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      case "policies-asc":
        return data.sort((a, b) => a._count.insurances - b._count.insurances)
      case "policies-desc":
        return data.sort((a, b) => b._count.insurances - a._count.insurances)
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

  const table = useReactTable({
    data: sortedData,
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

  // Debounce search
  const debouncedSearch = React.useMemo(() => {
    const timer = setTimeout(() => {
      // Search is already handled by the search state
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    return debouncedSearch
  }, [debouncedSearch])

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tipos de Seguros</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de seguros disponíveis na plataforma
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tipo
            </Button>
          </DialogTrigger>
          <EditDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <FileType className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.total || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Tipos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">+{stats?.recent || 0}</span> novos esta semana
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.active || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Tipos Ativos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">
                  {stats?.total ? ((stats.active / stats.total) * 100).toFixed(1) : '0'}%
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
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.withInsurances || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Com Apólices</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">Tipos em uso</span>
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
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.recent || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Novos Tipos</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Tipos de Seguro */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Tipos de Seguros</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os tipos de seguros disponíveis na plataforma
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
                    placeholder="Buscar tipos de seguro..."
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
                    
                    {/* Ordenação Alfabética */}
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
                    
                    {/* Ordenação por Data de Criação */}
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
                    
                    {/* Ordenação por Última Atualização */}
                    <SelectItem value="updated-desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Atualizados Recentemente
                      </div>
                    </SelectItem>
                    <SelectItem value="updated-asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Não Atualizados há Mais Tempo
                      </div>
                    </SelectItem>
                    
                    {/* Ordenação por Apólices */}
                    <SelectItem value="policies-desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Mais Apólices
                      </div>
                    </SelectItem>
                    <SelectItem value="policies-asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Menos Apólices
                      </div>
                    </SelectItem>
                    
                    {/* Ordenação por Status */}
                    <SelectItem value="status">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Ativos Primeiro
                      </div>
                    </SelectItem>
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
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize cursor-pointer hover:bg-accent"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tabela com Loading State */}
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
                  {isLoading ? (
                    // Loading state apenas na tabela
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-64 text-center"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
                            <div className="w-4 h-4 bg-secondary rounded-full animate-pulse delay-75"></div>
                            <div className="w-4 h-4 bg-secondary rounded-full animate-pulse delay-150"></div>
                          </div>
                          <p className="text-muted-foreground">Carregando tipos de seguros...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
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
                        Nenhum resultado encontrado.
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
    </div>
  )
}