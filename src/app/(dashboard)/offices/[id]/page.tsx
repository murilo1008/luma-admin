import Office from "./office"

export default async function OfficePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <Office officeId={id} />
}
