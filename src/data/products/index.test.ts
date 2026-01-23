import { expect, test } from 'vitest';

import { getCategoriesPaths } from '.';
import type { Category } from './types';

const mockCategories = [
  {
    id: 24,
    name: 'Riscaldamento',
    slug: 'riscaldamento',
    count: 73,
    children: [
      {
        id: 35,
        name: 'Caldaie',
        slug: 'caldaie-a-pellet',
        count: 9,
        children: [
          {
            id: 406,
            name: 'Caldaie a pellet',
            slug: 'caldaie-a-pellet-caldaie-a-pellet',
            count: 3,
            children: [],
          },
        ],
      },
      {
        id: 34,
        name: 'Camini',
        slug: 'camini-inserti',
        count: 38,
        children: [
          {
            id: 407,
            name: 'Inserti a legna',
            slug: 'inserti-a-legna-camini-inserti',
            count: 10,
            children: [],
          },
        ],
      },
    ],
  },
];

const dummyProduct = {
  id: 1,
  name: 'test product',
  slug: 'test-product',
};

const longNumberOfProducts = Array(15).fill(dummyProduct);

const expectedPages = [
  {
    params: {
      category: 'caldaie-a-pellet-caldaie-a-pellet',
      slug: '',
    },
    props: {
      products: [],
    },
  },
  {
    params: {
      category: 'caldaie-a-pellet-caldaie-a-pellet',
      slug: 'page/1',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet',
    },
    props: {
      products: [],
    },
  },
  {
    params: {
      category: 'caldaie-a-pellet',
      slug: '',
    },
    props: {
      products: [],
    },
  },
  {
    params: {
      category: 'caldaie-a-pellet',
      slug: 'page/1',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'caldaie-a-pellet',
    },
    props: {
      products: [],
    },
  },
  {
    params: {
      category: 'inserti-a-legna-camini-inserti',
      slug: '',
    },
    props: {
      products: [dummyProduct],
    },
  },
  {
    params: {
      category: 'inserti-a-legna-camini-inserti',
      slug: 'page/1',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'camini-inserti/inserti-a-legna-camini-inserti',
    },
    props: {
      products: [dummyProduct],
    },
  },
  {
    params: {
      category: 'inserti-a-legna-camini-inserti',
      slug: 'test-product',
    },
    props: {
      rewrite: 'riscaldamento/test-product',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'camini-inserti/inserti-a-legna-camini-inserti/test-product',
    },
    props: {
      rewrite: 'riscaldamento/test-product',
    },
  },
  {
    params: {
      category: 'camini-inserti',
      slug: '',
    },
    props: {
      products: [dummyProduct],
    },
  },
  {
    params: {
      category: 'camini-inserti',
      slug: 'page/1',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'camini-inserti',
    },
    props: {
      products: [dummyProduct],
    },
  },
  {
    params: {
      category: 'camini-inserti',
      slug: 'test-product',
    },
    props: {
      rewrite: 'riscaldamento/test-product',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'camini-inserti/test-product',
    },
    props: {
      rewrite: 'riscaldamento/test-product',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: '',
    },
    props: {
      products: [dummyProduct],
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'page/1',
    },
  },
  {
    params: {
      category: 'riscaldamento',
      slug: 'test-product',
    },
    props: {
      product: dummyProduct,
    },
  },
];

const mockGetProducts = async (
  category: Category,
  pageLimit?: number,
  currentPage?: number,
) => {
  if (category.id === 24) {
    return longNumberOfProducts;
  }

  // both deeply nested sub category and parent categories need to return
  if (category.id === 407 || category.id === 34) {
    return [dummyProduct];
  }

  return [];
};

test('creates the main categories', async () => {
  const mockGetProducts = async () => {
    return [];
  };

  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});

test.skip('creates the sub categories pages', async () => {
  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});

test.skip('creates the product pages for main category', async () => {
  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});

test.skip('creates the product pages for sub categories category', async () => {
  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});

test.skip('creates the product pages with pagination', async () => {
  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});
