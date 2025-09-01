"use client"

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Users, MessageCircle, Bot, User, Loader2, Plus, Search, MoreHorizontal, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import useChat from '@/hooks/use-chat'
import TitlePage from "@/components/title-page"

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
  officeId?: string
  advisor?: {
    id: string
    name: string
    officeId?: string
  }
}

interface ChatProps {
  currentUser: CurrentUser
}

export default function Chat({ currentUser }: ChatProps) {
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    selectedUserId,
    currentConversation,
    messages,
    conversations,
    availableUsers,
    userPolicies,
    isLoading,
    isStreaming,
    startNewConversation,
    selectConversation,
    sendMessage,
    changeUser,
  } = useChat(currentUser)

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize do textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [messageInput])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUserId) return
    
    await sendMessage(messageInput)
    setMessageInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleUserSelect = (userId: string) => {
    changeUser(userId)
    setIsSidebarOpen(false) // Fechar sidebar em mobile após seleção
  }

  const selectedUser = availableUsers.find(user => user.id === selectedUserId)

  // Filtrar conversas baseado na busca
  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    selectedUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const logoLuma = "/images/logo-icon.svg"

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/50">
      {/* Header Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Image src={logoLuma} alt="Luma Logo" width={24} height={24} />
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">Luma AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assistente de Seguros</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      
      <div className="flex-1 flex gap-1 p-2 sm:p-4 lg:p-6 min-h-0 overflow-hidden relative">
        {/* Overlay Mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Conversas */}
        <Card className={`
          w-80 flex flex-col border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl min-h-0 overflow-hidden
          lg:relative lg:translate-x-0 lg:z-auto lg:block
          ${isSidebarOpen 
            ? 'max-lg:fixed max-lg:left-2 max-lg:top-2 max-lg:bottom-2 max-lg:z-50 max-lg:transform max-lg:translate-x-0' 
            : 'max-lg:fixed max-lg:-left-80 max-lg:top-2 max-lg:bottom-2 max-lg:z-50 max-lg:transform'
          }
          max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out
          max-lg:w-[calc(100vw-1rem)] max-lg:max-w-80
        `}>
          {/* Header da Sidebar */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4 lg:p-6 lg:pb-4">
            <div className="hidden lg:flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <Image src={logoLuma} alt="Luma Logo" width={24} height={24} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Luma AI
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assistente de Seguros</p>
              </div>
            </div>
            
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chat</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Seleção de Usuário */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Selecionar Cliente</label>
                {availableUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {availableUsers.length} {availableUsers.length === 1 ? 'cliente' : 'clientes'}
                  </Badge>
                )}
              </div>
              
              <Select value={selectedUserId || ''} onValueChange={handleUserSelect}>
                <SelectTrigger className="group h-12 border-2 border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-800 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300 ease-in-out focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 shadow-sm hover:shadow-md rounded-xl">
                  <div className="flex items-center gap-3 w-full">
                    {selectedUser ? (
                      <>
                        <div className="relative">
                          <Avatar className="w-9 h-9 shadow-md ring-2 ring-white dark:ring-gray-700 transition-transform duration-200 group-hover:scale-105">
                            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white font-bold border border-blue-300/50">
                              {selectedUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm leading-tight">{selectedUser.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 opacity-80">{selectedUser.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700 text-xs px-2 py-1 font-medium shadow-sm">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></div>
                            Ativo
                          </Badge>
                          <div className="text-gray-400 dark:text-gray-500 transition-transform duration-200 group-hover:rotate-180">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center border-2 border-blue-100/60 dark:border-blue-800/60 transition-all duration-200 group-hover:scale-105 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-gray-700 dark:text-gray-300 font-semibold text-sm">Selecionar cliente</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 opacity-80">Escolha um cliente para começar</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-100/60 dark:bg-gray-700/60 px-2 py-1 rounded-md">
                            <Users className="w-3 h-3" />
                            <span>{availableUsers.length}</span>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500 transition-transform duration-200 group-hover:rotate-180">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SelectTrigger>
                
                <SelectContent className="w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-800 dark:text-gray-200">Carregando clientes</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Aguarde um momento...</p>
                        </div>
                      </div>
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-800 dark:text-gray-200">Nenhum cliente encontrado</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verifique suas permissões ou contate o administrador</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Clientes Disponíveis
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {availableUsers.length} {availableUsers.length === 1 ? 'cliente' : 'clientes'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {availableUsers.map(user => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id}
                            className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                          >
                            <div className="flex items-center gap-4 w-full">
                              <Avatar className="w-12 h-12 shadow-sm">
                                <AvatarFallback className="text-base bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                                  {user.role && (
                                    <Badge variant="outline" className="text-xs py-0.5 px-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                      {user.role === 'CLIENT' ? 'Cliente' : user.role}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                                {user.office?.name && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-1 flex items-center gap-1">
                                    <span>📍</span> {user.office.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Informações do Cliente Selecionado */}
            {selectedUser && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Avatar className="w-8 h-8 sm:w-12 sm:h-12 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm sm:text-base">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-lg">{selectedUser.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{selectedUser.email}</p>
                  </div>
                  <div className="text-green-500 dark:text-green-400">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Cliente ativo</span>
                  </div>
                  
                  {userPolicies.length > 0 ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-2 sm:px-3 py-1 text-xs">
                      {userPolicies.length} apólice{userPolicies.length > 1 ? 's' : ''} ativa{userPolicies.length > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 px-2 sm:px-3 py-1 text-xs">
                      Sem apólices
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator className="mx-4 sm:mx-6 lg:mx-6 bg-gray-200 dark:bg-gray-700" />

          {/* Lista de Conversas */}
          <div className="flex-1 flex flex-col px-4 sm:px-6 py-3 sm:py-4 lg:px-6 lg:py-4 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Conversas</h3>
              {selectedUserId && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    startNewConversation(selectedUserId)
                    setIsSidebarOpen(false) // Fechar sidebar em mobile após criar nova conversa
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Busca de Conversas */}
            {conversations.length > 0 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            )}
            
            <ScrollArea className="flex-1 max-h-full">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {selectedUserId ? "Nenhuma conversa ainda" : "Selecione um cliente"}
                  </p>
                  {selectedUserId && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Inicie uma conversa para começar
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map(conversation => (
                    <Button
                      key={conversation.id}
                      variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                      className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
                        currentConversation?.id === conversation.id 
                          ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-sm" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent text-gray-900 dark:text-gray-100"
                      }`}
                      onClick={() => {
                        selectConversation(conversation)
                        setIsSidebarOpen(false) // Fechar sidebar em mobile após seleção
                      }}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium truncate">
                          {conversation.title || 'Nova conversa'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {conversation.updatedAt.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </Card>

        {/* Área Principal - Chat */}
        <Card className={`
          flex-1 flex flex-col border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl min-h-0 overflow-hidden
          lg:ml-1
          ${isSidebarOpen ? 'max-lg:hidden' : ''}
        `}>
          {!selectedUserId ? (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="text-center space-y-6 sm:space-y-8 max-w-md">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center shadow-2xl border border-gray-200 dark:border-gray-700">
                    <Image src={logoLuma} alt="Luma Logo" width={48} height={48} className="sm:w-12 sm:h-12 w-12 h-12" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Bem-vindo ao Luma AI
                  </h1>
                  <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Sua assistente inteligente especializada em seguros
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="hidden sm:inline">Selecione um cliente para começar uma conversa personalizada sobre suas apólices</span>
                    <span className="sm:hidden">Toque no menu para selecionar um cliente</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-medium">{availableUsers.length} clientes disponíveis</span>
                </div>
              </div>
            </div>
          ) : !currentConversation ? (
            /* Conversation Starter */
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="text-center space-y-6 sm:space-y-8 max-w-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-2xl mx-auto flex items-center justify-center shadow-xl border border-gray-200 dark:border-gray-700">
                  <Image src={logoLuma} alt="Luma Logo" width={40} height={40} className="sm:w-10 sm:h-10 w-10 h-10" />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Pronto para ajudar!</h2>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Vou analisar as apólices de <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser?.name}</span> e 
                    responder suas perguntas com precisão
                  </p>
                </div>
                <Button 
                  onClick={() => startNewConversation(selectedUserId)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 px-4 py-2 sm:px-6 sm:py-3"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Iniciar Conversa
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header da Conversa */}
              <div className="p-4 sm:p-6 pb-3 sm:pb-4 lg:p-6 lg:pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-base sm:text-lg">
                      {selectedUser?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{selectedUser?.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userPolicies.length > 0 
                        ? `${userPolicies.length} apólice(s) • Online agora`
                        : 'Sem apólices • Online agora'
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-xs px-2 py-1 hidden sm:flex">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      Luma AI
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-1 sm:p-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 flex flex-col min-h-0">
                <div 
                  className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 lg:px-6 lg:py-4 scroll-smooth"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#e5e7eb #f3f4f6'
                  }}
                >
                  <div className="space-y-4 sm:space-y-6">
                    {messages.length === 0 && !isStreaming && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-800 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-md border border-gray-100 dark:border-gray-700">
                          <Image src={logoLuma} alt="Luma Logo" width={32} height={32} className="sm:w-8 sm:h-8 w-8 h-8" />
                        </div>
                        <div className="space-y-2 sm:space-y-3 max-w-sm mx-auto">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Olá! Sou a Luma ✨
                          </h3>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            Sua assistente especializada em seguros. Estou aqui para ajudar com as apólices de{' '}
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser?.name}</span>.
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Faça qualquer pergunta sobre coberturas, valores, beneficiários ou vigências!
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-4 ${message.messageType === 'USER' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.messageType === 'AI' && (
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1 shadow-md flex-shrink-0">
                            <AvatarFallback className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <Image src={logoLuma} alt="Luma Logo" width={20} height={20} className="sm:w-5 sm:h-5 w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] ${
                            message.messageType === 'USER'
                              ? 'order-1'
                              : 'order-2'
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm ${
                              message.messageType === 'USER'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white ml-8 sm:ml-12'
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                            }`}
                          >
                            <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                              message.messageType === 'USER' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {message.content}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 sm:mt-2 ${
                            message.messageType === 'USER' 
                              ? 'text-right text-gray-400 dark:text-gray-500 mr-8 sm:mr-12' 
                              : 'text-left text-gray-500 dark:text-gray-400 ml-1 sm:ml-2'
                          }`}>
                            {message.createdAt.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {message.aiTokensUsed && (
                              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                                • {message.aiTokensUsed} tokens
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {message.messageType === 'USER' && (
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1 shadow-md flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white">
                              <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isStreaming && (
                      <div className="flex gap-2 sm:gap-4 justify-start">
                        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mt-1 shadow-md flex-shrink-0">
                          <AvatarFallback className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <Image src={logoLuma} alt="Luma Logo" width={20} height={20} className="sm:w-5 sm:h-5 w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              <span className="hidden sm:inline">Luma está analisando as apólices...</span>
                              <span className="sm:hidden">Analisando...</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input de Mensagem */}
                <div className="p-3 sm:p-6 pt-3 sm:pt-4 lg:p-6 lg:pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
                  <div className="flex gap-2 sm:gap-4 lg:gap-4 items-end">
                    <div className="flex-1 relative">
                      <Textarea
                        ref={inputRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedUser ? `Pergunte sobre as apólices de ${selectedUser?.name}...` : "Selecione um cliente primeiro..."}
                        disabled={isStreaming || !selectedUser}
                        className="min-h-[40px] sm:min-h-[50px] lg:min-h-[50px] max-h-[100px] sm:max-h-[120px] lg:max-h-[120px] rounded-2xl sm:rounded-full lg:rounded-full resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200 text-sm sm:text-base lg:text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        rows={1}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isStreaming || !selectedUser}
                      className="bg-gradient-to-r rounded-full from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 h-[40px] sm:h-[50px] lg:h-[50px] w-[40px] sm:w-[50px] lg:w-[50px] px-4"
                    >
                      {isStreaming ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                  </div>
                  
                  {selectedUser && userPolicies.length > 0 && (
                    <div className="mt-3 sm:mt-4 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 inline-block px-2 sm:px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                        <span className="hidden sm:inline">💡 Posso analisar e comparar as {userPolicies.length} apólice(s) de {selectedUser?.name} • Peça sugestões, análises ou esclarecimentos</span>
                        <span className="sm:hidden">💡 {userPolicies.length} apólice(s) • Faça perguntas</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}