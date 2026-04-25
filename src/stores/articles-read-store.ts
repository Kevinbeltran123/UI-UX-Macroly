"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ReadState = {
  readSlugs: string[];
  markRead: (slug: string) => void;
};

export const useArticlesReadStore = create<ReadState>()(
  persist(
    (set, get) => ({
      readSlugs: [],
      markRead: (slug) => {
        if (!slug || get().readSlugs.includes(slug)) return;
        set({ readSlugs: [...get().readSlugs, slug] });
      },
    }),
    { name: "macroly-articles-read" }
  )
);
