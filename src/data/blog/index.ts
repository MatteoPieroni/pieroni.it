import { getArticles, getCategories } from "./db/adapter";
import { getCategoriesPages } from "./categories";
import { getArticlesPages } from "./articles";

// URL generation
//
// ARTICLE
// - category/slug
// - category/cat-full-slug/slug (LOOP)
// - category/cat-slug/slug (LOOP)
//
// CATEGORY
// - category/slug
// - category/fullslug
// - category/page/1 (LOOP)
// - category/fullslug/page/1 (LOOP)
export const getAllCategories = async (
  fetchCategories = getCategories,
  fetchArticles = getArticles,
) => {
  const categoriesPages = await getCategoriesPages(fetchCategories);
  const articlesPages = await getArticlesPages(fetchArticles);
  const allCategoriesList = await fetchCategories();
  const allCategories = allCategoriesList
    .filter((cat) => cat.count > 0)
    .map((cat) => ({
      href: `/category/${cat.fullSlug}`,
      title: cat.name,
    }));

  return {
    categories: categoriesPages,
    articlesPages,
    allCategories,
  };
};
