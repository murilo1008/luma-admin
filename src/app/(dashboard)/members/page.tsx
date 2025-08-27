import TitlePage from "@/components/title-page";
import Members from "./members";
import OfficeMembers from "./members-office";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";

export default async function MembersPage() {
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
        // Se é OFFICE_ADMIN mas não tem escritório vinculado, redirecionar
        redirect("/")
    }

    return (
        <>
            <TitlePage title="Membros" />
            {currentUser?.role === "ADMIN" && <Members />}
            {currentUser?.role === "OFFICE_ADMIN" && currentUser.office && (
                <OfficeMembers 
                    officeId={currentUser.office.id} 
                    officeName={currentUser.office.name} 
                />
            )}
        </>
    )
}