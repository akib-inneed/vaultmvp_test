import { QuestionDetailScreenRouted } from "@/components/firm/QuestionDetailScreen";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function QuestionDetailPage({ params }: Props) {
  const { slug, id } = await params;

  return <QuestionDetailScreenRouted slug={slug} questionId={id} />;
}
