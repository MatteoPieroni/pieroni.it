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
  subCategories?: SubCategory[];
  breadcrumbs: Breadcrumb[];

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
  categories: {
    name: string;
    url: string;
  }[];
};
