import * as z from "zod";
import type { DbCategory } from "../types";

const MediaSchema = z.object({
  alt: z.string(),
  url: z.string(),
});

const CategoryProductSchema = z.object({
  name: z.string(),
  fullSlug: z.string(),
  featuredImage: z.object({
    url: z.string(),
    alt: z.string(),
  }),
});
const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  featuredImage: z.optional(z.nullable(MediaSchema)),
  count: z.number(),
  fullSlug: z.string(),
  breadcrumbs: z.array(
    z.nullable(
      z.object({
        url: z.string(),
        label: z.string(),
      }),
    ),
  ),
  products: z.array(CategoryProductSchema),
  parent: z.optional(z.number()),
});

const ProductCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  fullSlug: z.string(),
  breadcrumbs: z.array(
    z.object({
      url: z.string(),
      label: z.string(),
    }),
  ),
});
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  fullSlug: z.string(),
  description: z.string(),
  fullDescription: z.string(),
  featuredImage: MediaSchema,
  images: z.nullable(z.array(MediaSchema)),
  mainCategory: ProductCategorySchema,
  categories: z.array(ProductCategorySchema),
  formats: z.nullable(z.string()),
  brand: z.nullable(z.string()),
});

export const getCategories = async () => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = "https://be.pieroni.it/website";

  const categories: DbCategory[] = [];

  const response = await fetch(`${BE_URL}/shop-categories`, {
    headers: {
      Authorization: `users API-Key ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("");
  }

  const categoriesResponse = await response.json();
  if (categoriesResponse.data.categories.length === 0) {
    throw new Error("");
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
    throw new Error("Error fetching categories");
  }

  return categories;
};

export const getProducts = async (page = 1) => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = "https://be.pieroni.it/website";

  const products: z.infer<typeof ProductSchema>[] = [];

  while (true) {
    const response = await fetch(`${BE_URL}/shop-products?page=${page}`, {
      headers: {
        Authorization: `users API-Key ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      break;
    }

    const productsResponse = await response.json();
    if (productsResponse.data.products.length === 0) {
      break;
    }

    for (const pageProduct of productsResponse.data.products) {
      products.push(ProductSchema.parse(pageProduct));
    }

    if (!productsResponse.data.hasNextPage) {
      break;
    }

    page++;
  }

  return products;
};
