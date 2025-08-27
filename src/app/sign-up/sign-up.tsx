"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Função para aplicar máscara de telefone brasileiro
const formatPhoneNumber = (value: string) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara baseado no tamanho
  if (numbers.length <= 2) {
    return `(${numbers}`
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  } else {
    // Para celular com 9 dígitos
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    assessorCode: "",
    acceptTerms: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    handleInputChange("phone", formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar lógica de cadastro
    console.log("Sign up attempt:", formData)
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12 w-[50%]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          {/* <div className="flex justify-center lg:justify-start">
            <Image
              src="/images/logo-completa-luma.svg"
              alt="Luma"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div> */}

          {/* Título */}
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Cadastre-se
            </h1>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-for">
                Nome completo
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Nome completo"
                required
                className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:border-primary focus:bg-white"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-for">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                required
                maxLength={15}
                className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:border-primary focus:bg-white"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Email"
                required
                className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:border-primary focus:bg-white"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-for">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Senha"
                  required
                  className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:border-primary focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Código do Assessor */}
            <div className="space-y-2">
              <Label htmlFor="assessorCode" className="text-sm font-medium text-for">
                Código do Assessor
              </Label>
              <Input
                id="assessorCode"
                type="text"
                value={formData.assessorCode}
                onChange={(e) => handleInputChange("assessorCode", e.target.value)}
                placeholder="Código do Assessor"
                className="h-12 rounded-xl border-gray-300 bg-gray-50 focus:border-primary focus:bg-white"
              />
            </div>

            {/* Termos e Condições */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleInputChange("acceptTerms", !!checked)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                <span>Aceitar</span>
                <Link href="/terms" className="text-primary hover:underline">
                  Termos e Condições
                </Link>
              </Label>
            </div>

            {/* Botão de cadastro */}
            <Button
              type="submit"
              disabled={!formData.acceptTerms}
              className="w-full h-12 bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Entrar
            </Button>

            {/* Link para login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  href="/sign-in"
                  className="text-primary hover:text-primary/80 font-medium underline transition-colors"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Seção visual */}
      <div className="hidden lg:flex justify-center lg:flex-1 bg-gradient-to-br from-[#2C1A47] via-[#4A2E6B] to-[#B796FF] relative overflow-hidden pl-0 w-[50%]">
        {/* Elementos animados de fundo */}
        <div className="absolute inset-0">
          {/* Partículas flutuantes */}
          <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-[20%] right-[20%] w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute top-[30%] left-[10%] w-3 h-3 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-[45%] right-[15%] w-2 h-2 bg-white/35 rounded-full animate-pulse"></div>
          <div className="absolute top-[60%] left-[20%] w-1 h-1 bg-white/50 rounded-full animate-ping"></div>
          <div className="absolute top-[75%] right-[25%] w-2 h-2 bg-white/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-[20%] left-[30%] w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
          
          {/* Formas geométricas flutuantes */}
          <div className="absolute top-[15%] right-[30%] w-8 h-8 border border-white/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute top-[50%] left-[5%] w-6 h-6 bg-white/10 rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-[30%] right-[10%] w-4 h-4 border border-white/30 rotate-12 animate-spin" style={{animationDuration: '15s'}}></div>
          
          {/* Linhas onduladas */}
          <div className="absolute top-[25%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-[70%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{animationDuration: '5s'}}></div>
          
          {/* Círculos com pulso */}
          <div className="absolute top-[40%] right-[5%] w-20 h-20 border border-white/10 rounded-full animate-ping" style={{animationDuration: '6s'}}></div>
          <div className="absolute bottom-[40%] left-[8%] w-16 h-16 border border-white/15 rounded-full animate-ping" style={{animationDuration: '8s'}}></div>
          
          {/* Gradientes móveis */}
          <div className="absolute top-[35%] left-[25%] w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full animate-pulse" style={{animationDuration: '7s'}}></div>
          <div className="absolute bottom-[25%] right-[20%] w-24 h-24 bg-gradient-radial from-white/8 to-transparent rounded-full animate-pulse" style={{animationDuration: '9s'}}></div>
        </div>

        {/* Efeitos de brilho */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[40%] w-1 h-20 bg-gradient-to-b from-white/20 to-transparent rotate-45 animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-[30%] right-[35%] w-1 h-16 bg-gradient-to-t from-white/25 to-transparent rotate-12 animate-pulse" style={{animationDuration: '4s'}}></div>
        </div>

        <div className="flex flex-col justify-center items-center text-white p-12 relative z-10">
          {/* Texto principal */}
          <div className="text-center space-y-6 max-w-md">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              Comece a gerenciar seus seguros de forma inteligente
            </h2>
          </div>

          {/* Ilustração real */}
          <div className="mt-12 relative flex justify-center items-center">
            <Image
              src="/images/sign-up-image.svg"
              alt="Pessoa gerenciando seguros de forma inteligente"
              width={400}
              height={400}
              className="w-80 h-80 object-contain animate-pulse"
              style={{animationDuration: '6s'}}
              priority
            />
          </div>
        </div>

        {/* Elementos decorativos originais com mais animações */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse" style={{animationDuration: '12s'}}></div>
        
        {/* Novos elementos decorativos animados */}
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-white/8 rounded-full blur-md animate-bounce" style={{animationDuration: '14s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-white/6 rounded-full blur-lg animate-pulse" style={{animationDuration: '16s'}}></div>
      </div>

      {/* Responsividade para mobile - mostrar título no topo */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#2C1A47] to-[#B796FF] p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">
            Comece a gerenciar seus seguros de forma inteligente
          </h2>
        </div>
      </div>

      {/* Espaçador para mobile */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}