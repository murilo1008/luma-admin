import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Handshake, Building2, Users, Activity } from "lucide-react"

export default function Advisors() {
    return (
        <div className="space-y-8">
            {/* Header da Página */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/80">
                            <Handshake className="h-6 w-6 text-white" />
                        </div>
                        Assessores Globais
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visão geral de todos os assessores do sistema
                    </p>
                </div>
            </div>

            {/* Aviso para Administrador Global */}
            <Card className="border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-secondary" />
                        Administrador Global
                    </CardTitle>
                    <CardDescription>
                        Como administrador global, você tem acesso a todos os assessores do sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                                <Handshake className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Visualizar por Escritório</p>
                                <p className="text-sm text-muted-foreground">Acesse a página de cada escritório</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Gerenciar Clientes</p>
                                <p className="text-sm text-muted-foreground">Veja todos os clientes por assessor</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Relatórios Completos</p>
                                <p className="text-sm text-muted-foreground">Estatísticas de todos os escritórios</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium text-foreground mb-2">💡 Como navegar:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Vá para <Badge variant="outline" className="mx-1">Escritórios</Badge> para gerenciar assessores específicos</li>
                            <li>• Use <Badge variant="outline" className="mx-1">Membros</Badge> para ver administradores de escritório</li>
                            <li>• Acesse <Badge variant="outline" className="mx-1">Relatórios</Badge> para estatísticas globais</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}