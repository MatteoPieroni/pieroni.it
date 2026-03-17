import { getPostsInCategory } from "./adapter";
import blogCategoriesData from "../blog/categories.json";
import {
  createSlugsCollection,
  getCategoryPaths,
  getFlatCategories,
  getProductsPaths,
} from "./utils";

export type FlatCategory = Omit<
  (typeof blogCategoriesData)[number],
  "children"
> & {
  subCategories?: Omit<(typeof blogCategoriesData)[number], "children">[];
};
type CategoryCollection = Record<number, FlatCategory>;

type FlatCategoryWithProducts = {
  products: any[];
} & FlatCategory;

export type CategoryCollectionWithProduct = Record<
  number,
  FlatCategoryWithProducts
>;

type CategorySlugs = {
  main: string;
  hierarchical?: string;
};
export type CategoriesSlugsCollection = {
  [key: number]: {
    slugs: CategorySlugs;
  };
};

type CategoryPageData = {
  slug: string;
  title: string;
  products: any[];
  subCategories?: FlatCategory[];

  count: {
    total: number;
    start: number;
    end: number;
  };
  pagination?:
    | {
        current: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      };
};
type PaginationPage = {
  number: number;
  href: string;
};

type ProductPageData = {
  slug: string;
  product: Record<string, unknown>;
};

export const enrichCategoriesWithPosts = async (
  categories: CategoryCollection,
  fetchProducts: typeof getPostsInCategory,
) => {
  const categoriesWithProducts: CategoryCollectionWithProduct = {};

  for (const category of Object.values(categories)) {
    const products = await fetchProducts(category);

    categoriesWithProducts[category.id] = {
      ...category,
      products,
    };
  }

  return categoriesWithProducts;
};

export const getAllBlogCategories = async (
  categories = blogCategoriesData,
  fetchProducts = getPostsInCategory,
) => {
  const flatCategories = getFlatCategories(categories);
  const categoriesWithProducts = await enrichCategoriesWithPosts(
    flatCategories,
    fetchProducts,
  );
  const categorySlugs = createSlugsCollection(categories);

  const categoriesPages: CategoryPageData[] = [];
  const postsPages: ProductPageData[] = [];

  for (const category of Object.values(categoriesWithProducts)) {
    const categoryPaths = getCategoryPaths(category, categorySlugs, 12);
    const postsPaths = getProductsPaths(category, categorySlugs);

    categoriesPages.push(...categoryPaths);
    postsPages.push(...postsPaths);
  }

  return {
    categories: categoriesPages,
    postsPages: postsPages,
  };
};

export const getCategoriesFromSlug = (
  slug: string[],
  categories = blogCategoriesData,
) => {
  const flatCategories = getFlatCategories(categories);
  const categoriesFromSlug = [];

  for (const segment of slug) {
    const category = Object.values(flatCategories).find(
      (category) => category.slug === segment,
    );

    if (!category) {
      continue;
    }

    categoriesFromSlug.push(category);
  }

  return categoriesFromSlug;
};

export const getCategoriesFromId = (
  slug: string[],
  categories = blogCategoriesData,
) => {
  const flatCategories = getFlatCategories(categories);
  const categoriesFromSlug = [];

  for (const segment of slug) {
    const category = Object.values(flatCategories).find(
      (category) => category.id === +segment,
    );

    if (!category) {
      continue;
    }

    categoriesFromSlug.push(category);
  }

  return categoriesFromSlug;
};
