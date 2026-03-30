import type { CategoryPageProps } from "../../layouts/types";
import type { Breadcrumb, Media, SubCategory } from "../shared-types";
import type { DbCategory, DbCategoryProduct } from "./db/types";

export type Category = Exclude<DbCategory, "parent"> & {
  subCategories?: SubCategory[];
};

export type CategoryPageData = {
  slug: string;
  fullSlug: string;
  title: string;
  products: DbCategoryProduct[];
  breadcrumbs: Breadcrumb[];
} & CategoryPageProps;

export type ProductPageData = {
  title: string;
  slug: string;
  fullSlug: string;
  featuredImage: Media;
  images: Media[] | null;
  description: string;
  fullDescription: string;
  formats: string | null;
  brand: string | null;
  breadcrumbs: Breadcrumb[];
  contentUpdatedAt?: string | null;
  categories: {
    name: string;
    url: string;
  }[];
};
