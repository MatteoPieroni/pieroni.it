import type { CategoryPageProps } from "../../layouts/types";
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
  breadcrumbs: Breadcrumb[];
} & CategoryPageProps;

export type ArticlePageData = {
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown>;
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
