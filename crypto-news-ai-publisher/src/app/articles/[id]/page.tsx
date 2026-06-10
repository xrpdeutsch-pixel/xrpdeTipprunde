import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleEditor from "@/components/ArticleEditor";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) notFound();

  return <ArticleEditor article={JSON.parse(JSON.stringify(article))} />;
}
