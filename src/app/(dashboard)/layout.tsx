import type { Metadata } from "next"
import React, { type ReactNode } from "react"
import { headers } from "next/headers"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { DashboardHeader } from "@/components/header/header-dashboard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
export const metadata: Metadata = {
  title: "Luma",
  description: "Luma",
}

interface DashboardLayoutProps {
  children: ReactNode
}

interface BreadcrumbItemType {
  label: string
  href: string
  isLast: boolean
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}