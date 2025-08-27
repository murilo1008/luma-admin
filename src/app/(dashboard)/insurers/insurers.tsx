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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search, Filter, Shield, Building2, Settings, Eye, Pencil, Trash2, RotateCcw, SortAsc, SortDesc, ImageIcon } from "lucide-react"
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

// Importar componentes auxiliares
import { ActionsCell, ViewDialog, EditDialog } from "./components"

// Tipos de dados baseados no Prisma
export type Insurer = {
  id: string
  name: string
  photoUrl?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    insurances: number
  }
}

// Definição das colunas
export const columns: ColumnDef<Insurer>[] = [
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
          Seguradora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const insurer = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={insurer.photoUrl || ""} alt={insurer.name} />
            <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
              {insurer.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{insurer.name}</span>
            <span className="text-sm text-muted-foreground">
              {insurer._count.insurances} {insurer._count.insurances === 1 ? 'apólice' : 'apólices'}
            </span>
          </div>
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
      const insurer = row.original
      return <ActionsCell insurer={insurer} />
    },
  },
]

export default function Insurers() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<boolean | undefined>()
  const [sortOrder, setSortOrder] = React.useState<string>("default")

  // Queries tRPC
  const { data: queryResponse, isLoading } = api.insurers.getAll.useQuery({
    search: search || undefined,
    isActive: statusFilter,
    limit: 50,
    offset: 0
  })

  const { data: stats } = api.insurers.getStats.useQuery()

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

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
          <h1 className="text-3xl font-bold text-foreground">Seguradoras</h1>
          <p className="text-muted-foreground">
            Gerencie as seguradoras parceiras da plataforma
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Seguradora
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
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-secondary mb-1">{stats?.total || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">Total de Seguradoras</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">+{stats?.recent || 0}</span> novas esta semana
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
              <h3 className="text-lg font-semibold text-foreground mb-1">Seguradoras Ativas</h3>
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
                <span className="text-secondary font-medium">Seguradoras em uso</span>
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
              <h3 className="text-lg font-semibold text-foreground mb-1">Novas Seguradoras</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-secondary font-medium">Esta semana</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Seguradoras */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Lista de Seguradoras</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as seguradoras parceiras da plataforma
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
                    placeholder="Buscar seguradoras..."
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
                          <p className="text-muted-foreground">Carregando seguradoras...</p>
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