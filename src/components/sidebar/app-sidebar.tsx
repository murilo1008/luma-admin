"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  Settings2,
  SquareTerminal,
  Home,
  Users,
  BarChart3,
  User as UserIcon,
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { api } from "@/trpc/react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavProjects } from "@/components/sidebar/nav-projects"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Componente para exibir o badge do tipo de usuário
function UserRoleBadge({ userRole }: { userRole: string | null }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const getRoleInfo = (role: string | null) => {
    switch (role) {
      case 'ADMIN':
        return { 
          text: 'Admin Geral', 
          shortText: 'AG',
          bgColor: 'bg-blue-500/10', 
          textColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200/50 dark:border-blue-800/50'
        }
      case 'OFFICE_ADMIN':
        return { 
          text: 'Administrador', 
          shortText: 'ADM',
          bgColor: 'bg-purple-500/10', 
          textColor: 'text-purple-600 dark:text-purple-400',
          borderColor: 'border-purple-200/50 dark:border-purple-800/50'
        }
      case 'ADVISOR':
        return { 
          text: 'Assessor', 
          shortText: 'ASS',
          bgColor: 'bg-green-500/10', 
          textColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-200/50 dark:border-green-800/50'
        }
      default:
        return { 
          text: 'Usuário', 
          shortText: 'USR',
          bgColor: 'bg-gray-500/10', 
          textColor: 'text-gray-600 dark:text-gray-400',
          borderColor: 'border-gray-200/50 dark:border-gray-800/50'
        }
    }
  }

  const roleInfo = getRoleInfo(userRole)

  if (isCollapsed) {
    return (
      <div className="flex justify-center h-10 w-10">
        <div 
          className={`
            h-6 w-6 rounded-full flex items-center justify-center text-[8px] border
            ${roleInfo.bgColor} ${roleInfo.textColor} ${roleInfo.borderColor}
          `}
          title={roleInfo.text}
        >
          {roleInfo.shortText}
        </div>
      </div>
    )
  }

  return (
    <div className="flex px-2 pb-2">
      <div 
        className={`
          w-full text-center py-1.5 px-3 rounded-lg text-xs font-medium border
          ${roleInfo.bgColor} ${roleInfo.textColor} ${roleInfo.borderColor}
          backdrop-blur-sm
        `}
      >
        {roleInfo.text}
      </div>
    </div>
  )
}

// Skeleton para o badge do usuário
function UserRoleBadgeSkeleton() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (isCollapsed) {
    return (
      <div className="flex justify-center pb-2 px-2">
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex px-2 pb-2">
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  )
}

// Componente de Loading Skeleton para a Sidebar
function SidebarSkeleton() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* Skeleton para itens principais */}
        {Array.from({ length: 5 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton className="rounded-full">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        
        {/* Skeleton para itens collapsible */}
        {Array.from({ length: 2 }).map((_, i) => (
          <SidebarMenuItem key={`collapsible-${i}`}>
            <SidebarMenuButton className="rounded-full">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-3 ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

// Skeleton para o footer (NavUser)
function SidebarFooterSkeleton() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
            <Skeleton className="h-4 w-4 ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

// Configurações de navegação para diferentes tipos de usuário
const getNavigationData = (userRole: string | null) => {
  const baseData = {
    teams: [
      {
        name: "Luma",
        logo: "/images/logo-icon.svg",
        plan: "Empresa",
      },
    ],
  }

  // Configuração para Advisors
  if (userRole === 'ADVISOR') {
    return {
      ...baseData,
      navMain: [], // Advisor não tem itens collapsible
      projects: [
        {
          name: "Design Engineering",
          url: "#",
          icon: Frame,
        },
        {
          name: "Sales & Marketing",
          url: "#",
          icon: PieChart,
        },
        {
          name: "Travel",
          url: "#",
          icon: Map,
        },
      ],
    }
  }

  // Configuração padrão para Admins
  return {
    ...baseData,
    navMain: [
      {
        title: "Seguros",
        url: "#",
        icon: PieChart,
        isActive: true,
        items: [
          {
            title: "Seguradoras",
            url: "/insurers",
          },
          {
            title: "Tipos de Seguro",
            url: "/insurances/types",
          },
        ],
      },
      {
        title: "Configurações",
        url: "/settings",
        icon: Settings,
        items: [
          {
            title: "Membros",
            url: "/members",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ],
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser()
  
  // Buscar dados do usuário do banco de dados
  const { data: currentUser, isLoading: isLoadingCurrentUser } = api.users.getCurrentUser.useQuery(
    undefined,
    {
      enabled: isLoaded && !!user, // Só executa se o Clerk já carregou
    }
  )
  
  // Determinar o tipo de usuário baseado nos dados do banco
  const userRole = currentUser?.role || null
  
  // Verificar se o usuário ainda está carregando
  const isLoadingUser = !isLoaded || (isLoaded && user === undefined) || isLoadingCurrentUser
  
  // Obter configuração de navegação baseada no tipo de usuário
  const data = getNavigationData(userRole)
  
  // Mostrar skeleton enquanto carrega
  if (isLoadingUser) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex h-12 items-center px-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="ml-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarSkeleton />
        </SidebarContent>
        <SidebarFooter>
          <UserRoleBadgeSkeleton />
          <SidebarFooterSkeleton />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="mt-5">
        <NavMain items={data.navMain} userRole={userRole} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <UserRoleBadge userRole={userRole} />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
