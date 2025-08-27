"use client"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded) return

    // Validações básicas
    if (!email.trim()) {
      toast.error("❌ Email é obrigatório", {
        description: "Por favor, digite seu email."
      })
      return
    }

    if (!password.trim()) {
      toast.error("❌ Senha é obrigatória", {
        description: "Por favor, digite sua senha."
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Tentativa de login com Clerk
      const loadingToastId = toast.loading("🔑 Fazendo login...", {
        description: "Verificando suas credenciais. Aguarde um momento."
      })

      const result = await signIn.create({
        identifier: email,
        password: password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        
        toast.dismiss() // Remove loading toast
        toast.success("🎉 Login realizado com sucesso!", {
          description: "Bem-vindo de volta! Redirecionando para o dashboard."
        })
        
        // Redirecionar para a página inicial
        router.push("/")
      } else {
        toast.dismiss() // Remove loading toast
        toast.error("❌ Login incompleto", {
          description: "Verifique suas credenciais e tente novamente."
        })
      }
    } catch (err: any) {
      toast.dismiss() // Remove loading toast
      
      // Tratar erros específicos do Clerk
      let errorMessage = "Erro interno. Tente novamente mais tarde."
      
      if (err.errors?.[0]) {
        const clerkError = err.errors[0]
        
        switch (clerkError.code) {
          case "form_identifier_not_found":
            errorMessage = "Email não encontrado. Verifique o email digitado."
            break
          case "form_password_incorrect":
            errorMessage = "Senha incorreta. Tente novamente."
            break
          case "form_identifier_exists":
            errorMessage = "Credenciais inválidas. Verifique email e senha."
            break
          default:
            errorMessage = clerkError.message || errorMessage
        }
      }
      
      toast.error("❌ Falha no login", {
        description: errorMessage,
        action: {
          label: "Tentar Novamente",
          onClick: () => {
            // O usuário pode tentar fazer login novamente
          }
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2C1A47] to-[#B796FF] p-4 relative overflow-hidden">
      {/* Elementos animados de fundo */}
      <div className="absolute inset-0">
        {/* Partículas flutuantes */}
        <div className="absolute top-[8%] left-[12%] w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-[15%] right-[18%] w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute top-[25%] left-[8%] w-3 h-3 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute top-[40%] right-[12%] w-2 h-2 bg-white/35 rounded-full animate-pulse"></div>
        <div className="absolute top-[55%] left-[15%] w-1 h-1 bg-white/50 rounded-full animate-ping"></div>
        <div className="absolute top-[70%] right-[20%] w-2 h-2 bg-white/25 rounded-full animate-bounce"></div>
        <div className="absolute bottom-[15%] left-[25%] w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute top-[35%] right-[35%] w-1 h-1 bg-white/45 rounded-full animate-ping"></div>
        <div className="absolute bottom-[25%] right-[8%] w-3 h-3 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute top-[80%] left-[40%] w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        
        {/* Formas geométricas flutuantes */}
        <div className="absolute top-[12%] right-[25%] w-8 h-8 border border-white/20 rotate-45 animate-spin" style={{animationDuration: '18s'}}></div>
        <div className="absolute top-[45%] left-[3%] w-6 h-6 bg-white/10 rounded-full animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-[35%] right-[6%] w-4 h-4 border border-white/30 rotate-12 animate-spin" style={{animationDuration: '22s'}}></div>
        <div className="absolute top-[60%] right-[45%] w-5 h-5 border border-white/25 rotate-90 animate-spin" style={{animationDuration: '16s'}}></div>
        <div className="absolute bottom-[50%] left-[35%] w-7 h-7 bg-white/8 rounded-full animate-pulse" style={{animationDuration: '5s'}}></div>
        
        {/* Linhas onduladas */}
        <div className="absolute top-[20%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-[65%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" style={{animationDuration: '7s'}}></div>
        <div className="absolute top-[85%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/12 to-transparent animate-pulse" style={{animationDuration: '8s'}}></div>
        
        {/* Círculos com pulso */}
        <div className="absolute top-[30%] right-[2%] w-20 h-20 border border-white/10 rounded-full animate-ping" style={{animationDuration: '9s'}}></div>
        <div className="absolute bottom-[30%] left-[5%] w-16 h-16 border border-white/15 rounded-full animate-ping" style={{animationDuration: '11s'}}></div>
        <div className="absolute top-[50%] left-[80%] w-12 h-12 border border-white/12 rounded-full animate-ping" style={{animationDuration: '13s'}}></div>
        <div className="absolute bottom-[60%] right-[75%] w-18 h-18 border border-white/8 rounded-full animate-ping" style={{animationDuration: '15s'}}></div>
        
        {/* Gradientes móveis */}
        <div className="absolute top-[25%] left-[20%] w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-[20%] right-[15%] w-24 h-24 bg-gradient-radial from-white/8 to-transparent rounded-full animate-pulse" style={{animationDuration: '12s'}}></div>
        <div className="absolute top-[70%] left-[60%] w-28 h-28 bg-gradient-radial from-white/6 to-transparent rounded-full animate-pulse" style={{animationDuration: '14s'}}></div>
        <div className="absolute top-[10%] left-[70%] w-20 h-20 bg-gradient-radial from-white/7 to-transparent rounded-full animate-pulse" style={{animationDuration: '11s'}}></div>
      </div>

      {/* Efeitos de brilho */}
      <div className="absolute inset-0">
        <div className="absolute top-[18%] left-[35%] w-1 h-20 bg-gradient-to-b from-white/20 to-transparent rotate-45 animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-[25%] right-[30%] w-1 h-16 bg-gradient-to-t from-white/25 to-transparent rotate-12 animate-pulse" style={{animationDuration: '5s'}}></div>
        <div className="absolute top-[45%] left-[85%] w-1 h-18 bg-gradient-to-b from-white/18 to-transparent rotate-75 animate-pulse" style={{animationDuration: '6s'}}></div>
        <div className="absolute bottom-[55%] left-[10%] w-1 h-14 bg-gradient-to-t from-white/22 to-transparent rotate-30 animate-pulse" style={{animationDuration: '7s'}}></div>
      </div>

      {/* Elementos decorativos grandes */}
      <div className="absolute top-16 left-16 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{animationDuration: '20s'}}></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDuration: '25s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-white/8 rounded-full blur-lg animate-pulse" style={{animationDuration: '18s'}}></div>
      <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-white/12 rounded-full blur-md animate-bounce" style={{animationDuration: '22s'}}></div>
      <div className="absolute bottom-1/3 left-1/2 w-16 h-16 bg-white/6 rounded-full blur-lg animate-pulse" style={{animationDuration: '24s'}}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo-completa-luma.svg"
              alt="Luma"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Bem-vindo novamente
          </h1>
        </div>

        {/* Card de login */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                required
                disabled={isLoading}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:ring-white/20 h-12 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Link esqueceu senha */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-white/80 hover:text-white text-sm underline transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão de login */}
            <Button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full h-12 bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>

            {/* Link de cadastro */}
            <div className="text-center pt-4">
              <p className="text-white/80 text-sm">
                Ainda não tem conta?{" "}
                <Link
                  href="/sign-up"
                  className="text-[#FF5F07] hover:text-[#FF8A4B] font-medium underline transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-xs">
            © 2025 Luma. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}