import type {
  Category,
  CategoryPageData,
  DbCategory,
  ProductForCategory,
} from "../types";
import { getCategories, getProductsInCategory } from "./adapter";

type CategoryCollection = Record<number, Category>;

type CategoryWithProducts = {
  products: ProductForCategory[];
} & Category;

export type CategoryCollectionWithProduct = Record<
  number,
  CategoryWithProducts
>;

type CategorySlugs = {
  main: string;
  hierarchical?: string;
};
export type CategoriesSlugsCollection = {
  [key: number]: {
    slugs: CategorySlugs;
  };
};

export const getFlatCategories: (
  categories: DbCategory[],
) => CategoryCollection = (categories) => {
  return categories.reduce<CategoryCollection>((acc, current) => {
    const subCategories = categories
      .filter((cat) => {
        if (typeof cat.parent !== "number" && !cat.parent) {
          return false;
        }

        return typeof cat.parent === "number"
          ? cat.parent === current.id
          : cat.parent.id === current.id;
      })
      .map(({ name, count, fullSlug }) => ({
        name,
        count,
        url: fullSlug,
      }));

    return {
      ...acc,
      [current.id]: {
        ...current,
        ...(subCategories.length > 0 ? { subCategories } : {}),
      },
    };
  }, {});
};

export const enrichCategoriesWithProducts = async (
  categories: CategoryCollection,
  fetchProducts: typeof getProductsInCategory,
) => {
  const categoriesWithProducts: CategoryCollectionWithProduct = {};

  for (const category of Object.values(categories)) {
    const products = await fetchProducts(category.id);

    categoriesWithProducts[category.id] = {
      ...category,
      products: products.map(({ mainCategory, slug, name, images }) => ({
        name,
        link: `${mainCategory.fullSlug}/${slug}`,
        image: images?.[0],
      })),
    };
  }

  return categoriesWithProducts;
};

const splitProductsIntoPages = (array: ProductForCategory[], limit: number) => {
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
  category: CategoryWithProducts,
  categorySlugs: CategoriesSlugsCollection,
  limit: number,
) => {
  const currentCategorySlugs = categorySlugs[category.id];
  if (!currentCategorySlugs) {
    throw new Error("Slugs not collected");
  }

  const title = category.name;
  const fullSlug = category.fullSlug;
  const mainSlug = currentCategorySlugs.slugs.main;
  const firstProductMainPageSlug = `${mainSlug}/page/1`;

  const subCategories = category.subCategories
    ? { subCategories: category.subCategories }
    : {};

  if (category.products.length <= limit) {
    const basePage = {
      title,
      products: category.products,
      count: getCount(category.count, 1, limit),
      fullSlug,
      ...subCategories,
    };

    if (!currentCategorySlugs.slugs.hierarchical) {
      // generate main numbered page ({slug}/page/1)
      const firstProductPage: CategoryPageData = {
        ...basePage,
        slug: firstProductMainPageSlug,
      };
      // generate main slug page ({slug})
      const mainProductPage: CategoryPageData = {
        ...basePage,
        slug: currentCategorySlugs.slugs.main,
      };

      return [firstProductPage, mainProductPage];
    }

    const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
    const firstProductPageSlug = `${hierarchicalSlug}/page/1`;

    // generate hierarchical first page with products ({long-slug}/page/1)
    const hierarchicalFirstProductPage: CategoryPageData = {
      ...basePage,
      slug: firstProductPageSlug,
    };
    // generate hierarchical slug page ({long-slug})
    const hierarchicalMainPage: CategoryPageData = {
      ...basePage,
      slug: currentCategorySlugs.slugs.hierarchical,
    };

    // generate main first page ({slug}/page/1)
    const firstProductPage: CategoryPageData = {
      ...basePage,
      slug: firstProductMainPageSlug,
    };
    // generate main slug page ({slug})
    const mainProductPage: CategoryPageData = {
      ...basePage,
      slug: mainSlug,
    };

    return [
      hierarchicalFirstProductPage,
      hierarchicalMainPage,
      firstProductPage,
      mainProductPage,
    ];
  }

  const splitProducts = splitProductsIntoPages(category.products, limit);

  const basePage = {
    title,
  };

  if (!currentCategorySlugs.slugs.hierarchical) {
    const numberedPages: CategoryPageData[] = [];
    const pageBaseSlug = `${category.slug}/page`;

    // generate numbered pages with products ({slug}/page/x)
    for (const [index, pageProducts] of splitProducts.entries()) {
      const index1Base = index + 1;
      const slug = `${pageBaseSlug}/${index1Base}`;
      const pagedFullSlug = `${fullSlug}/page/${index1Base}`;

      numberedPages.push({
        ...basePage,
        slug: slug,
        fullSlug: index === 0 ? fullSlug : pagedFullSlug,
        products: pageProducts,
        // add subcategories only on first page
        ...(index === 0 ? subCategories : []),
        count: getCount(category.count, index1Base, limit),
        pagination: getPagination(
          slug,
          index1Base,
          splitProducts.length,
          pageBaseSlug,
        ),
      });
    }

    // generate main slug ({slug})
    const mainProductPage: CategoryPageData = {
      ...basePage,
      products: splitProducts[0],
      slug: mainSlug,
      fullSlug,
      ...subCategories,
      count: getCount(category.count, 1, limit),
      pagination: getPagination(
        mainSlug,
        1,
        splitProducts.length,
        pageBaseSlug,
      ),
    };

    return [...numberedPages, mainProductPage];
  }

  const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
  const pageBaseSlug = `${hierarchicalSlug}/page`;

  const numberedPages: CategoryPageData[] = [];

  // generate hierarchical numbered pages with products ({long-slug}/page/x)
  for (const [index, pageProducts] of splitProducts.entries()) {
    const index1Base = index + 1;
    const slug = `${pageBaseSlug}/${index1Base}`;
    const pagedFullSlug = `${fullSlug}/page/${index1Base}`;

    numberedPages.push({
      ...basePage,
      slug,
      fullSlug: index === 0 ? fullSlug : pagedFullSlug,
      products: pageProducts,
      // add subcategories only on first page
      ...(index === 0 ? subCategories : []),
      count: getCount(category.count, index1Base, limit),
      pagination: getPagination(
        slug,
        index1Base,
        splitProducts.length,
        pageBaseSlug,
      ),
    });
  }

  // generate main hierarchical page ({long-slug})
  const hierarchicalMainPage: CategoryPageData = {
    ...basePage,
    products: splitProducts[0],
    slug: currentCategorySlugs.slugs.hierarchical,
    fullSlug,
    ...subCategories,
    count: getCount(category.count, 1, limit),
    pagination: getPagination(
      currentCategorySlugs.slugs.hierarchical,
      1,
      splitProducts.length,
      pageBaseSlug,
    ),
  };

  // generate main numbered pages ({slug}/page/x)
  const mainNumberedProductPages: CategoryPageData[] = numberedPages.map(
    (numberedPage, index) => ({
      ...numberedPage,
      slug: `${mainSlug}/page/${index + 1}`,
      fullSlug: index === 0 ? fullSlug : `${fullSlug}/page/${index + 1}`,
      pagination: getPagination(
        `${mainSlug}/page/${index + 1}`,
        index + 1,
        splitProducts.length,
        `${mainSlug}/page`,
      ),
    }),
  );

  // generate main slug page ({slug})
  const mainPage: CategoryPageData = {
    ...basePage,
    slug: mainSlug,
    fullSlug,
    products: splitProducts[0],
    ...subCategories,
    count: getCount(category.count, 1, limit),
    pagination: getPagination(
      mainSlug,
      1,
      splitProducts.length,
      `${mainSlug}/page`,
    ),
  };

  return [
    ...numberedPages,
    hierarchicalMainPage,
    ...mainNumberedProductPages,
    mainPage,
  ];
};

export const createSlugsCollection = (categories: DbCategory[]) => {
  const slugsCollection: CategoriesSlugsCollection = {};

  // looping main cats
  for (const category of categories) {
    // add current category to collection
    slugsCollection[category.id] = {
      slugs: {
        main: category.slug,
        ...(typeof category.parent !== "number" && !category.parent
          ? {}
          : { hierarchical: category.fullSlug }),
      },
    };
  }

  return slugsCollection;
};

export const getCategoriesPages = async (
  fetchCategories: typeof getCategories,
  fetchProducts: typeof getProductsInCategory,
) => {
  const categories = await fetchCategories();
  const flatCategories = getFlatCategories(categories);
  const categoriesWithProducts = await enrichCategoriesWithProducts(
    flatCategories,
    fetchProducts,
  );
  const categorySlugs = createSlugsCollection(categories);

  const categoriesPages: CategoryPageData[] = [];

  for (const category of Object.values(categoriesWithProducts)) {
    const categoryPaths = getCategoryPaths(category, categorySlugs, 12);

    categoriesPages.push(...categoryPaths);
  }

  return categoriesPages;
};
