"use client"

import { useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Camera,
  Settings,
  Lock,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PasswordInput } from "@/components/ui/password-input"
import TitlePage from "@/components/title-page"
import { api } from "@/trpc/react"

export default function Profile() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  
  // tRPC mutations
  const updateProfileMutation = api.users.updateMyProfile.useMutation()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
  })
  
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string) => {
    if (!value) return ""
    
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 6) {
      return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2')
    } else if (numbers.length <= 10) {
      // Formato para telefone fixo: (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      // Formato para celular: (00) 00000-0000
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value)
    setEditedUser(prev => ({ ...prev, phone: maskedValue }))
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF5F07]"></div>
      </div>
    )
  }

  const userRole = user?.publicMetadata?.role as string
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Admin Geral", color: "bg-red-100 text-red-700" }
      case "OFFICE_ADMIN":
        return { label: "Administrador", color: "bg-blue-100 text-blue-700" }
      case "ADVISOR":
        return { label: "Assessor", color: "bg-green-100 text-green-700" }
      default:
        return { label: "Usuário", color: "bg-gray-100 text-gray-700" }
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsUpdating(true)
    const loadingToast = toast.loading("Atualizando perfil...")
    
    try {
      // Usar o endpoint do backend para atualizar perfil
      await updateProfileMutation.mutateAsync({
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phone: editedUser.phone
      })
      
      // Recarregar dados do usuário
      await user.reload()
      
      setIsEditing(false)
      toast.dismiss(loadingToast)
      toast.success("✅ Perfil atualizado com sucesso!", {
        description: "Suas informações foram salvas."
      })
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      toast.dismiss(loadingToast)
      toast.error("❌ Erro ao atualizar perfil", {
        description: error.message || "Tente novamente."
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("❌ Erro na confirmação", {
        description: "As senhas não coincidem."
      })
      return
    }

    // Validações de critérios da senha
    const hasMinLength = passwordData.newPassword.length >= 8
    const hasUppercase = /[A-Z]/.test(passwordData.newPassword)
    const hasLowercase = /[a-z]/.test(passwordData.newPassword)
    const hasNumber = /\d/.test(passwordData.newPassword)
    
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
      toast.error("❌ Senha não atende aos critérios", {
        description: "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número."
      })
      return
    }

    setIsUpdating(true)
    const loadingToast = toast.loading("Alterando senha...")

    try {
      await user?.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordDialog(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.dismiss(loadingToast)
      toast.success("🔒 Senha alterada com sucesso!", {
        description: "Sua senha foi atualizada."
      })
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      toast.dismiss(loadingToast)
      toast.error("❌ Erro ao alterar senha", {
        description: error.message || "Verifique sua senha atual."
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const roleBadge = getRoleBadge(userRole)

  return (
    <div className="space-y-6">
      <TitlePage 
        title="Meu Perfil" 
        description="Gerencie suas informações pessoais e configurações de conta"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Principal do Perfil */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#FF5F07]" />
                Informações Pessoais
              </CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true)
                    setEditedUser({
                      firstName: user?.firstName || "",
                      lastName: user?.lastName || "",
                      phone: applyPhoneMask(user?.phoneNumbers?.[0]?.phoneNumber || ""),
                    })
                  }}
                  className="hover:bg-[#FF5F07] hover:text-white transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={isUpdating || updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating || updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto e Informações Básicas */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-[#FF5F07]/20">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-[#FF5F07] to-[#FF8A4B] text-white text-xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-2 border-[#FF5F07] hover:bg-[#FF5F07] hover:text-white"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {user?.fullName}
                  </h2>
                  <Badge className={`${roleBadge.color} font-medium`}>
                    {roleBadge.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Membro desde {new Intl.DateTimeFormat('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  }).format(new Date(user?.createdAt || ''))}
                </p>
              </div>
            </div>

            <Separator />

            {/* Formulário de Edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Seu nome"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.firstName || "Não informado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Seu sobrenome"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.lastName || "Não informado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.emailAddresses?.[0]?.emailAddress}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedUser.phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-md">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.phoneNumbers?.[0]?.phoneNumber || "Não informado"}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Ações */}
        <div className="space-y-6">
          {/* Card de Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#8B5CF6]" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-[#8B5CF6] hover:text-white transition-colors"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-[#8B5CF6]" />
                      Alterar Senha
                    </DialogTitle>
                    <DialogDescription>
                      Digite sua senha atual e escolha uma nova senha segura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <PasswordInput
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite sua nova senha"
                        showValidation={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <PasswordInput
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme sua nova senha"
                        showValidation={false}
                      />
                      {passwordData.confirmPassword.length > 0 && (
                        <div className={`text-xs flex items-center gap-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <>
                              <div className="h-3 w-3 rounded-full bg-green-600 flex items-center justify-center">
                                <div className="h-1 w-1 bg-white rounded-full"></div>
                              </div>
                              <span>Senhas coincidem</span>
                            </>
                          ) : (
                            <>
                              <div className="h-3 w-3 rounded-full bg-red-500 flex items-center justify-center">
                                <div className="h-1 w-1 bg-white rounded-full"></div>
                              </div>
                              <span>Senhas não coincidem</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPasswordDialog(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={
                        isUpdating || 
                        !passwordData.currentPassword || 
                        !passwordData.newPassword || 
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword ||
                        passwordData.newPassword.length < 8 ||
                        !/[A-Z]/.test(passwordData.newPassword) ||
                        !/[a-z]/.test(passwordData.newPassword) ||
                        !/\d/.test(passwordData.newPassword)
                      }
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#9333EA] text-white"
                    >
                      {isUpdating ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Card de Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#FF5F07]" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações gerais da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Conta criada</span>
                </div>
                <span className="text-sm font-medium">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(user?.createdAt || ''))}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Última atualização</span>
                </div>
                <span className="text-sm font-medium">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(user?.updatedAt || ''))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
