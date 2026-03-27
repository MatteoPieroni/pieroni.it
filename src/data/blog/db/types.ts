import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Breadcrumb, Media } from "../../shared-types";

export type DbCategoryArticle = {
  title: string;
  fullSlug: string;
  featuredImage: Media;
  excerpt: string;
  updatedAt: string;
};
export type DbCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
  fullSlug: string;
  breadcrumbs: (Breadcrumb | null)[];
  parent?: number | null;
  articles: DbCategoryArticle[];
};

type DbArticleCategory = Pick<
  DbCategory,
  "breadcrumbs" | "fullSlug" | "name" | "slug"
>;
export type DbArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: { root: Record<string, unknown> };
  featuredImage: Media;
  mainCategory: DbArticleCategory;
  categories: DbArticleCategory[];
  fullSlug: string;
  updatedAt: string;
  createdAt: string;
};
