import { getCategories, getProductsInCategory } from "./adapter";
import { getCategoriesPages } from "./categories";

// URL generation
//
// PRODUCT
// - negozio/slug
// - negozio/main-cat-slug/slug
// - negozio/main-cat-breadcrumb-url/slug (LOOP)
//
// CATEGORY
// - negozio/slug
// - negozio/fullslug
// - negozio/page/1 (LOOP)
// - negozio/fullslug/page/1 (LOOP)
export const getAllCategories = async (
  fetchCategories = getCategories,
  fetchProducts = getProductsInCategory,
) => {
  const categoriesPages = await getCategoriesPages(
    fetchCategories,
    fetchProducts,
  );
  // const productsPages: ProductPageData[] = [];

  // for (const category of Object.values(categoriesWithProducts)) {
  //   const productPaths = getProductsPaths(category, categorySlugs);

  //   productsPages.push(...productPaths);
  // }

  return {
    categories: categoriesPages,
    productsPages: [],
  };
};
