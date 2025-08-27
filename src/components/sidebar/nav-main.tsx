"use client"

import { ChevronRight, Home, User, UserPlus, Handshake, type LucideIcon, HandPlatter, Briefcase, Building2, Users, BarChart3, Shield, FileText, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
  userRole,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  userRole?: string | null
}) {
  const pathname = usePathname()
  
  // Helper function to check if an item is active
  const isItemActive = (url: string, items?: { title: string; url: string }[]) => {
    return pathname === url || pathname.startsWith(url + "/") || items?.some(subItem => pathname === subItem.url)
  }
  
  // Renderizar navegação específica para Advisors
  if (userRole === 'ADVISOR') {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname === "/"}
            >
              <Link href="/" className="">
                <Home className={`size-4 ${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `}>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname === "/clients"}
            >
              <Link href="/clients" className="">
                <Users className={`size-4 ${pathname === "/clients" ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname === "/clients" ? "text-background" : "text-[#8d8b8b]"} `}>Clientes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname === "/reports"}
            >
              <Link href="/reports" className="">
                <BarChart3 className={`size-4 ${pathname === "/reports" ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname === "/reports" ? "text-background" : "text-[#8d8b8b]"} `}>Relatórios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname === "/profile"}
            >
              <Link href="/profile" className="">
                <User className={`size-4 ${pathname === "/profile" ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname === "/profile" ? "text-background" : "text-[#8d8b8b]"} `}>Perfil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }
  
  // Renderizar navegação específica para Office Admins
  if (userRole === 'OFFICE_ADMIN') {
    return (
      <SidebarGroup>
        <SidebarMenu>
          {/* Home */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname === "/"}
            >
              <Link href="/" className="">
                <Home className={`size-4 ${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `}>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Assessores */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
              data-active={pathname.startsWith("/advisors")}
            >
              <Link href="/advisors" className="">
                <Handshake className={`size-4 ${pathname.startsWith("/advisors") ? "text-background" : "text-[#8d8b8b]"} `} />
                <span className={`${pathname.startsWith("/advisors") ? "text-background" : "text-[#8d8b8b]"} `}>Assessores</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Seguros */}
          <Collapsible
            asChild
            defaultOpen={pathname.startsWith("/insurances") || pathname.startsWith("/policies")}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip="Seguros" 
                  className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
                  data-active={pathname.startsWith("/insurances") || pathname.startsWith("/policies")}
                >
                  <Shield className={`size-4 ${pathname.startsWith("/insurances") || pathname.startsWith("/policies") ? "text-background" : "text-[#8d8b8b]"} `} />
                  <span className={`${pathname.startsWith("/insurances") || pathname.startsWith("/policies") ? "text-background" : "text-[#8d8b8b]"} `}>Seguros</span>
                  <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${pathname.startsWith("/insurances") || pathname.startsWith("/policies") ? "text-background" : "text-[#8d8b8b]"} `} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      asChild 
                      className={`${pathname === "/policies" ? "text" : "text-[#8d8b8b]"}`}
                      isActive={pathname === "/policies"}
                    >
                      <Link href="/policies">
                        <span className={`${pathname === "/policies" ? "" : "text-[#8d8b8b]"}`}>Apólices</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      asChild 
                      className={`${pathname === "/insurers" ? "text" : "text-[#8d8b8b]"}`}
                      isActive={pathname === "/insurers"}
                    >
                      <Link href="/insurers">
                        <span className={`${pathname === "/insurers" ? "" : "text-[#8d8b8b]"}`}>Seguradoras</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          {/* Configurações */}
          <Collapsible
            asChild
            defaultOpen={pathname.startsWith("/settings") || pathname.startsWith("/members")}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip="Configurações" 
                  className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
                  data-active={pathname.startsWith("/settings") || pathname.startsWith("/members")}
                >
                  <Settings className={`size-4 ${pathname.startsWith("/settings") || pathname.startsWith("/members") ? "text-background" : "text-[#8d8b8b]"} `} />
                  <span className={`${pathname.startsWith("/settings") || pathname.startsWith("/members") ? "text-background" : "text-[#8d8b8b]"} `}>Configurações</span>
                  <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${pathname.startsWith("/settings") || pathname.startsWith("/members") ? "text-background" : "text-[#8d8b8b]"} `} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton 
                      asChild 
                      className={`${pathname === "/members" ? "text" : "text-[#8d8b8b]"}`}
                      isActive={pathname === "/members"}
                    >
                      <Link href="/members">
                        <span className={`${pathname === "/members" ? "" : "text-[#8d8b8b]"}`}>Membros</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    )
  }
  
  // Navegação padrão para Admins
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
            data-active={pathname === "/"}
          >
            <Link href="/" className="">
              <Home className={`size-4 ${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `} />
              <span className={`${pathname === "/" ? "text-background" : "text-[#8d8b8b]"} `}>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
            data-active={pathname === "/users"}
          >
            <Link href="/users" className="">
              <User className={`size-4 ${pathname === "/users" ? "text-background" : "text-[#8d8b8b]"} `} />
              <span className={`${pathname === "/users" ? "text-background" : "text-[#8d8b8b]"} `}>Usuários</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
            data-active={pathname === "/offices"}
          >
            <Link href="/offices" className="">
              <Building2 className={`size-4 ${pathname === "/offices" ? "text-background" : "text-[#8d8b8b]"} `} />
              <span className={`${pathname === "/offices" ? "text-background" : "text-[#8d8b8b]"} `}>Escritórios</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {/* <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
            data-active={pathname === "/brokers"}
          >
            <Link href="/brokers" className="">
              <Briefcase className={`size-4 ${pathname === "/brokers" ? "text-background" : "text-[#8d8b8b]"} `} />
              <span className={`${pathname === "/brokers" ? "text-background" : "text-[#8d8b8b]"} `}>Corretores</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10 data-[active=false]:text-[#8d8b8b]"
            data-active={pathname === "/advisors"}
          >
            <Link href="/advisors" className="">
              <Handshake className={`size-4 ${pathname === "/advisors" ? "text-background" : "text-[#8d8b8b]"} `} />
              <span className={`${pathname === "/advisors" ? "text-background" : "text-[#8d8b8b]"} `}>Assessores</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  className="rounded-full data-[active=true]:bg-secondary data-[active=true]:text-white hover:bg-secondary/10  data-[active=false]:text-[#8d8b8b]"
                  data-active={isItemActive(item.url, item.items)}
                >
                  {item.icon && (
                    <item.icon 
                      className={`size-4 ${isItemActive(item.url, item.items) ? "text-background" : "text-[#8d8b8b]"} `} 
                    />
                  )}
                  <span className={`${isItemActive(item.url, item.items) ? "text-background" : "text-[#8d8b8b]"} `}>
                    {item.title}
                  </span>
                  <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${isItemActive(item.url, item.items) ? "text-background" : "text-[#8d8b8b]"} `} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton 
                        asChild 
                        className={` ${pathname === subItem.url ? "text" : "text-[#8d8b8b]"}`}
                        isActive={pathname === subItem.url}
                      >
                        <Link href={subItem.url} className="">
                          <span className={`${pathname === subItem.url ? "" : "text-[#8d8b8b]"} `}>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
