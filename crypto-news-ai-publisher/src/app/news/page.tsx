import { Suspense } from "react";
import NewsHunter from "@/components/NewsHunter";

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Lade...</div>}>
      <NewsHunter />
    </Suspense>
  );
}
