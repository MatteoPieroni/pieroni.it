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

const processProducts = (products: any[], mainCategory: Category) => {
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

  // current category path
  const currentCategoryPath = {
    params: {
      category: category.slug,
      slug: '',
    },
    // props: {
    //   product: productFields,
    // },
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
  };

  // all products paths
  // rewrite to main category product

  // 1. get the current category products
  const products = await fetchProducts(category);
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
  const processedProducts = processProducts(products, category);
  console.log({ t: JSON.stringify(processedProducts, null, 2) });

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
    // props: {
    //   product: productFields,
    // },
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

  // all products paths
  const productPaths = processedProducts;

  const currentPaths = [currentCategoryPath, ...pagesPaths, ...productPaths];

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
