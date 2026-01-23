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
  name: 'test product',
  slug: 'test-product',
};

const expectedPages = [
  {
    params: {
      category: 'caldaie-a-pellet-caldaie-a-pellet',
      slug: '',
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
  },
  {
    params: {
      category: 'caldaie-a-pellet',
      slug: '',
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
  },
  {
    params: {
      category: 'inserti-a-legna-camini-inserti',
      slug: '',
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
      product: {
        name: 'test product',
        slug: 'test-product',
      },
    },
  },
];

const mockGetProducts = async (
  category: Category,
  pageLimit?: number,
  currentPage?: number,
) => {
  // both deeply nested sub category and parent categories need to return
  if (category.id === 407 || category.id === 24 || category.id === 34) {
    return [dummyProduct];
  }

  return [];
};

test('creates the categories pages', async () => {
  const resultingPaths = await getCategoriesPaths(
    mockCategories,
    mockGetProducts,
  );

  expect(resultingPaths).toStrictEqual(expectedPages);
});
