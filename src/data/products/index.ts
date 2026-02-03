import { getProductsInCategory } from './adapter';
import type { Category } from './types';
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
} & (
  | {
      products: any[];
      subCategories?: FlatCategory[];
    }
  | {
      rewrite: string;
    }
);

/**
 * for a category
 *   - generate hierarchical numbered pages with products ({long-slug}/page/x)
 *   - generate rewrite hierarchical slug to first page ({long-slug} -> {long-slug/page/1})
 *   - generate rewrites numbered pages to hierarchical numbered pages ({slug}/page/x -> {long-slug}/page/x)
 *   - generate rewrites main slug to hierarchical first page ({slug} -> {long-slug}/page/1)
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

  const mainSlug = currentCategorySlugs.slugs.main;
  const firstProductMainPageSlug = `${mainSlug}/page/1`;

  const subCategories = category.subCategories
    ? { subCategories: category.subCategories }
    : {};

  if (category.products.length <= limit) {
    if (!currentCategorySlugs.slugs.hierarchical) {
      // generate numbered page with products ({slug}/page/1)
      const firstProductPage: CategoryPageData = {
        slug: firstProductMainPageSlug,
        products: category.products,
        ...subCategories,
      };
      // generate rewrite main slug to first page ({slug} -> {slug/page/1})
      const mainProductPage: CategoryPageData = {
        slug: currentCategorySlugs.slugs.main,
        rewrite: firstProductMainPageSlug,
      };

      return [firstProductPage, mainProductPage];
    }

    const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
    const firstProductPageSlug = `${hierarchicalSlug}/page/1`;

    // generate hierarchical first page with products ({long-slug}/page/1)
    const hierarchicalFirstProductPage: CategoryPageData = {
      slug: firstProductPageSlug,
      products: category.products,
      ...subCategories,
    };
    // generate rewrite main hierarchical slug to first page ({long-slug} -> {slug}/page/1)
    const hierarchicalMainPage: CategoryPageData = {
      slug: currentCategorySlugs.slugs.hierarchical,
      rewrite: firstProductPageSlug,
    };

    // generate rewrite first page to hierarchical numbered pages ({slug}/page/1 -> {long-slug}/page/1)
    const firstProductPage: CategoryPageData = {
      slug: firstProductMainPageSlug,
      rewrite: firstProductPageSlug,
    };
    // generate rewrite main slug to first page ({slug} -> {slug/page/1})
    const mainProductPage: CategoryPageData = {
      slug: mainSlug,
      rewrite: firstProductPageSlug,
    };

    return [
      hierarchicalFirstProductPage,
      hierarchicalMainPage,
      firstProductPage,
      mainProductPage,
    ];
  }

  const splitProducts = splitProductsIntoPages(category.products, limit);

  if (!currentCategorySlugs.slugs.hierarchical) {
    const numberedPages: CategoryPageData[] = [];

    // generate numbered pages with products ({slug}/page/x)
    for (const [index, pageProducts] of splitProducts.entries()) {
      numberedPages.push({
        slug: `${category.slug}/page/${index + 1}`,
        products: pageProducts,
        // add subcategories only on first page
        ...(index === 0 ? subCategories : []),
      });
    }

    // generate rewrite main slug to first page ({slug} -> {slug/page/1})
    const mainProductPage: CategoryPageData = {
      slug: mainSlug,
      rewrite: firstProductMainPageSlug,
    };

    return [...numberedPages, mainProductPage];
  }

  const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
  const firstProductPageSlug = `${hierarchicalSlug}/page/1`;

  const numberedPages: CategoryPageData[] = [];

  // generate hierarchical numbered pages with products ({long-slug}/page/x)
  for (const [index, pageProducts] of splitProducts.entries()) {
    numberedPages.push({
      slug: `${hierarchicalSlug}/page/${index + 1}`,
      products: pageProducts,
      // add subcategories only on first page
      ...(index === 0 ? subCategories : []),
    });
  }

  // generate rewrite main hierarchical slug to first page ({long-slug} -> {slug}/page/1)
  const hierarchicalMainPage: CategoryPageData = {
    slug: currentCategorySlugs.slugs.hierarchical,
    rewrite: firstProductPageSlug,
  };

  // generate rewrites numbered pages to hierarchical numbered pages ({slug}/page/x -> {long-slug}/page/x)
  const mainNumberedProductPages: CategoryPageData[] = numberedPages.map(
    (numberedPage) => ({
      // small trick here to make the numbers correspond
      slug: `${mainSlug}/page/${numberedPage.slug.at(-1)}`,
      rewrite: numberedPage.slug,
    }),
  );

  // generate rewrite main slug to hierarchical first page ({slug} -> {long-slug}/page/1)
  const mainPage: CategoryPageData = {
    slug: mainSlug,
    rewrite: firstProductPageSlug,
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
} & (
  | {
      product: Record<string, unknown>;
    }
  | {
      rewrite: string;
    }
);

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
        rewrite: mainSlugWithProduct,
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
        rewrite: deepestSlugWithProduct,
      };

      // generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
      const mainProductPage = {
        slug: `${mainSlug}/${productSlug}`,
        rewrite: deepestSlugWithProduct,
      };

      productPages.push([deepestProductPage, productPage, mainProductPage]);
    }
  }

  return productPages.flat();
};

export const getAllCategories = async (
  categories: typeof categoriesData,
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
