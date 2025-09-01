import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/server/db"
import Chat from "./chat"

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

async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        advisor: {
          select: {
            id: true,
            name: true,
            officeId: true
          }
        }
      }
    })

    if (!user) {
      redirect("/sign-in")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      officeId: user.officeId || undefined,
      advisor: user.advisor ? {
        id: user.advisor.id,
        name: user.advisor.name,
        officeId: user.advisor.officeId || undefined
      } : undefined
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    redirect("/sign-in")
  }
}

export default async function ChatPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/sign-in")
  }

  return (
    <Chat currentUser={currentUser} />
  )
}