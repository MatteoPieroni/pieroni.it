import type { DbProduct, ProductPageData } from "../types";
import { getProducts } from "./adapter";

/**
 * for a category
 *  for each product
 *    - generate product page with deepest ({long-slug}/{product-slug})
 *    - generate rewrite product slug to deepest ({product-slug} -> {long-slug}/{product-slug})
 *    - generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
 */
export const getProductPaths = ({
  id: _,
  mainCategory,
  slug,
  categories,
  ...product
}: DbProduct) => {
  const fullSlug = `${mainCategory.fullSlug}/${slug}`;
  const breadcrumbs = mainCategory.breadcrumbs.filter(
    (breadcrumb) => breadcrumb !== null,
  );
  const mappedCategories = categories.map((cat) => ({
    name: cat.name,
    url: cat.fullSlug,
  }));

  const base = {
    breadcrumbs,
    fullSlug,
    ...product,
    categories: mappedCategories,
  };

  const productPage: ProductPageData = {
    slug,
    ...base,
  };

  const allCategoriesPages: ProductPageData[] = categories.map((cat) => ({
    ...base,
    slug: `${cat.fullSlug}/${slug}`,
  }));

  const baseCategoriesPages: ProductPageData[] = categories.map((cat) => ({
    ...base,
    slug: `${cat.slug}/${slug}`,
  }));

  const categoriesSet = new Set();
  const dedupeCategories = [
    ...allCategoriesPages,
    ...baseCategoriesPages,
  ].filter((page) => {
    const isDupe = categoriesSet.has(page.slug);

    categoriesSet.add(page.slug);

    return !isDupe;
  });

  return [...dedupeCategories, productPage];
};

export const getProductsPages = async (fetchProducts: typeof getProducts) => {
  const products = await fetchProducts();
  const productPages: ProductPageData[] = [];

  for (const product of products) {
    const productPaths = getProductPaths(product);

    productPages.push(...productPaths);
  }

  return productPages;
};
