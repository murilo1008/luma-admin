"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"

import {
  Users,
  UserCheck,
  FileText,
  MessageSquare,
  MessageCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Phone,
  Mail,
  Shield,
  MoreHorizontal,
  UserPlus
} from "lucide-react"

import { api } from "@/trpc/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "sonner"
import TitlePage from "@/components/title-page"
import { AddPolicyDialog } from "@/components/dialogs/add-policy-dialog"

// Tipo para os dados do cliente
type Client = {
  id: string
  name: string
  email: string
  phone: string | null
  cpf: string | null
  isActive: boolean
  createdAt: Date
  _count: {
    insurances: number
    conversations: number
  }
  insurances: Array<{
    id: string
    status: string
    startDate: Date
    endDate: Date
    insuranceType: {
      name: string
    }
  }>
}

// Componente para ações das linhas da tabela
function ClientActionsCell({ 
  client, 
  onViewDetails,
  onUploadComplete
}: { 
  client: Client
  onViewDetails: (clientId: string) => void
  onUploadComplete: () => void
}) {
  // Função para formatar número de telefone para WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, "").replace(/^0+/, "")
  }

  const handleWhatsAppClick = () => {
    if (client.phone) {
      const phoneNumber = formatPhoneForWhatsApp(client.phone)
      const message = encodeURIComponent(`Olá ${client.name}! Sou seu assessor de seguros. Como posso ajudá-lo hoje?`)
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
    }
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent(`Contato - ${client.name}`)
    const body = encodeURIComponent(`Olá ${client.name},\n\nEspero que esteja bem! Sou seu assessor de seguros e gostaria de conversar sobre suas apólices.\n\nAguardo seu retorno.\n\nAtenciosamente,`)
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`, '_blank')
  }

  const handlePhoneClick = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`, '_blank')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onViewDetails(client.id)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AddPolicyDialog
          clientId={client.id}
          clientName={client.name}
          onUploadComplete={onUploadComplete}
          trigger={
            <Button variant="ghost" className="w-full justify-start h-8 px-2 py-1.5">
              <FileText className="mr-2 h-4 w-4" />
              Cadastrar Apólice
            </Button>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePhoneClick}>
          <Phone className="mr-2 h-4 w-4" />
          Ligar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailClick}>
          <Mail className="mr-2 h-4 w-4" />
          Enviar email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppClick}>
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Clients() {
  const { user } = useUser()
  const router = useRouter()
  const advisorId = user?.id // Assumindo que o user.id é o mesmo do advisor.id

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Estados para o dialog de criação de cliente
  const [createClientDialogOpen, setCreateClientDialogOpen] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
  })



  // Paginação
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Estatísticas mockadas
  const mockStats = {
    totalClients: 5,
    activeClients: 4,
    totalPolicies: 12,
    activePolicies: 10,
    totalConversations: 22,
    recentClients: 3
  }

  // Buscar estatísticas dos clientes
  const { data: stats, isLoading: statsLoading } = api.advisors.getMyClientsStats.useQuery(
    { advisorId: advisorId || "" },
    { 
      enabled: !!advisorId,
      refetchOnWindowFocus: false 
    }
  )

  // Usar estatísticas mockadas se não houver dados reais
  const finalStats = stats || mockStats

  // Dados mockados para clientes
  const mockClients: Client[] = [
    {
      id: "1",
      name: "Maria Silva Santos",
      email: "maria.silva@email.com",
      phone: "(11) 99999-1111",
      cpf: "123.456.789-01",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      _count: { insurances: 3, conversations: 5 },
      insurances: [
        {
          id: "1",
          status: "ACTIVE",
          startDate: new Date("2024-01-15"),
          endDate: new Date("2025-01-15"),
          insuranceType: { name: "Seguro de Vida" }
        },
        {
          id: "2", 
          status: "ACTIVE",
          startDate: new Date("2024-02-01"),
          endDate: new Date("2025-02-01"),
          insuranceType: { name: "Seguro Auto" }
        }
      ]
    },
    {
      id: "2",
      name: "João Pedro Oliveira",
      email: "joao.pedro@email.com",
      phone: "(11) 98888-2222",
      cpf: "987.654.321-09",
      isActive: true,
      createdAt: new Date("2024-02-20"),
      _count: { insurances: 2, conversations: 3 },
      insurances: [
        {
          id: "3",
          status: "ACTIVE", 
          startDate: new Date("2024-02-20"),
          endDate: new Date("2025-02-20"),
          insuranceType: { name: "Seguro Residencial" }
        }
      ]
    },
    {
      id: "3",
      name: "Ana Paula Costa",
      email: "ana.costa@email.com",
      phone: "(11) 97777-3333",
      cpf: "456.789.123-45",
      isActive: true,
      createdAt: new Date("2024-03-10"),
      _count: { insurances: 4, conversations: 8 },
      insurances: [
        {
          id: "4",
          status: "ACTIVE",
          startDate: new Date("2024-03-10"),
          endDate: new Date("2025-03-10"),
          insuranceType: { name: "Seguro de Vida" }
        }
      ]
    },
    {
      id: "4",
      name: "Carlos Eduardo Mendes",
      email: "carlos.mendes@email.com", 
      phone: "(11) 96666-4444",
      cpf: "789.123.456-78",
      isActive: false,
      createdAt: new Date("2023-12-05"),
      _count: { insurances: 1, conversations: 2 },
      insurances: [
        {
          id: "5",
          status: "EXPIRED",
          startDate: new Date("2023-12-05"),
          endDate: new Date("2024-12-05"),
          insuranceType: { name: "Seguro Auto" }
        }
      ]
    },
    {
      id: "5",
      name: "Fernanda Rodrigues Lima",
      email: "fernanda.lima@email.com",
      phone: "(11) 95555-5555",
      cpf: "321.654.987-12",
      isActive: true,
      createdAt: new Date("2024-04-18"),
      _count: { insurances: 2, conversations: 4 },
      insurances: [
        {
          id: "6",
          status: "ACTIVE",
          startDate: new Date("2024-04-18"),
          endDate: new Date("2025-04-18"),
          insuranceType: { name: "Seguro Empresarial" }
        }
      ]
    }
  ]

  // Buscar clientes
  const { data: clientsData, isLoading: clientsLoading } = api.advisors.getMyClients.useQuery(
    {
      advisorId: advisorId || "",
      search: globalFilter || undefined,
      isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    },
    { 
      enabled: !!advisorId,
      refetchOnWindowFocus: false 
    }
  )

  // Usar dados mockados se não houver dados reais ou se não estiver carregando
  const finalClientsData = clientsData?.data?.length ? clientsData : {
    data: mockClients.filter(client => {
      // Aplicar filtros aos dados mockados
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase()
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.cpf?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      
      if (statusFilter === "active") return client.isActive
      if (statusFilter === "inactive") return !client.isActive
      
      return true
    }).slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    ),
    total: mockClients.length,
    hasMore: false
  }



  // Mutation para criar cliente
  const utils = api.useUtils()
  const createClientMutation = api.advisors.createClient.useMutation({
    onSuccess: async (newClient) => {
      toast.success("Cliente criado com sucesso! 🎉", {
        description: `${newClient.name} foi adicionado à sua carteira`
      })
      
      // Invalidar e recarregar os dados
      await utils.advisors.getMyClients.invalidate()
      await utils.advisors.getMyClientsStats.invalidate()
      
      // Limpar e fechar dialog
      setNewClientData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
      })
      setCreateClientDialogOpen(false)
    },
    onError: (error) => {
      toast.error("Erro ao criar cliente ❌", {
        description: error.message
      })
    }
  })

  // Função para navegar para detalhes do cliente
  const handleViewClientDetails = (clientId: string) => {
    router.push(`/clients/${clientId}`)
  }

  // Callback para quando o upload for concluído
  const handleUploadComplete = async () => {
    // Invalidar dados para recarregar
    await utils.advisors.getMyClients.invalidate()
    await utils.advisors.getMyClientsStats.invalidate()
  }

  // Funções auxiliares para máscaras e validação
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === "cpf") {
      formattedValue = formatCPF(value)
    } else if (field === "phone") {
      formattedValue = formatPhone(value)
    }
    
    setNewClientData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  // Validação da senha
  const isPasswordValid = (password: string) => {
    const hasMinLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    return hasMinLength && hasUppercase && hasLowercase && hasNumber
  }

  // Função para criar cliente
  const handleCreateClient = async () => {
    if (!advisorId) {
      toast.error("Erro de autenticação", {
        description: "Sessão inválida, faça login novamente"
      })
      return
    }

    // Validações básicas
    if (!newClientData.name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    if (!newClientData.email.trim()) {
      toast.error("Email é obrigatório")
      return
    }

    if (!isPasswordValid(newClientData.password)) {
      toast.error("Senha não atende aos critérios de segurança")
      return
    }

    const loadingToast = toast.loading("Criando cliente...", {
      description: "Aguarde enquanto processamos os dados"
    })

    try {
      await createClientMutation.mutateAsync({
        advisorId,
        name: newClientData.name.trim(),
        email: newClientData.email.trim(),
        phone: newClientData.phone.replace(/\D/g, "") || undefined,
        cpf: newClientData.cpf.replace(/\D/g, "") || undefined,
        password: newClientData.password,
      })
    } finally {
      toast.dismiss(loadingToast)
    }
  }

  // Definição das colunas da tabela
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Cliente",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-foreground">{client.name}</div>
              <div className="text-xs text-muted-foreground">{client.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string | null
        return (
          <div className="text-sm text-muted-foreground">
            {phone || "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      cell: ({ row }) => {
        const cpf = row.getValue("cpf") as string | null
        return (
          <div className="text-sm text-muted-foreground">
            {cpf || "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "_count.insurances",
      header: "Apólices",
      cell: ({ row }) => {
        const count = row.original._count.insurances
        return (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {count}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "_count.conversations",
      header: "Conversas",
      cell: ({ row }) => {
        const count = row.original._count.conversations
        return (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {count}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Cliente desde",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date
        return (
          <div className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).format(new Date(date))}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <ClientActionsCell 
          client={row.original} 
          onViewDetails={handleViewClientDetails}
          onUploadComplete={handleUploadComplete}
        />
      ),
    },
  ]

  // Configurar tabela
  const table = useReactTable({
    data: finalClientsData.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil((finalClientsData?.total || 0) / pagination.pageSize),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="space-y-6">
      <TitlePage 
        title="Meus Clientes" 
        description="Gerencie sua carteira de clientes e acompanhe suas apólices"
      />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Total de Clientes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {finalStats?.totalClients || 0}
                  </p>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clientes Ativos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {finalStats?.activeClients || 0}
                  </p>
                )}
                <p className="text-xs text-green-600 dark:text-green-400">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Apólices */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                    {finalStats?.totalPolicies || 0}
                  </p>
                )}
                <p className="text-xs text-purple-600 dark:text-purple-400">Apólices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apólices Ativas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                    {finalStats?.activePolicies || 0}
                  </p>
                )}
                <p className="text-xs text-orange-600 dark:text-orange-400">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Conversas */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
                    {finalStats?.totalConversations || 0}
                  </p>
                )}
                <p className="text-xs text-cyan-600 dark:text-cyan-400">Conversas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Novos Clientes (30 dias) */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <UserPlus className="h-4 w-4 text-white" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : (
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {finalStats?.recentClients || 0}
                  </p>
                )}
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Novos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Gerencie e acompanhe todos os seus clientes
              </CardDescription>
            </div>
            <Dialog open={createClientDialogOpen} onOpenChange={setCreateClientDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Adicionar Novo Cliente
                  </DialogTitle>
                  <DialogDescription>
                    Cadastre um novo cliente em sua carteira. Todos os campos marcados com * são obrigatórios.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="client-name" className="text-sm font-semibold text-foreground">
                      Nome Completo *
                    </Label>
                    <Input
                      id="client-name"
                      placeholder="Digite o nome completo do cliente"
                      value={newClientData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={createClientMutation.isPending}
                      className="bg-background border-input focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="client-email" className="text-sm font-semibold text-foreground">
                      Email *
                    </Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newClientData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={createClientMutation.isPending}
                      className="bg-background border-input focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Telefone e CPF */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-phone" className="text-sm font-semibold text-foreground">
                        Telefone
                      </Label>
                      <Input
                        id="client-phone"
                        placeholder="(11) 99999-9999"
                        value={newClientData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={createClientMutation.isPending}
                        className="bg-background border-input focus:border-primary focus:ring-primary/20"
                        maxLength={15}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client-cpf" className="text-sm font-semibold text-foreground">
                        CPF
                      </Label>
                      <Input
                        id="client-cpf"
                        placeholder="000.000.000-00"
                        value={newClientData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        disabled={createClientMutation.isPending}
                        className="bg-background border-input focus:border-primary focus:ring-primary/20"
                        maxLength={14}
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="client-password" className="text-sm font-semibold text-foreground">
                      Senha *
                    </Label>
                    <PasswordInput
                      id="client-password"
                      value={newClientData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Digite uma senha segura"
                      disabled={createClientMutation.isPending}
                      showValidation={newClientData.password.length > 0}
                      className="bg-background border-input focus:border-primary focus:ring-primary/20"
                    />
                  </div>

                  {/* Preview do cliente */}
                  {newClientData.name && (
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Pré-visualização</h4>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {newClientData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      <div>
                          <div className="font-medium text-foreground">{newClientData.name}</div>
                          <div className="text-sm text-muted-foreground">{newClientData.email}</div>
                          {newClientData.phone && (
                            <div className="text-xs text-muted-foreground">{newClientData.phone}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateClientDialogOpen(false)}
                    disabled={createClientMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateClient}
                    disabled={
                      createClientMutation.isPending ||
                      !newClientData.name.trim() ||
                      !newClientData.email.trim() ||
                      !isPasswordValid(newClientData.password)
                    }
                    className="bg-gradient-to-r from-[#FF5F07] to-[#FF8A4B] hover:from-[#E54F06] hover:to-[#E67A3B] text-white"
                  >
                    {createClientMutation.isPending ? "Criando..." : "Criar Cliente"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    const columnName = {
                      name: "Cliente",
                      phone: "Telefone", 
                      cpf: "CPF",
                      "_count.insurances": "Apólices",
                      "_count.conversations": "Conversas",
                      isActive: "Status",
                      createdAt: "Cliente desde",
                      actions: "Ações"
                    }[column.id] || column.id

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {columnName}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {clientsLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {finalClientsData?.total ? (
                <>
                  Mostrando {pagination.pageIndex * pagination.pageSize + 1} a{" "}
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, finalClientsData.total)} de{" "}
                  {finalClientsData.total} cliente(s)
                </>
              ) : (
                "Nenhum cliente encontrado"
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}