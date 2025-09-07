import UpdateEventForm from "@/components/UpdateEventForm";

interface Props {
  params: { slug: string };
}

export default function EditEventPage({ params }: Props) {
  return <UpdateEventForm slug={params.slug} />;
}
