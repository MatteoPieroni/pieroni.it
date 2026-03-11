import * as z from "zod";

const MediaSchema = z.object({
  id: z.number(),
  alt: z.string(),
  url: z.string(),
});

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  featured_image: z.nullable(MediaSchema),
  count: z.number(),
  fullSlug: z.string(),
  level: z.number(),
  breadcrumbs: z.array(
    z.nullable(
      z.object({
        url: z.string(),
        label: z.string(),
      }),
    ),
  ),
  parent: z.nullable(z.union([z.number(), z.object({ id: z.number() })])),
});

const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  fullDescription: z.object({}),
  images: z.nullable(z.array(MediaSchema)),
  mainCategory: CategorySchema,
  categories: z.array(CategorySchema),
  formats: z.nullable(z.string()),
  brand: z.nullable(z.string()),
});

export const getCategories = async (pageLimit = 30, page = 1) => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = "https://be.pieroni.it/api";

  const categories: z.infer<typeof CategorySchema>[] = [];

  while (true) {
    const response = await fetch(
      `${BE_URL}/shop_categories?limit=${pageLimit}&page=${page}&depth=1`,
      {
        headers: {
          Authorization: `users API-Key ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      break;
    }

    const fetchedCategories = await response.json();
    if (fetchedCategories.docs.length === 0) {
      break;
    }

    for (const fetchedCategory of fetchedCategories.docs) {
      categories.push(CategorySchema.parse(fetchedCategory));
    }

    categories.push(...fetchedCategories.docs);

    if (fetchedCategories.length < pageLimit) {
      break;
    }

    page++;
  }

  return categories;
};

export const getProductsInCategory = async (
  category: number,
  pageLimit = 100,
  page = 1,
) => {
  const API_KEY = import.meta.env.API_KEY;
  const BE_URL = "https://be.pieroni.it/api";

  const products: z.infer<typeof ProductSchema>[] = [];

  while (true) {
    const response = await fetch(
      `${BE_URL}/shop_products?limit=${pageLimit}&page=${page}&depth=3&where[categories][contains]=${category}`,
      {
        headers: {
          Authorization: `users API-Key ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      break;
    }

    const pageProducts = await response.json();
    if (pageProducts.docs.length === 0) {
      break;
    }

    for (const pageProduct of pageProducts.docs) {
      products.push(ProductSchema.parse(pageProduct));
    }

    if (pageProducts.length < pageLimit) {
      break;
    }

    page++;
  }

  return products;
};
