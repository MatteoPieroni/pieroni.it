import type { Category, CategoryPageData } from "./types";
import {
  getCount,
  getPagination,
  getSubcategories,
  splitEntityIntoPages,
} from "../utils";
import { getCategories } from "./db/adapter";

/**
 * for a category
 *   - generate hierarchical numbered pages ({long-slug}/page/x)
 *   - generate hierarchical page ({long-slug}
 *   - generate main numbered pages ({slug}/page/x)
 *   - generate main slug page ({slug})
 */
export const getCategoryPaths = (
  {
    name,
    fullSlug,
    slug,
    breadcrumbs: catBreadcrumbs,
    count,
    products,
    subCategories,
  }: Category,
  limit: number,
) => {
  const title = name;
  const breadcrumbs = catBreadcrumbs.filter((crumb) => crumb !== null);

  const hasPagination = products.length > limit;

  const splitProducts =
    products.length === 0
      ? // this is a little hack for empty product pages, we pass
        // an empty array, so the products will still be populated
        [[]]
      : splitEntityIntoPages(products, limit);
  const fullSlugPagesWithProduct = splitProducts.map((products, index) => {
    const pageFullSlug = `${fullSlug}/page`;
    const index1Base = index + 1;
    const pagedSlug = `${pageFullSlug}/${index1Base}`;
    const pagedFullSlug = `${fullSlug}/page/${index1Base}`;

    const page = {
      title,
      breadcrumbs,
      slug: pagedSlug,
      fullSlug: index === 0 ? fullSlug : pagedFullSlug,
      count: getCount(count, index1Base, limit),
      products,
      ...(hasPagination && {
        pagination: getPagination(
          pagedSlug,
          index1Base,
          splitProducts.length,
          pageFullSlug,
        ),
      }),
      ...(index === 0 && subCategories && { subCategories }),
    };

    if (index === 0) {
      return [
        // main page with full slug
        {
          ...page,
          slug: fullSlug,
          ...(hasPagination && {
            pagination: getPagination(
              fullSlug,
              index1Base,
              splitProducts.length,
              pageFullSlug,
            ),
          }),
        },
        page,
      ];
    }

    return page;
  });

  // in this case we are at a category without parents
  if (slug === fullSlug) {
    return fullSlugPagesWithProduct.flat();
  }

  const slugPagesWithProduct = splitProducts.map((products, index) => {
    const pageBaseSlug = `${slug}/page`;
    const index1Base = index + 1;
    const pagedSlug = `${pageBaseSlug}/${index1Base}`;
    const pagedFullSlug = `${fullSlug}/page/${index1Base}`;

    const page = {
      title,
      breadcrumbs,
      slug: pagedSlug,
      fullSlug: index === 0 ? fullSlug : pagedFullSlug,
      products,
      count: getCount(count, index1Base, limit),
      ...(hasPagination && {
        pagination: getPagination(
          pagedSlug,
          index1Base,
          splitProducts.length,
          pageBaseSlug,
        ),
      }),
      ...(index === 0 && subCategories ? { subCategories } : {}),
    };

    if (index === 0) {
      return [
        // main page with base slug
        {
          ...page,
          slug: slug,
          ...(hasPagination && {
            pagination: getPagination(
              slug,
              index1Base,
              splitProducts.length,
              pageBaseSlug,
            ),
          }),
        },
        page,
      ];
    }

    return page;
  });

  return [...fullSlugPagesWithProduct.flat(), ...slugPagesWithProduct.flat()];
};

export const getCategoriesPages = async (
  fetchCategories: typeof getCategories,
) => {
  const categories = await fetchCategories();
  const flatCategories = getSubcategories(categories);

  const categoriesPages: CategoryPageData[] = [];

  for (const category of flatCategories) {
    const categoryPaths = getCategoryPaths(category, 12);

    categoriesPages.push(...categoryPaths);
  }

  return categoriesPages;
};
