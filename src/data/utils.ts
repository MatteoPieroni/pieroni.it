import type { Media, SubCategory } from "./shared-types";

type CategoryLike = {
  id: number;
  parent?: number | null;
  count: number;
  fullSlug: string;
  name: string;
};
type SubEntityLike = {
  name: string;
  fullSlug: string;
  featuredImage: Media;
};

export type WithSubcategories = {
  subCategories?: SubCategory[];
};

export const getSubcategories: <CategoryType extends CategoryLike>(
  categories: CategoryType[],
) => (CategoryType & WithSubcategories)[] = (categories) => {
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

export const splitEntityIntoPages = (array: SubEntityLike[], limit: number) => {
  const splitProducts = [];

  for (let index = 0; index < array.length; index += limit) {
    const pageProducts = array.slice(index, index + limit);
    splitProducts.push(pageProducts);
  }

  return splitProducts;
};

export const getCount = (
  total: number,
  currentPageNumber: number,
  limit: number,
) => {
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

export const getPagination = (
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
