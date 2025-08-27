import { headers } from "next/headers";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import React from "react";
import { redirect } from "next/navigation";


interface BreadcrumbItemType {
    label: string
    href: string
    isLast: boolean
}

export async function DashboardHeader() {


    const headersList = await headers()
    const pathname = headersList.get("x-pathname") || "/"
    
    const segments = pathname.slice(1).split("/").filter(Boolean)
    
    const breadcrumbItems: BreadcrumbItemType[] = segments.map((segment: string, index: number) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      
      return {
        label,
        href,
        isLast: index === segments.length - 1
      }
    })

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 justify-between">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbItems.map((item: BreadcrumbItemType, index: number) => (
                        <React.Fragment key={item.href}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {item.isLast ? (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-2 px-4">
                <ModeToggle />
            </div>
        </header>
    )
}