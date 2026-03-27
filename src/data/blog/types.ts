import type { Breadcrumb, Media, SubCategory } from "../shared-types";
import type { DbCategory, DbCategoryArticle } from "./db/types";

export type Category = Exclude<DbCategory, "parent"> & {
  subCategories?: SubCategory[];
};

export type CategoryPageData = {
  slug: string;
  fullSlug: string;
  title: string;
  articles: DbCategoryArticle[];
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

export type ArticlePageData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: Media;
  fullSlug: string;
  updatedAt: string;
  createdAt: string;
  breadcrumbs: Breadcrumb[];
  categories: {
    name: string;
    url: string;
  }[];
};
