import { auth } from "@clerk/nextjs/server"
import Home from "./home"
import TitlePage from "@/components/title-page"
import { redirect } from "next/navigation"
import { db } from "@/server/db"
import HomeAdvisor from "./home-advisor"
import HomeAdminOffice from "./home-admin-office"

export default async function HomePage() {

  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  })

  const userRole = user?.role

  const advisor = await db.advisor.findUnique({
    where: {
      id: userId
    }
  })

  return (
    <>
        <TitlePage title="Dashboard" />
        {userRole === "ADMIN" && <Home />}
        {userRole === "OFFICE_ADMIN" && <HomeAdminOffice />}
        {advisor && <HomeAdvisor />}
    </>
  )
}
