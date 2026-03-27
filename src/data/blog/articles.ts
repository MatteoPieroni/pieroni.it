import type { DbArticle } from "./db/types";
import type { ArticlePageData } from "./types";
import { getArticles } from "./db/adapter";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

/**
 * for a category
 *  for each article
 *    - generate article page with deepest ({long-slug}/{article-slug})
 *    - generate article slug to deepest ({article-slug} -> {long-slug}/{article-slug})
 *    - generate article main slug to deepest ({slug}/{article-slug} -> {long-slug}/{article-slug})
 */
export const getArticlePaths = ({
  id: _,
  mainCategory,
  slug,
  categories,
  content: rawContent,
  fullSlug,
  ...article
}: DbArticle) => {
  const breadcrumbs = mainCategory.breadcrumbs.filter(
    (breadcrumb) => breadcrumb !== null,
  );
  const mappedCategories = categories.map((cat) => ({
    name: cat.name,
    url: cat.fullSlug,
  }));
  const content = convertLexicalToHTML({
    // @ts-expect-error - rawContent is not a valid SerializedEditorState, but convertLexicalToHTML expects it
    // we know it is valid, but TypeScript doesn't
    data: rawContent,
  });

  const base = {
    breadcrumbs,
    fullSlug,
    content,
    ...article,
    categories: mappedCategories,
  };

  const articlePage: ArticlePageData = {
    slug,
    ...base,
  };

  const fullSlugCategoriesPages: ArticlePageData[] = categories.map((cat) => ({
    ...base,
    breadcrumbs: cat.breadcrumbs.filter((breadcrumb) => breadcrumb !== null),
    slug: `${cat.fullSlug}/${slug}`,
  }));

  const baseCategoriesPages: ArticlePageData[] = categories.map((cat) => ({
    ...base,
    breadcrumbs: cat.breadcrumbs.filter((breadcrumb) => breadcrumb !== null),
    slug: `${cat.slug}/${slug}`,
  }));

  const categoriesSet = new Set();
  const dedupeCategories = [
    ...fullSlugCategoriesPages,
    ...baseCategoriesPages,
  ].filter((page) => {
    const isDupe = categoriesSet.has(page.slug);

    categoriesSet.add(page.slug);

    return !isDupe;
  });

  return [...dedupeCategories, articlePage];
};

export const getArticlesPages = async (fetchArticles: typeof getArticles) => {
  const articles = await fetchArticles();
  const articlePages: ArticlePageData[] = [];

  for (const article of articles) {
    const articlePaths = getArticlePaths(article);

    articlePages.push(...articlePaths);
  }

  return articlePages;
};
