"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Home, Search, Shield, Zap, RotateCcw, Eye, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function NotFound() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAnimating, setIsAnimating] = React.useState(false)

  // Animação de shake no erro 404
  const handleShake = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
  }

  React.useEffect(() => {
    // Trigger shake animation on mount
    const timer = setTimeout(() => handleShake(), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/10 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating animated circles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-secondary/10 animate-pulse`}
            style={{
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`,
            }}
          />
        ))}
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full blur-xl animate-bounce opacity-60" 
             style={{ animationDuration: "3s" }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-bounce opacity-60" 
             style={{ animationDuration: "4s", animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 pt-8">
        {/* Main 404 Display */}
        <div className="space-y-6">
          <div 
            className={`relative inline-block ${isAnimating ? 'animate-pulse' : ''}`}
            onClick={handleShake}
          >
            {/* Large 404 Text with Gradient */}
            <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300 select-none">
              404
            </h1>
            
            {/* Floating alert icon */}
            <div className="absolute -top-4 -right-4 animate-bounce">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            
            {/* Decorative underline */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full animate-pulse" />
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground animate-fade-in">
              Oops! Página não encontrada
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
              A página que você está procurando não existe, foi movida ou está temporariamente indisponível. 
              Mas não se preocupe, vamos te ajudar a encontrar o que precisa! 🚀
            </p>
          </div>
        </div>

        {/* Interactive Search Section */}
        {/* <Card className="border-0 bg-gradient-to-br from-card/80 to-muted/50 backdrop-blur-sm shadow-2xl animate-slide-up">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-secondary/20">
                  <Search className="h-5 w-5 text-secondary animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Buscar no sistema
                </h3>
              </div>
              
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Digite o que você está procurando..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-center bg-background/80 border-secondary/20 focus:border-secondary focus:ring-secondary/20 rounded-xl"
                />
              </div>
              
              {searchTerm && (
                <div className="text-sm text-muted-foreground animate-fade-in">
                  🔍 Procurando por: "<span className="text-secondary font-medium">{searchTerm}</span>"
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Home Button */}
          <Link href="/">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/25 hover:to-secondary/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-secondary group-hover:scale-110 transition-transform duration-300">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Página Inicial</h4>
                <p className="text-sm text-muted-foreground">Voltar ao dashboard</p>
              </CardContent>
            </Card>
          </Link>

          {/* Insurance Types */}
          <Link href="/insurances/types">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-blue-500/15 to-blue-500/5 hover:from-blue-500/25 hover:to-blue-500/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Tipos de Seguros</h4>
                <p className="text-sm text-muted-foreground">Gerenciar tipos</p>
              </CardContent>
            </Card>
          </Link>

          {/* Users */}
          <Link href="/users">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-green-500/15 to-green-500/5 hover:from-green-500/25 hover:to-green-500/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-green-500 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Usuários</h4>
                <p className="text-sm text-muted-foreground">Ver usuários</p>
              </CardContent>
            </Card>
          </Link>

          {/* Refresh Page */}
          <Card 
            className="group cursor-pointer border-0 bg-gradient-to-br from-orange-500/15 to-orange-500/5 hover:from-orange-500/25 hover:to-orange-500/15 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => window.location.reload()}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-xl bg-orange-500 group-hover:scale-110 group-hover:rotate-180 transition-all duration-500">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
              </div>
              <h4 className="font-semibold text-foreground mb-1">Recarregar</h4>
              <p className="text-sm text-muted-foreground">Tentar novamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Help Section */}
        <Card className="border-0 bg-gradient-to-r from-muted/50 to-secondary/10 backdrop-blur-sm animate-fade-in-delay-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-secondary/20">
                  <Zap className="h-5 w-5 text-secondary animate-pulse" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Precisa de ajuda?</h4>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe está sempre pronta para ajudar
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="border-secondary/20 hover:bg-secondary/10">
                  📧 Contato
                </Button>
                <Button variant="outline" className="border-secondary/20 hover:bg-secondary/10">
                  📚 Documentação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Go Back Button */}
        <div className="pt-4">
          <Button 
            onClick={() => window.history.back()} 
            className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Voltar à página anterior
          </Button>
        </div>

        {/* Footer Message */}
        <div className="pt-8 opacity-60">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Dica:</strong> Use a navegação acima ou a busca para encontrar o que precisa
          </p>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay-2 {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in-delay-2 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}