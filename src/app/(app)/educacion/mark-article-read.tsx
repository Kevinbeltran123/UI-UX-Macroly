"use client";

import { useEffect } from "react";
import { useArticlesReadStore } from "@/stores/articles-read-store";

export const MarkArticleRead = ({ slug }: { slug: string }) => {
  const markRead = useArticlesReadStore((s) => s.markRead);
  useEffect(() => {
    markRead(slug);
  }, [slug, markRead]);
  return null;
};
