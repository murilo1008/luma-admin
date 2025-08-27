import TitlePage from "@/components/title-page";
import Advisors from "./advisors";
import OfficeAdvisors from "./advisors-office";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";

export default async function AdvisorsPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    const currentUser = await db.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            office: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    // Verificar se é administrador geral ou administrador de escritório
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "OFFICE_ADMIN") {
        redirect("/")
    }

    // Para OFFICE_ADMIN, verificar se tem escritório vinculado
    if (currentUser?.role === "OFFICE_ADMIN" && !currentUser.office) {
        redirect("/")
    }

    return (
        <>
            <TitlePage title="Assessores" />
            {currentUser?.role === "ADMIN" && <Advisors />}
            {currentUser?.role === "OFFICE_ADMIN" && currentUser.office && (
                <OfficeAdvisors 
                    officeId={currentUser.office.id} 
                    officeName={currentUser.office.name} 
                />
            )}
        </>
    )
}