import Client from "./client";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <Client id={id} />
}