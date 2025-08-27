"use client"

import * as React from "react"
import { Eye, Pencil, Trash2, RotateCcw, Shield, Settings, ImageIcon, Plus, Building2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/trpc/react"
import type { Insurer } from "./insurers"

// Componente para ações da linha
export function ActionsCell({ insurer }: { insurer: Insurer }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const deleteMutation = api.insurers.delete.useMutation({
    onSuccess: () => {
      toast.success(`🔒 ${insurer.name} desativada!`, {
        description: "A seguradora foi desativada com sucesso e pode ser reativada posteriormente.",
        id: `delete-${insurer.id}`,
        action: {
          label: "Desfazer",
          onClick: () => {
            reactivateMutation.mutate({ id: insurer.id })
          }
        }
      })
      utils.insurers.getAll.invalidate()
      utils.insurers.getStats.invalidate()
      setDeleteDialogOpen(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao desativar`, {
        description: error.message,
        id: `delete-${insurer.id}`,
        action: {
          label: "Tentar Novamente", 
          onClick: () => setDeleteDialogOpen(true)
        }
      })
    }
  })

  const reactivateMutation = api.insurers.reactivate.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${insurer.name} reativada!`, {
        description: "A seguradora foi reativada e está disponível novamente para uso.",
        id: `reactivate-${insurer.id}`,
        action: {
          label: "Ver Detalhes",
          onClick: () => setViewDialogOpen(true)
        }
      })
      utils.insurers.getAll.invalidate()
      utils.insurers.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(`❌ Erro ao reativar`, {
        description: error.message,
        id: `reactivate-${insurer.id}`,
        action: {
          label: "Tentar Novamente",
          onClick: () => handleReactivate()
        }
      })
    }
  })

  const handleDelete = () => {
    toast.loading(`🔄 Desativando ${insurer.name}...`, {
      description: "Processando a desativação da seguradora.",
      id: `delete-${insurer.id}`
    })
    deleteMutation.mutate({ id: insurer.id })
  }

  const handleReactivate = () => {
    toast.loading(`🔄 Reativando ${insurer.name}...`, {
      description: "Processando a reativação da seguradora.",
      id: `reactivate-${insurer.id}`
    })
    reactivateMutation.mutate({ id: insurer.id })
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
              navigator.clipboard.writeText(insurer.id)
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
          {insurer.isActive ? (
            <>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-accent text-destructive focus:text-destructive"
                onClick={() => {
                  toast.loading(`🔄 Desativando ${insurer.name}...`, {
                    description: "Processando a desativação da seguradora.",
                    id: `delete-${insurer.id}`
                  })
                  deleteMutation.mutate({ id: insurer.id })
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
                toast.loading(`🔄 Reativando ${insurer.name}...`, {
                  description: "Processando a reativação da seguradora.",
                  id: `reactivate-${insurer.id}`
                })
                reactivateMutation.mutate({ id: insurer.id })
              }}
              disabled={reactivateMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {reactivateMutation.isPending ? "Reativando..." : "Reativar"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewDialog 
        insurer={insurer}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditDialog 
        insurer={insurer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a seguradora "{insurer.name}"? 
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

// Componente para visualizar detalhes da seguradora
export function ViewDialog({ 
  insurer, 
  open, 
  onOpenChange 
}: { 
  insurer: Insurer
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = React.useState(false)
  
  const utils = api.useUtils()
  const permanentDeleteMutation = api.insurers.deletePermanently.useMutation({
    onSuccess: (data) => {
      toast.success(`🗑️ ${data.name} foi deletada permanentemente!`, {
        description: "Esta ação não pode ser desfeita."
      })
      utils.insurers.getAll.invalidate()
      utils.insurers.getStats.invalidate()
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
    permanentDeleteMutation.mutate({ id: insurer.id })
  }

  const canPermanentDelete = !insurer.isActive && insurer._count.insurances === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={insurer.photoUrl || ""} alt={insurer.name} />
              <AvatarFallback className="bg-secondary text-white text-lg font-bold">
                {insurer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {insurer.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={insurer.isActive ? "default" : "secondary"} className={
                  insurer.isActive 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                }>
                  {insurer.isActive ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {insurer._count.insurances} apólices
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Logo/Foto */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-secondary" />
              Logo da Seguradora
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              {insurer.photoUrl ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={insurer.photoUrl} alt={insurer.name} />
                    <AvatarFallback className="bg-secondary/20 text-secondary font-semibold text-lg">
                      {insurer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">URL da imagem:</p>
                    <code className="text-sm font-mono text-foreground break-all">{insurer.photoUrl}</code>
                  </div>
                </div>
              ) : (
                <p className="text-foreground leading-relaxed">
                  Nenhuma logo configurada para esta seguradora.
                </p>
              )}
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
                      <p className="text-2xl font-bold text-secondary">{insurer._count.insurances}</p>
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
                        {insurer.isActive ? "Ativo" : "Inativo"}
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
                <label className="text-sm font-medium text-muted-foreground">ID da Seguradora</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <code className="text-sm font-mono text-foreground break-all">{insurer.id}</code>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-foreground">
                    {new Date(insurer.createdAt).toLocaleDateString('pt-BR', {
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
                    {new Date(insurer.updatedAt).toLocaleDateString('pt-BR', {
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
                    {insurer._count.insurances} {insurer._count.insurances === 1 ? 'apólice' : 'apólices'}
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
                  navigator.clipboard.writeText(insurer.id)
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
                  const text = `Seguradora: ${insurer.name}\nLogo: ${insurer.photoUrl || 'N/A'}\nStatus: ${insurer.isActive ? 'Ativo' : 'Inativo'}\nApólices: ${insurer._count.insurances}`
                  navigator.clipboard.writeText(text)
                  toast.success("📄 Detalhes copiados!", {
                    description: "Informações copiadas para a área de transferência"
                  })
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Copiar Detalhes
              </Button>

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

            {canPermanentDelete && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  ⚠️ <strong>Deletar Permanentemente:</strong> Esta ação removerá completamente a seguradora do sistema e não pode ser desfeita.
                </p>
              </div>
            )}
            
            {!canPermanentDelete && (
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  ℹ️ <strong>Para deletar permanentemente:</strong> A seguradora deve estar inativa e sem apólices vinculadas.
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

      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Deletar Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja <strong>deletar permanentemente</strong> a seguradora "{insurer.name}"?
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

// Componente para criar/editar seguradoras
export function EditDialog({ 
  insurer, 
  open, 
  onOpenChange 
}: { 
  insurer?: Insurer
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [name, setName] = React.useState(insurer?.name ?? "")
  const [photoUrl, setPhotoUrl] = React.useState(insurer?.photoUrl ?? "")
  const [isActive, setIsActive] = React.useState(insurer?.isActive ?? true)

  const utils = api.useUtils()
  const isEditing = !!insurer

  const createMutation = api.insurers.create.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} criada!`, {
        description: "A seguradora foi criada com sucesso."
      })
      utils.insurers.getAll.invalidate()
      utils.insurers.getStats.invalidate()
      onOpenChange(false)
      setName("")
      setPhotoUrl("")
      setIsActive(true)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao criar`, {
        description: error.message
      })
    }
  })

  const updateMutation = api.insurers.update.useMutation({
    onSuccess: () => {
      toast.success(`✅ ${name} atualizada!`, {
        description: "A seguradora foi atualizada com sucesso."
      })
      utils.insurers.getAll.invalidate()
      utils.insurers.getStats.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(`❌ Erro ao atualizar`, {
        description: error.message
      })
    }
  })

  // Reset form when dialog opens/closes or insurer changes
  React.useEffect(() => {
    if (open && insurer) {
      setName(insurer.name)
      setPhotoUrl(insurer.photoUrl ?? "")
      setIsActive(insurer.isActive)
    } else if (open && !insurer) {
      setName("")
      setPhotoUrl("")
      setIsActive(true)
    }
  }, [insurer, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("❌ Nome é obrigatório", {
        description: "Por favor, preencha o nome da seguradora."
      })
      return
    }

    if (name.trim().length < 3) {
      toast.error("❌ Nome muito curto", {
        description: "O nome deve ter pelo menos 3 caracteres."
      })
      return
    }

    if (photoUrl && !isValidUrl(photoUrl)) {
      toast.error("❌ URL da foto inválida", {
        description: "Por favor, insira uma URL válida para a foto."
      })
      return
    }

    if (isEditing && insurer) {
      updateMutation.mutate({
        id: insurer.id,
        name: name.trim(),
        photoUrl: photoUrl.trim() || undefined,
        isActive
      })
    } else {
      createMutation.mutate({
        name: name.trim(),
        photoUrl: photoUrl.trim() || undefined
      })
    }
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
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
                  {isEditing ? "Editar Seguradora" : "Nova Seguradora"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {isEditing 
                    ? "Atualize as informações da seguradora abaixo."
                    : "Preencha as informações para criar uma nova seguradora."
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-secondary" />
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nome da Seguradora *
                </Label>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bradesco Seguros, Itaú Seguros..."
                required
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 3 caracteres. Este será o nome oficial da seguradora.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-secondary" />
                <Label htmlFor="photoUrl" className="text-sm font-semibold text-foreground">
                  URL da Logo
                </Label>
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              </div>
              <Input
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
                type="url"
                disabled={isLoading}
                className="bg-background border-input focus:border-secondary focus:ring-secondary/20"
              />
              <p className="text-xs text-muted-foreground">
                URL da imagem do logo da seguradora. Será exibida na listagem e detalhes.
              </p>
              
              {photoUrl && isValidUrl(photoUrl) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={photoUrl} alt="Preview" />
                    <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                      {name.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">Preview da Logo</p>
                    <p className="text-xs text-muted-foreground">Como ficará na interface</p>
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Status da Seguradora
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
                      Seguradora Ativa
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive 
                        ? "Esta seguradora estará disponível para criação de novas apólices." 
                        : "Esta seguradora ficará inativa e não poderá ser usada em novas apólices."
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

            {!isEditing && (name.trim() || photoUrl.trim()) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-secondary" />
                  <Label className="text-sm font-semibold text-foreground">
                    Pré-visualização
                  </Label>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={photoUrl || ""} alt={name || ""} />
                      <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                        {(name.trim() || "??").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {name.trim() || "Nome da Seguradora"}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
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
                      Atualizar Seguradora
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Criar Seguradora
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
