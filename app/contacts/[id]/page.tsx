import ContactDetailPage from "@/components/contact-detail-page"

export default function ContactDetail({ params }: { params: { id: string } }) {
  return <ContactDetailPage id={params.id} />
}
