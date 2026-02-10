import { getProductsInCategory } from './adapter';
import type { Category } from '../types';
import categoriesData from './categories.json';

export type FlatCategory = Omit<(typeof categoriesData)[number], 'children'> & {
  subCategories?: Omit<(typeof categoriesData)[number], 'children'>[];
};
type CategoryCollection = Record<number, FlatCategory>;

export const getFlatCategories: (
  categories: typeof categoriesData,
) => CategoryCollection = (categories = categoriesData) => {
  return categories.reduce<CategoryCollection>(
    (acc, { children, ...current }) => {
      if (children.length > 0) {
        const flattenedChildren = getFlatCategories(children);
        const directChildren = children.map(
          ({ children: _, ...child }) => child,
        );

        return {
          ...acc,
          [current.id]: { ...current, subCategories: directChildren },
          ...flattenedChildren,
        };
      }

      return { ...acc, [current.id]: current };
    },
    {},
  );
};

type FlatCategoryWithProducts = {
  products: any[];
} & FlatCategory;

export type CategoryCollectionWithProduct = Record<
  number,
  FlatCategoryWithProducts
>;

export const enrichCategoriesWithProducts = async (
  categories: CategoryCollection,
  fetchProducts: typeof getProductsInCategory,
) => {
  const categoriesWithProducts: CategoryCollectionWithProduct = {};

  for (const category of Object.values(categories)) {
    const products = await fetchProducts(category);

    categoriesWithProducts[category.id] = {
      ...category,
      products,
    };
  }

  return categoriesWithProducts;
};

type CategoriesHierarchy = typeof categoriesData;

type CategorySlugs = {
  main: string;
  hierarchical?: string;
};
type SubCategorySlugs = {
  id: number;
} & CategorySlugs;
export type CategoriesSlugsCollection = {
  [key: number]: {
    slugs: CategorySlugs;
  };
};

const createSubPage = (
  categories: CategoriesHierarchy,
  parents: Category[],
): SubCategorySlugs[] => {
  const slugsCollection: SubCategorySlugs[][] = [];

  // looping main cats
  for (const category of categories) {
    slugsCollection.push([
      {
        id: category.id,
        // create main
        main: category.slug,
        // create this level of hierarchy
        hierarchical: `${parents.reduce<string>((acc, parent) => acc + parent.slug + '/', '')}${category.slug}`,
      },
    ]);

    if (category.children.length > 0) {
      // create with parent
      const subCategory = createSubPage(category.children, [
        ...parents,
        category,
      ]).flat();
      slugsCollection.push(subCategory);
    }
  }

  return slugsCollection.flat();
};

export const createSlugsCollection = (categories: CategoriesHierarchy) => {
  const slugsCollection: CategoriesSlugsCollection = {};

  // looping main cats
  for (const category of categories) {
    // add current category to collection
    slugsCollection[category.id] = {
      slugs: {
        // create main
        main: category.slug,
      },
    };

    if (category.children.length > 0) {
      // create with parent
      const subCategories = createSubPage(category.children, [category]);

      subCategories.forEach(({ id, ...subCategory }) => {
        slugsCollection[id] = {
          slugs: subCategory,
        };
      });
    }
  }

  return slugsCollection;
};

const splitProductsIntoPages = (array: unknown[], limit: number) => {
  const splitProducts = [];

  for (let index = 0; index < array.length; index += limit) {
    const pageProducts = array.slice(index, index + limit);
    splitProducts.push(pageProducts);
  }

  return splitProducts;
};

type CategoryPageData = {
  slug: string;
  title: string;
  products: any[];
  subCategories?: FlatCategory[];

  count: {
    total: number;
    start: number;
    end: number;
  };
  pagination?:
    | {
        current: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      };
};
type PaginationPage = {
  number: number;
  href: string;
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
  category: FlatCategoryWithProducts,
  categorySlugs: CategoriesSlugsCollection,
  limit: number,
) => {
  const currentCategorySlugs = categorySlugs[category.id];
  if (!currentCategorySlugs) {
    throw new Error('Slugs not collected');
  }

  const title = category.name;
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

      numberedPages.push({
        ...basePage,
        slug: slug,
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

    // generate main slug ({slug/page/1})
    const mainProductPage: CategoryPageData = {
      ...basePage,
      products: splitProducts[0],
      slug: mainSlug,
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

    numberedPages.push({
      ...basePage,
      slug,
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

type ProductPageData = {
  slug: string;
  product: Record<string, unknown>;
};

/**
 * for a category
 *  for each product
 *    - generate product page with deepest ({long-slug}/{product-slug})
 *    - generate rewrite product slug to deepest ({product-slug} -> {long-slug}/{product-slug})
 *    - generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
 */
export const getProductsPaths = (
  category: FlatCategoryWithProducts,
  categorySlugs: CategoriesSlugsCollection,
) => {
  const currentCategorySlugs = categorySlugs[category.id];
  if (!currentCategorySlugs) {
    throw new Error('Slugs not collected');
  }

  const mainSlug = currentCategorySlugs.slugs.main;

  const productPages: ProductPageData[][] = [];

  for (const product of category.products) {
    const productSlug = product.slug;

    if (!currentCategorySlugs.slugs.hierarchical) {
      const mainSlugWithProduct = `${mainSlug}/${productSlug}`;

      // generate product page with main slug ({slug}/{product-slug})
      const mainProductPage = {
        slug: mainSlugWithProduct,
        product,
      };
      // generate rewrite product slug to deepest ({product-slug} -> {slug}/{product-slug})
      const productPage = {
        slug: productSlug,
        product,
      };

      productPages.push([mainProductPage, productPage]);
    } else {
      const deepestSlugWithProduct = `${currentCategorySlugs.slugs.hierarchical}/${productSlug}`;

      // generate product page with deepest ({long-slug}/{product-slug})
      const deepestProductPage = {
        slug: deepestSlugWithProduct,
        product,
      };

      // generate rewrite product slug to deepest ({product-slug} -> {slug}/{product-slug})
      const productPage = {
        slug: productSlug,
        product,
      };

      // generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
      const mainProductPage = {
        slug: `${mainSlug}/${productSlug}`,
        product,
      };

      productPages.push([deepestProductPage, productPage, mainProductPage]);
    }
  }

  return productPages.flat();
};

export const getAllCategories = async (
  categories = categoriesData,
  fetchProducts = getProductsInCategory,
) => {
  const flatCategories = getFlatCategories(categories);
  const categoriesWithProducts = await enrichCategoriesWithProducts(
    flatCategories,
    fetchProducts,
  );
  const categorySlugs = createSlugsCollection(categories);

  const categoriesPages: CategoryPageData[] = [];
  const productsPages: ProductPageData[] = [];

  for (const category of Object.values(categoriesWithProducts)) {
    const categoryPaths = getCategoryPaths(category, categorySlugs, 12);
    const productPaths = getProductsPaths(category, categorySlugs);

    categoriesPages.push(...categoryPaths);
    productsPages.push(...productPaths);
  }

  return {
    categories: categoriesPages,
    productsPages: productsPages,
  };
};

export const getCategoriesFromSlug = (
  slug: string[],
  categories = categoriesData,
) => {
  const flatCategories = getFlatCategories(categories);
  const categoriesFromSlug = [];

  for (const segment of slug) {
    const category = Object.values(flatCategories).find(
      (category) => category.slug === segment,
    );

    if (!category) {
      continue;
    }

    categoriesFromSlug.push(category);
  }

  return categoriesFromSlug;
};
