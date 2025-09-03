import ProjectDetailPage from "@/components/project-detail-page"

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  return <ProjectDetailPage id={params?.id} />
}
