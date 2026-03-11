import { getCategories, getProducts, getProductsInCategory } from "./adapter";
import { getCategoriesPages } from "./categories";
import { getProductsPages } from "./products";

// URL generation
//
// PRODUCT
// - negozio/slug
// - negozio/cat-full-slug/slug (LOOP)
// - negozio/cat-slug/slug (LOOP)
//
// CATEGORY
// - negozio/slug
// - negozio/fullslug
// - negozio/page/1 (LOOP)
// - negozio/fullslug/page/1 (LOOP)
export const getAllCategories = async (
  fetchCategories = getCategories,
  fetchProductsInCategory = getProductsInCategory,
  fetchProducts = getProducts,
) => {
  const categoriesPages = await getCategoriesPages(
    fetchCategories,
    fetchProductsInCategory,
  );
  const productsPages = await getProductsPages(fetchProducts);

  return {
    categories: categoriesPages,
    productsPages,
  };
};
