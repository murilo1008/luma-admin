"use client"

import * as React from "react"
import {
  User,
  ChevronsUpDown,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  Check,
  X,
  Settings,
} from "lucide-react"
import { useUser, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

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

// Gerar avatar padrão baseado no nome
const getAvatarFallback = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function NavUser() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { isMobile } = useSidebar()
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false)
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)
  const router = useRouter()
  
  if (!user) return null

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("👋 Logout realizado!", {
        description: "Você foi desconectado com sucesso."
      })
      router.push("/sign-in")
    } catch (error) {
      toast.error("❌ Erro ao fazer logout", {
        description: "Tente novamente em alguns instantes."
      })
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("❌ Nova senha é obrigatória", {
        description: "Por favor, digite a nova senha."
      })
      return
    }

    if (newPassword.length < 8) {
      toast.error("❌ Senha muito curta", {
        description: "A senha deve ter pelo menos 8 caracteres."
      })
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("❌ Senha insegura", {
        description: "A senha deve conter pelo menos uma letra maiúscula."
      })
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("❌ Senha insegura", {
        description: "A senha deve conter pelo menos uma letra minúscula."
      })
      return
    }

    if (!/\d/.test(newPassword)) {
      toast.error("❌ Senha insegura", {
        description: "A senha deve conter pelo menos um número."
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Senhas não conferem", {
        description: "A confirmação da senha deve ser igual à nova senha."
      })
      return
    }

    setIsChangingPassword(true)

    try {
      await user.updatePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
      })

      toast.success("✅ Senha alterada!", {
        description: "Sua senha foi alterada com sucesso."
      })
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setChangePasswordDialogOpen(false)
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      
      if (error.errors?.[0]?.code === 'form_password_incorrect') {
        toast.error("❌ Senha atual incorreta", {
          description: "Por favor, verifique sua senha atual."
        })
      } else if (error.errors?.[0]?.code === 'form_password_pwned') {
        toast.error("❌ Senha insegura", {
          description: "Esta senha é muito comum. Escolha uma senha mais segura."
        })
      } else {
        toast.error("❌ Erro ao alterar senha", {
          description: error.errors?.[0]?.message || "Tente novamente em alguns instantes."
        })
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress || 'Usuário'
  const displayEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || ''
  const displayAvatar = user.imageUrl || ''

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getAvatarFallback(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getAvatarFallback(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Dialog de Conta */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getAvatarFallback(displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Minha Conta
                </DialogTitle>
                <DialogDescription>
                  Visualize e gerencie suas informações de conta
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Dados do seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-foreground">{displayName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Principal</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-foreground">{displayEmail}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Senha</h4>
                      <p className="text-xs text-muted-foreground">
                        Última alteração: {user.passwordEnabled ? 'Configurada' : 'Não configurada'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setChangePasswordDialogOpen(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Autenticação de Dois Fatores</h4>
                      <p className="text-xs text-muted-foreground">
                        {user.twoFactorEnabled ? 'Habilitada' : 'Desabilitada'}
                      </p>
                    </div>
                    <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                      {user.twoFactorEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Informações do Sistema
                </CardTitle>
                <CardDescription>
                  Dados técnicos da conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">ID da Conta</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <code className="text-sm font-mono text-foreground break-all">{user.id}</code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Último Acesso</label>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="text-sm text-foreground">
                        {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter className="pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => setAccountDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Alterar Senha */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Alterar Senha
            </DialogTitle>
            <DialogDescription>
              Digite sua senha atual e defina uma nova senha segura
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Senha Atual */}
            <div className="space-y-3">
              <Label htmlFor="current-password" className="text-sm font-semibold text-foreground">
                Senha Atual *
              </Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={isChangingPassword}
                showValidation={false}
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Nova Senha */}
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                Nova Senha *
              </Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite uma nova senha segura"
                disabled={isChangingPassword}
                showValidation={newPassword.length > 0}
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                Confirmar Nova Senha *
              </Label>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                disabled={isChangingPassword}
                showValidation={false}
                className="bg-background border-input focus:border-primary focus:ring-primary/20"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  As senhas não conferem
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Senhas conferem!
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setChangePasswordDialogOpen(false)
              }}
              disabled={isChangingPassword}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={
                isChangingPassword || 
                !currentPassword.trim() || 
                !newPassword.trim() || 
                !confirmPassword.trim() ||
                newPassword !== confirmPassword ||
                newPassword.length < 8
              }
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none"
            >
              {isChangingPassword ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Alterando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Alterar Senha
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
