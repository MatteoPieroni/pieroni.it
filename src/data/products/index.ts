import { getProductsInCategory } from './adapter';
import type { Category, Product } from './types';
import categoriesData from './categories.json';

type PageData = {
  params: { category: string; slug: string };
  props: { product: Product } | { rewrite: string };
};

const processCategory = async (
  category: Category,
  mainCategory?: Category,
  parentsSubCategories?: Category[],
) => {
  const paths: PageData[] = [];
  const isSubCategory = !!mainCategory;

  if (category.children) {
    for (const subCategory of category.children) {
      const subCategoryPaths = await processCategory(
        subCategory,
        // we either have a main category that we're carrying or we're processing the mainCategory
        mainCategory || category,
        // we only want parents if we're not in the top category
        // add the previous parents and the current parent from which we're checking the children
        isSubCategory ? [...(parentsSubCategories || []), category] : [],
      );

      paths.push(...subCategoryPaths);
    }
  }

  const currentCategoryProducts = await getProductsInCategory(category);
  const currentPaths = currentCategoryProducts.map((product) => {
    const productFields = {
      title: product.name,
      images: product.images,
      description: product.short_description,
      fullDescription: product.description,
      attributes: product.attributes,
      categories: product.categories,
    };

    return [
      {
        params: {
          category: category.slug,
          slug: product.slug,
        },
        props: {
          product: productFields,
        },
      },
      ...(mainCategory
        ? [
            {
              params: {
                category: mainCategory.slug,
                slug: `${parentsSubCategories?.map((parent) => parent.slug).join('/')}/${category.slug}/${product.slug}`,
              },
              props: {
                product: productFields,
              },
            },
          ]
        : []),
    ];
  });

  paths.push(...currentPaths.flat());

  return paths;
};

export const getProductPathsToGenerate = async () => {
  const paths: PageData[] = [];

  for (const category of categoriesData) {
    const subCategoryPaths = await processCategory(category);

    paths.push(...subCategoryPaths);
  }

  return paths;
};

const processProductPaths = (products: any[], mainCategory: Category) => {
  return products.map((product) => ({
    params: {
      category: mainCategory.slug,
      slug: product.slug,
    },
    props: {
      product,
    },
  }));
};

const processProductsWithRewrites = (
  products: any[],
  category: Category,
  mainCategory: Category,
  parentsSubCategories: Category[],
  mainCategoryProducts: any[],
) => {
  const productPaths = products.map((product) => {
    const mainCategoryProductRef = mainCategoryProducts.find(
      (mainCategoryProduct) => mainCategoryProduct.id === product.id,
    );

    if (!mainCategoryProductRef) {
      throw new Error(`Categories mismatch: ${product.id}`);
    }

    // current category path with product
    const currentPath = {
      params: {
        category: category.slug,
        slug: product.slug,
      },
      props: {
        rewrite: `${mainCategory.slug}/${product.slug}`,
      },
    };

    const parentsSlug =
      parentsSubCategories.length === 0
        ? ''
        : parentsSubCategories.map((parent) => parent.slug).join('/') + '/';

    // nested path that includes all segments of subcategories
    const allSubCategoriesPath = {
      params: {
        category: mainCategory.slug,
        slug: `${parentsSlug}${category.slug}/${product.slug}`,
      },
      props: {
        rewrite: `${mainCategory.slug}/${product.slug}`,
      },
    };

    return [currentPath, allSubCategoriesPath];
  });

  return productPaths.flat();
};

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
  fetchProducts = getProductsInCategory,
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

type PageData2 = {
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
 *  for each slug
 *    - generate hierarchical numbered pages with products ({long-slug}/page/x)
 *    - generate rewrite hierarchical slug to first page ({long-slug} -> {long-slug/page/1})
 *    - generate rewrites numbered pages to hierarchical numbered pages ({slug}/page/x -> {long-slug}/page/x)
 *    - generate rewrites main slug to hierarchical first page ({slug} -> {long-slug}/page/1)
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
      const firstProductPage: PageData2 = {
        slug: firstProductMainPageSlug,
        products: category.products,
        ...subCategories,
      };
      // generate rewrite main slug to first page ({slug} -> {slug/page/1})
      const mainProductPage: PageData2 = {
        slug: currentCategorySlugs.slugs.main,
        rewrite: firstProductMainPageSlug,
      };

      return [firstProductPage, mainProductPage];
    }

    const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
    const firstProductPageSlug = `${hierarchicalSlug}/page/1`;

    // generate hierarchical first page with products ({long-slug}/page/1)
    const hierarchicalFirstProductPage: PageData2 = {
      slug: firstProductPageSlug,
      products: category.products,
      ...subCategories,
    };
    // generate rewrite main hierarchical slug to first page ({long-slug} -> {slug}/page/1)
    const hierarchicalMainPage: PageData2 = {
      slug: currentCategorySlugs.slugs.hierarchical,
      rewrite: firstProductPageSlug,
    };

    // generate rewrite first page to hierarchical numbered pages ({slug}/page/1 -> {long-slug}/page/1)
    const firstProductPage: PageData2 = {
      slug: firstProductMainPageSlug,
      rewrite: firstProductPageSlug,
    };
    // generate rewrite main slug to first page ({slug} -> {slug/page/1})
    const mainProductPage: PageData2 = {
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
    const numberedPages: PageData2[] = [];

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
    const mainProductPage: PageData2 = {
      slug: mainSlug,
      rewrite: firstProductMainPageSlug,
    };

    return [...numberedPages, mainProductPage];
  }

  const hierarchicalSlug = currentCategorySlugs.slugs.hierarchical;
  const firstProductPageSlug = `${hierarchicalSlug}/page/1`;

  const numberedPages: PageData2[] = [];

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
  const hierarchicalMainPage: PageData2 = {
    slug: currentCategorySlugs.slugs.hierarchical,
    rewrite: firstProductPageSlug,
  };

  // generate rewrites numbered pages to hierarchical numbered pages ({slug}/page/x -> {long-slug}/page/x)
  const mainNumberedProductPages: PageData2[] = numberedPages.map(
    (numberedPage) => ({
      // small trick here to make the numbers correspond
      slug: `${mainSlug}/page/${numberedPage.slug.at(-1)}`,
      rewrite: numberedPage.slug,
    }),
  );

  // generate rewrite main slug to hierarchical first page ({slug} -> {long-slug}/page/1)
  const mainPage: PageData2 = {
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
