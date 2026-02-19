import type { Category } from '../types';

export const getProductsInCategory = async (
  category: Pick<Category, 'id'>,
  pageLimit = 100,
  page = 1,
) => {
  const USER_KEY = import.meta.env.USER_KEY;
  const USER_SECRET = import.meta.env.USER_SECRET;
  const WOOCOMMERCE_URL = 'https://api.pieroni.it/wp-json/wc/v3';

  const auth = Buffer.from(`${USER_KEY}:${USER_SECRET}`).toString('base64');
  const products: any[] = [];

  while (true) {
    const response = await fetch(
      `${WOOCOMMERCE_URL}/products?category=${category.id}&per_page=${pageLimit}&page=${page}&status=publish`,
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

    if (pageProducts.length < pageLimit) {
      break;
    }

    page++;
  }

  return products;
};
