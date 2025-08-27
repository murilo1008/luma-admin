import Client from "./client";

export default function ClientPage({ params }: { params: { id: string } }) {
  const { id } = params
  
  return <Client id={id} />
}