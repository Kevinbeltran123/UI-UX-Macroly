export type ArticleSection = {
  title: string;
  text: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  tag: string | null;
  readingTime: number | null;
  icon: string | null;
  content: ArticleSection[];
  relatedProductIds: string[];
};
