import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { getAvailableUsersAction, getUserPoliciesAction, getPolicyContextAction } from '@/app/(dashboard)/chat/actions'
import OpenAI from 'openai'

interface Message {
  id: string
  content: string
  messageType: 'USER' | 'AI' | 'SYSTEM'
  createdAt: Date
  userId: string
  conversationId: string
  aiTokensUsed?: number
}

interface Conversation {
  id: string
  title?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  messages: Message[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  advisor?: {
    id: string
    name: string
  }
  office?: {
    id: string
    name: string
  }
}

interface UserPolicy {
  policyNumber: string
  insurerName: string
  type: string
  insuredAmount: string
  premiumValue: string
  startDate: string
  endDate: string
  status: string
  coverages?: Array<{
    name: string
    coveredAmount: string
    description?: string
  }>
  beneficiaries?: Array<{
    name: string
    relationship: string
    percentage: number
  }>
}

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

export default function useChat(currentUser: CurrentUser) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Buscar usuários disponíveis baseado no role
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        const users = await getAvailableUsersAction(
          currentUser.id,
          currentUser.role,
          currentUser.role === 'ADVISOR' ? currentUser.advisor?.officeId || undefined : currentUser.officeId || undefined
        )
        setAvailableUsers(users)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        toast.error('Erro ao carregar usuários disponíveis')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [currentUser])

  // Buscar apólices do usuário quando selecionado
  useEffect(() => {
    const loadUserPolicies = async () => {
      if (!selectedUserId) return

      try {
        const policies = await getUserPoliciesAction(selectedUserId)
        setUserPolicies(policies)
      } catch (error) {
        console.error('Erro ao carregar apólices:', error)
        setUserPolicies([])
      }
    }

    loadUserPolicies()
  }, [selectedUserId])

  // Gerar resposta da IA com streaming
  const generateAIResponseStreaming = useCallback(async (
    userMessage: string, 
    userId: string,
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    const selectedUser = availableUsers.find(u => u.id === userId)
    
    if (!selectedUser) {
      onChunk('Erro: Usuário não encontrado.')
      return
    }

    try {
      // Buscar contexto das apólices
      const policyContext = await getPolicyContextAction(userId)
      
      // Configurar OpenAI
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      })

      // Criar stream
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Você é Luma, um assistente especializado em seguros brasileiro, expert em apólices de seguro e produtos do mercado segurador nacional.

CONTEXTO DAS APÓLICES DO USUÁRIO (${selectedUser.name}):
${policyContext}

INSTRUÇÕES PARA ATENDIMENTO:
1. 📋 Responda sempre em português brasileiro, de forma clara e profissional
2. 🔍 Use as informações das apólices do usuário para dar respostas precisas e personalizadas
3. 💡 Seja proativo: sugira análises, dicas de otimização, ou ações baseadas nas apólices
4. ⚠️ Se não tiver informação específica sobre algo nas apólices, informe claramente
5. 📊 Quando relevante, compare coberturas entre diferentes apólices do usuário
6. 💰 Ajude o usuário a entender valores, prazos, carências e benefícios
7. 🚨 Destaque informações importantes sobre vencimentos ou ações necessárias
8. 📱 Mantenha respostas organizadas e fáceis de ler em dispositivos móveis

ESPECIALIDADES:
- Análise de coberturas e benefícios
- Explicação de termos técnicos de seguros
- Orientações sobre sinistros e reembolsos
- Comparação de produtos e apólices
- Dicas de otimização de carteira de seguros
- Alertas sobre vigências e renovações

Responda de forma humanizada, empática e sempre focada nos interesses do usuário.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      })

      // Processar stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          onChunk(content)
        }
      }
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error)
      onChunk('Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.')
    }
  }, [availableUsers])

  const startNewConversation = useCallback(async (userId: string) => {
    if (!userId) return

    try {
      setIsLoading(true)
      setSelectedUserId(userId)
      setMessages([])
      setCurrentConversation(null)

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: 'Nova conversa',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: []
      }

      setCurrentConversation(newConversation)
      setConversations(prev => [newConversation, ...prev])
    } catch (error) {
      console.error('Erro ao criar conversa:', error)
      toast.error('Erro ao criar nova conversa')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectConversation = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation)
    setMessages(conversation.messages || [])
    setSelectedUserId(conversation.userId)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation || !selectedUserId) {
      toast.error('Selecione um usuário e inicie uma conversa')
      return
    }

    if (isStreaming) {
      toast.error('Aguarde a resposta anterior terminar')
      return
    }

    // Adicionar mensagem temporária da IA (streaming) - definir fora do try para acesso no catch
    const tempAiMessageId = `msg-ai-${Date.now()}`

    try {
      setIsStreaming(true)

      // Adicionar mensagem do usuário imediatamente na UI
      const userMessage: Message = {
        id: `msg-user-${Date.now()}`,
        content,
        messageType: 'USER',
        createdAt: new Date(),
        userId: selectedUserId,
        conversationId: currentConversation.id,
      }

      setMessages(prev => [...prev, userMessage])

      const tempAiMessage: Message = {
        id: tempAiMessageId,
        content: '',
        messageType: 'AI',
        createdAt: new Date(),
        userId: selectedUserId,
        conversationId: currentConversation.id,
      }

      setMessages(prev => [...prev, tempAiMessage])

      let fullAiResponse = ''

      // Gerar resposta da IA com streaming
      await generateAIResponseStreaming(content, selectedUserId, (chunk: string) => {
        fullAiResponse += chunk
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempAiMessageId
              ? { ...msg, content: fullAiResponse }
              : msg
          )
        )
      })

      // Finalizar mensagem da IA
      const finalAiMessage: Message = {
        id: `msg-ai-final-${Date.now()}`,
        content: fullAiResponse,
        messageType: 'AI',
        createdAt: new Date(),
        userId: selectedUserId,
        conversationId: currentConversation.id,
        aiTokensUsed: Math.floor(fullAiResponse.length / 4)
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAiMessageId ? finalAiMessage : msg
        )
      )

      // Atualizar conversa com timestamp
      const updatedConversation: Conversation = {
        ...currentConversation,
        updatedAt: new Date()
      }

      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      )
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
      
      // Remover mensagem temporária da IA em caso de erro
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempAiMessageId)
      )
    } finally {
      setIsStreaming(false)
    }
  }, [currentConversation, selectedUserId, isStreaming, generateAIResponseStreaming, messages])

  const stopStreaming = useCallback(() => {
    setIsStreaming(false)
  }, [])

  const changeUser = useCallback((userId: string) => {
    if (userId !== selectedUserId) {
      startNewConversation(userId)
    }
  }, [selectedUserId, startNewConversation])

  const getConversationsForUser = useCallback((userId: string) => {
    return conversations.filter(conv => conv.userId === userId)
  }, [conversations])

  return {
    // State
    selectedUserId,
    currentConversation,
    messages,
    conversations: selectedUserId ? getConversationsForUser(selectedUserId) : [],
    availableUsers,
    userPolicies,
    isLoading,
    isStreaming,
    
    // Actions
    startNewConversation,
    selectConversation,
    sendMessage,
    stopStreaming,
    changeUser,
  }
}