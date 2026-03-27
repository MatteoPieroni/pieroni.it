import * as z from "zod";
import type { DbArticle, DbCategory } from "./types";

const MediaSchema = z.object({
  alt: z.string(),
  url: z.string(),
});

const BreadcrumbSchema = z.object({
  url: z.string(),
  label: z.string(),
});

const CategoryArticleSchema = z.object({
  title: z.string(),
  fullSlug: z.string(),
  featuredImage: MediaSchema,
  excerpt: z.string(),
  updatedAt: z.string(),
});
const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  count: z.number(),
  fullSlug: z.string(),
  breadcrumbs: z.array(BreadcrumbSchema),
  articles: z.array(CategoryArticleSchema),
  parent: z.optional(z.number()),
});

const ArticleCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  fullSlug: z.string(),
  breadcrumbs: z.array(BreadcrumbSchema),
});
const ArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  fullSlug: z.string(),
  excerpt: z.string(),
  content: z.object({ root: z.looseObject({}) }),
  featuredImage: MediaSchema,
  mainCategory: ArticleCategorySchema,
  categories: z.array(ArticleCategorySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const getCategories = async () => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = import.meta.env.BE_URL;

  const categories: DbCategory[] = [];

  try {
    const response = await fetch(`${BE_URL}/blog/categories`, {
      headers: {
        Authorization: `users API-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("response not ok");
    }

    const categoriesResponse = await response.json();
    if (categoriesResponse.data.categories.length === 0) {
      throw new Error("no categories");
    }

    const fetchedCategories = categoriesResponse.data.categories;

    for (const fetchedCategory of fetchedCategories) {
      try {
        categories.push(CategorySchema.parse(fetchedCategory));
      } catch (e) {
        console.error({ e, id: fetchedCategory.id });
        continue;
      }
    }

    if (categories.length === 0) {
      throw new Error("no categories mapped");
    }

    return categories;
  } catch (e) {
    console.error("Error while fetching categories " + e);
    throw new Error();
  }
};

export const getArticles = async (page = 1) => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = import.meta.env.BE_URL;

  const articles: DbArticle[] = [];

  while (true) {
    const response = await fetch(`${BE_URL}/blog/articles?page=${page}`, {
      headers: {
        Authorization: `users API-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      break;
    }

    const articlesResponse = await response.json();
    if (articlesResponse.data.articles.length === 0) {
      break;
    }

    for (const pageArticle of articlesResponse.data.articles) {
      articles.push(ArticleSchema.parse(pageArticle));
    }

    if (!articlesResponse.data.hasNextPage) {
      break;
    }

    page++;
  }

  return articles;
};
