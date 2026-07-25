import { MasterProfilePage } from '@/views/masters/ui/MasterProfilePage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <MasterProfilePage masterId={id} />
}
