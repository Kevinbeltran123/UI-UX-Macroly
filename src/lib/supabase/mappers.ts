import type { Product } from "@/domain/catalog/product";
import type { Article } from "@/domain/education/article";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  weight: row.weight,
  imageUrl: row.image_url,
  price: row.price,
  protein: row.protein,
  carbs: row.carbs,
  fat: row.fat,
  calories: row.calories,
  categoryId: row.category_id,
  rating: row.rating ? Number(row.rating) : null,
  dietaryTags: row.dietary_tags ?? [], // Phase 2 (DIET-03) — null-safe; guards pre-migration rows
  mealContext: row.meal_context ?? 'any', // Phase 4 (MEAL-03) — null-safe; guards pre-migration rows
});

export const mapArticle = (row: any): Article => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  tag: row.tag,
  readingTime: row.reading_time,
  icon: row.icon,
  content: row.content ?? [],
  relatedProductIds: row.related_product_ids ?? [],
});
