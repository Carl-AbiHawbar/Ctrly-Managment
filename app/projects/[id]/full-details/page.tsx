import ProjectFullDetails from "@/components/project-full-details";

export default async function ProjectFullDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectFullDetails  />;
}
