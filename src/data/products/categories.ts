import type {
  Category,
  CategoryPageData,
  DbCategory,
  DbCategoryProduct,
} from "../types";
import { getCategories } from "./adapter";

export type CategoryWithSubcategories = Category & {
  subCategories?: {
    name: string;
    count: number;
    url: string;
  }[];
};

export const getSubcategories: (
  categories: DbCategory[],
) => CategoryWithSubcategories[] = (categories) => {
  return categories.map((category) => {
    const subCategories = categories
      .filter((cat) => {
        return cat.parent === category.id && cat.count > 0;
      })
      .map(({ name, count, fullSlug }) => ({
        name,
        count,
        url: fullSlug,
      }));

    return {
      ...category,
      ...(subCategories.length > 0 ? { subCategories } : {}),
    };
  });
};

const splitProductsIntoPages = (array: DbCategoryProduct[], limit: number) => {
  const splitProducts = [];

  for (let index = 0; index < array.length; index += limit) {
    const pageProducts = array.slice(index, index + limit);
    splitProducts.push(pageProducts);
  }

  return splitProducts;
};

const getCount = (total: number, currentPageNumber: number, limit: number) => {
  if (total < limit) {
    return {
      total,
      start: 1,
      end: total,
    };
  }

  const firstElement = currentPageNumber * limit - (limit - 1);
  const lastElement = currentPageNumber * limit;

  // last page
  if (lastElement >= total) {
    return {
      total,
      start: firstElement,
      end: total,
    };
  }

  return {
    total,
    start: firstElement,
    end: lastElement,
  };
};

const getPagination = (
  currentSlug: string,
  currentPageNumber: number,
  totalPages: number,
  baseSlug: string,
) => {
  const basePagination = {
    current: {
      number: currentPageNumber,
      href: currentSlug,
    },
    first: {
      number: 1,
      href: `${baseSlug}/1`,
    },
    last: {
      number: totalPages,
      href: `${baseSlug}/${totalPages}`,
    },
  };
  const previous = {
    number: currentPageNumber - 1,
    href: `${baseSlug}/${currentPageNumber - 1}`,
  };
  const next = {
    number: currentPageNumber + 1,
    href: `${baseSlug}/${currentPageNumber + 1}`,
  };

  if (totalPages === 1) {
    return undefined;
  }

  if (currentPageNumber === 1) {
    return {
      ...basePagination,
      next,
    };
  }

  if (currentPageNumber === totalPages) {
    return {
      ...basePagination,
      previous,
    };
  }

  return {
    ...basePagination,
    previous: {
      number: currentPageNumber - 1,
      href: `${baseSlug}/${currentPageNumber - 1}`,
    },
    next: {
      number: currentPageNumber + 1,
      href: `${baseSlug}/${currentPageNumber + 1}`,
    },
  };
};

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
      : splitProductsIntoPages(products, limit);
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
