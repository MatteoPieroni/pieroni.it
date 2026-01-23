type Category = {
  id: number;
  name: string;
  slug: string;
  children: Category[];
};

const getProductsInCategory = async (
  category: Category,
  mainCategory?: Category,
  parents?: Category[],
) => {
  const USER_KEY = import.meta.env.USER_KEY;
  const USER_SECRET = import.meta.env.USER_SECRET;
  const WOOCOMMERCE_URL = 'https://www.pieroni.it/wp-json/wc/v3';

  const auth = Buffer.from(`${USER_KEY}:${USER_SECRET}`).toString('base64');
  const products: any[] = [];
  let page = 1;
  const perPageLimit = 100;

  while (true) {
    const response = await fetch(
      `${WOOCOMMERCE_URL}/products?category=${category.id}&per_page=${perPageLimit}&page=${page}&status=publish`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      break;
    }

    const pageProducts = await response.json();
    if (pageProducts.length === 0) {
      break;
    }

    products.push(...pageProducts);

    if (pageProducts.length < perPageLimit) {
      break;
    }

    page++;
  }

  const productPaths = products.map((product) => {
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
                slug: `${parents?.map((parent) => parent.slug).join('/')}/${category.slug}/${product.slug}`,
              },
              props: {
                product: productFields,
              },
            },
          ]
        : []),
    ];
  });

  return productPaths.flat();
};

interface ProductImage {
  src: string;
  alt?: string;
}

interface ProductAttribute {
  name: string;
  slug?: string;
  options: string[];
  visible?: boolean;
}

interface ProductCategory {
  name: string;
  slug?: string;
}

interface Product {
  title: string;
  images?: {
    featured?: ProductImage;
    gallery?: ProductImage[];
  };
  description?: string;
  fullDescription?: string;
  attributes?: ProductAttribute[];
  categories?: ProductCategory[];
}

type PageData = {
  params: { category: string; slug: string };
  props: { product: Product };
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

  const currentCategoryProducts = await getProductsInCategory(
    category,
    mainCategory,
    parentsSubCategories || [],
  );

  paths.push(...currentCategoryProducts);

  return paths;
};

export const getProductPathsToGenerate = async (categories: Category[]) => {
  const paths: PageData[] = [];

  for (const category of categories) {
    const subCategoryPaths = await processCategory(category);

    paths.push(...subCategoryPaths);
  }

  return paths;
};
