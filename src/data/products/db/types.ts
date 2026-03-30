import type { Media, Breadcrumb } from "../../shared-types";

export type DbCategoryProduct = {
  name: string;
  fullSlug: string;
  featuredImage: Media;
};
export type DbCategory = {
  id: number;
  name: string;
  slug: string;
  featuredImage?: Media | null;
  count: number;
  fullSlug: string;
  breadcrumbs: (Breadcrumb | null)[];
  parent?: number | null;
  products: DbCategoryProduct[];
};

type DbProductCategory = Pick<
  DbCategory,
  "breadcrumbs" | "fullSlug" | "name" | "slug"
>;
export type DbProduct = {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  description: string;
  fullDescription: string;
  featuredImage: Media;
  images: Media[] | null;
  mainCategory: DbProductCategory;
  categories: DbProductCategory[];
  formats: string | null;
  brand: string | null;
  contentUpdatedAt?: string | null;
};
