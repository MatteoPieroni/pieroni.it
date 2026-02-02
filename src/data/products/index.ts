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

const processSubCategory = async (
  category: Category,
  mainCategory: Category,
  parentsSubCategories: Category[],
  mainCategoryProducts: any[],
  fetchProducts: typeof getProductsInCategory,
  paginationLimit: number,
) => {
  const paths: PageData[] = [];

  if (category.children) {
    for (const subCategory of category.children) {
      const subCategoryPaths = await processSubCategory(
        subCategory,
        // we either have a main category that we're carrying or we're processing the mainCategory
        mainCategory,
        // add the previous parents and the current parent from which we're checking the children
        [...(parentsSubCategories ? parentsSubCategories : []), category],
        mainCategoryProducts,
        fetchProducts,
        paginationLimit,
      );

      paths.push(...subCategoryPaths);
    }
  }

  // 1. get the current category products
  const products = await fetchProducts(category);

  // current category path
  const currentCategoryPath = {
    params: {
      category: category.slug,
      slug: '',
    },
    props: {
      products: products,
    },
  };

  // current pagination paths
  const pagesPaths = [
    {
      params: {
        category: category.slug,
        slug: 'page/1',
      },
      // props: {
      //   product: productFields,
      // },
    },
  ];

  const parentsSlug =
    parentsSubCategories.length === 0
      ? ''
      : parentsSubCategories.map((parent) => parent.slug).join('/') + '/';

  // nested path that includes all segments of subcategories
  const allSubCategoriesPath = {
    params: {
      category: mainCategory.slug,
      slug: `${parentsSlug}${category.slug}`,
    },
    props: {
      products: products,
    },
  };

  // all products paths
  // rewrite to main category product

  // 2. add rewrite to main category product for
  // - category/product
  // - full subcategories path
  const processedProducts = processProductsWithRewrites(
    products,
    category,
    mainCategory,
    parentsSubCategories,
    mainCategoryProducts,
  );

  const currentPaths = [
    currentCategoryPath,
    ...pagesPaths,
    allSubCategoriesPath,
    ...processedProducts,
  ];

  paths.push(...currentPaths);

  return paths;
};

const processMainCategory = async (
  category: Category,
  fetchProducts: typeof getProductsInCategory,
  paginationLimit: number,
) => {
  const paths: PageData[] = [];

  const products = await fetchProducts(category);

  if (category.children) {
    for (const subCategory of category.children) {
      const subCategoryPaths = await processSubCategory(
        subCategory,
        category,
        [],
        products,
        fetchProducts,
        paginationLimit,
      );

      paths.push(...subCategoryPaths);
    }
  }

  // current category path
  const currentCategoryPath = {
    params: {
      category: category.slug,
      slug: '',
    },
    props: {
      products: products.slice(0, paginationLimit),
    },
  };

  // current pagination paths
  const numberOfPages = Math.ceil(products.length / paginationLimit);

  const pagePaths = [];

  for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
    pagePaths.push({
      params: {
        category: category.slug,
        slug: `page/${pageNumber}`,
      },
      props: {
        products: products.slice(
          paginationLimit * pageNumber,
          paginationLimit * (pageNumber + 1),
        ),
      },
    });
  }

  // all products paths
  const productPaths = processProductPaths(products, category);

  const currentPaths = [currentCategoryPath, ...pagePaths, ...productPaths];

  paths.push(...currentPaths);

  return paths;
};

// for each level generate the cat pages (pagination)
export const getCategoriesPaths = async (
  categories = categoriesData,
  fetchProducts = getProductsInCategory,
) => {
  const paths: PageData[] = [];

  for (const category of categories) {
    const subCategoryPaths = await processMainCategory(
      category,
      fetchProducts,
      12,
    );

    paths.push(...subCategoryPaths);
  }

  return paths;
};

type FlatCategory = Omit<(typeof categoriesData)[number], 'children'>;
type CategoryCollection = Record<number, FlatCategory>;

export const getFlatCategories: (
  categories: typeof categoriesData,
) => CategoryCollection = (categories = categoriesData) => {
  return categories.reduce<CategoryCollection>(
    (acc, { children, ...current }) => {
      if (children.length > 0) {
        const flattenedChildren = getFlatCategories(children);

        return { ...acc, [current.id]: current, ...flattenedChildren };
      }

      return { ...acc, [current.id]: current };
    },
    {},
  );
};

type FlatCategoryWithProducts = {
  products: any[];
} & FlatCategory;

type CategoryCollectionWithProduct = Record<number, FlatCategoryWithProducts>;

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

export const getCategoryPaths = (
  category: FlatCategoryWithProducts,
  limit: number,
) => {
  if (category.count <= limit) {
    return {
      ...category,
      pages: {
        main: {
          slug: category.slug,
          products: category.products,
        },
        rewrites: [
          {
            slug: `${category.slug}/page/1`,
          },
        ],
      },
    };
  }

  const splitProducts = [];

  for (let index = 0; index < category.products.length; index += limit) {
    const pageProducts = category.products.slice(index, index + limit);
    splitProducts.push(pageProducts);
  }

  // remove the first page products
  const firstPageProducts = splitProducts.shift();

  const mainPage = {
    slug: category.slug,
    products: firstPageProducts,
  };

  const otherPages = [];

  for (const [index, pageProducts] of splitProducts.entries()) {
    otherPages.push({
      // the first index is taken by a rewrite
      slug: `${category.slug}/page/${index + 2}`,
      products: pageProducts,
    });
  }

  return {
    ...category,
    pages: {
      main: mainPage,
      pagination: otherPages,
      rewrites: [
        {
          slug: `${category.slug}/page/1`,
        },
      ],
    },
  };
};

const collectChildren = (categoryId: number, currentCategory: Category, parents: Category[]) => {
  const allParents = [];

  while (true) {
    if (currentCategory.id === categoryId) {
      break;
    };
  }
}

export const getRewritesWithParent = (
  flatCategories: CategoryCollection,
  categories: typeof categoriesData,
) => {
  const categoryWithParent = 
};
