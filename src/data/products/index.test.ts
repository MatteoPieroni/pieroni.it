import { describe, expect, test } from 'vitest';

import {
  getFlatCategories,
  getCategoryPaths,
  enrichCategoriesWithProducts,
  createSlugsCollection,
  type CategoryCollectionWithProduct,
  type FlatCategory,
} from '.';

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

const createMockGetProducts =
  (products?: (typeof dummyProduct)[]) => async () => {
    return products || [];
  };

const mockFlatCategory = {
  id: 24,
  name: 'Riscaldamento',
  slug: 'riscaldamento',
  count: 73,
};

const preparedDb = {
  24: {
    id: 24,
    name: 'Riscaldamento',
    slug: 'riscaldamento',
    count: 73,
    subCategories: [
      {
        id: 35,
        name: 'Caldaie',
        slug: 'caldaie-a-pellet',
        count: 9,
      },
      {
        id: 34,
        name: 'Camini',
        slug: 'camini-inserti',
        count: 38,
      },
    ],
  },
  35: {
    id: 35,
    name: 'Caldaie',
    slug: 'caldaie-a-pellet',
    count: 9,
    subCategories: [
      {
        id: 406,
        name: 'Caldaie a pellet',
        slug: 'caldaie-a-pellet-caldaie-a-pellet',
        count: 3,
      },
    ],
  },
  406: {
    id: 406,
    name: 'Caldaie a pellet',
    slug: 'caldaie-a-pellet-caldaie-a-pellet',
    count: 3,
  },
  34: {
    id: 34,
    name: 'Camini',
    slug: 'camini-inserti',
    count: 38,
    subCategories: [
      {
        id: 407,
        name: 'Inserti a legna',
        slug: 'inserti-a-legna-camini-inserti',
        count: 10,
      },
    ],
  },
  407: {
    id: 407,
    name: 'Inserti a legna',
    slug: 'inserti-a-legna-camini-inserti',
    count: 10,
  },
};

describe('prepare db', () => {
  test('generates a list of all categories', () => {
    const resultingCategories = getFlatCategories(mockCategories);

    expect(resultingCategories).toStrictEqual(preparedDb);
  });

  test('adds products to a category', async () => {
    const mockedGetProducts = createMockGetProducts([dummyProduct]);

    const categoriesWithProducts = await enrichCategoriesWithProducts(
      {
        24: mockFlatCategory,
      },
      mockedGetProducts,
    );

    expect(categoriesWithProducts).toStrictEqual({
      24: {
        ...mockFlatCategory,
        products: [dummyProduct],
      },
    });
  });
});

describe('generates slugs for', () => {
  test('main and paginated first page', () => {
    expect(
      createSlugsCollection([
        {
          id: 24,
          name: 'Riscaldamento',
          slug: 'riscaldamento',
          count: 73,
          children: [],
        },
      ]),
    ).toStrictEqual({
      24: {
        slugs: { main: 'riscaldamento' },
      },
    });
  });

  test('with children', () => {
    expect(
      createSlugsCollection([
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
              children: [],
            },
          ],
        },
      ]),
    ).toStrictEqual({
      24: {
        slugs: { main: 'riscaldamento' },
      },
      '35': {
        slugs: {
          hierarchical: 'riscaldamento/caldaie-a-pellet',
          main: 'caldaie-a-pellet',
        },
      },
    });
  });

  test('deep hierarchy', () => {
    expect(createSlugsCollection(mockCategories)).toStrictEqual({
      24: {
        slugs: { main: 'riscaldamento' },
      },
      34: {
        slugs: {
          hierarchical: 'riscaldamento/camini-inserti',
          main: 'camini-inserti',
        },
      },
      35: {
        slugs: {
          hierarchical: 'riscaldamento/caldaie-a-pellet',
          main: 'caldaie-a-pellet',
        },
      },
      406: {
        slugs: {
          hierarchical:
            'riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet',
          main: 'caldaie-a-pellet-caldaie-a-pellet',
        },
      },
      407: {
        slugs: {
          hierarchical:
            'riscaldamento/camini-inserti/inserti-a-legna-camini-inserti',
          main: 'inserti-a-legna-camini-inserti',
        },
      },
    });
  });
});

const preparedDbWithProducts: CategoryCollectionWithProduct = {
  24: {
    id: 24,
    name: 'Riscaldamento',
    slug: 'riscaldamento',
    count: 4,
    products: [dummyProduct, dummyProduct, dummyProduct, dummyProduct],
  },
  35: {
    id: 35,
    name: 'Caldaie',
    slug: 'caldaie-a-pellet',
    count: 1,
    products: [dummyProduct],
  },
  406: {
    id: 406,
    name: 'Caldaie a pellet',
    slug: 'caldaie-a-pellet-caldaie-a-pellet',
    count: 1,
    products: [dummyProduct],
  },
  34: {
    id: 34,
    name: 'Camini',
    slug: 'camini-inserti',
    count: 5,
    products: [
      dummyProduct,
      dummyProduct,
      dummyProduct,
      dummyProduct,
      dummyProduct,
    ],
  },
  407: {
    id: 407,
    name: 'Inserti a legna',
    slug: 'inserti-a-legna-camini-inserti',
    count: 1,
    products: [dummyProduct],
  },
};

/**
 * for a category
 *  for each slug
 *    - generate numbered pages with products ({slug}/page/x)
 *    - generate rewrite main slug to first page ({slug} -> {slug/page/1})
 *    - generate rewrites hierarchical numbered pages to numbered pages ({long-slug}/page/x -> {slug}/page/x)
 *    - generate rewrites main hierarchical slug to first page ({long-slug} -> {slug}/page/1)
 */

describe.each<[undefined | FlatCategory[], string]>([
  [undefined, 'without subcategories'],
  [
    [
      {
        id: 407,
        name: 'Inserti a legna',
        slug: 'inserti-a-legna-camini-inserti',
        count: 10,
      },
    ],
    'with subcategories',
  ],
])('generates category page %s', (subCategories) => {
  describe('with products in limit', () => {
    test('generates number page and main rewrite', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: 'riscaldamento' },
          },
        },
        5,
      );

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
        },
        {
          slug: 'riscaldamento',
          rewrite: 'riscaldamento/page/1',
        },
      ]);
    });

    test('generates hierarchical numbered and main rewrites', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[35], subCategories },
        {
          35: {
            slugs: {
              hierarchical: 'riscaldamento/caldaie-a-pellet',
              main: 'caldaie-a-pellet',
            },
          },
        },
        3,
      );

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/caldaie-a-pellet/page/1',
          products: [dummyProduct],
          ...(subCategories ? { subCategories } : {}),
        },
        {
          slug: 'riscaldamento/caldaie-a-pellet',
          rewrite: 'riscaldamento/caldaie-a-pellet/page/1',
        },
        {
          slug: 'caldaie-a-pellet/page/1',
          rewrite: 'riscaldamento/caldaie-a-pellet/page/1',
        },
        {
          slug: 'caldaie-a-pellet',
          rewrite: 'riscaldamento/caldaie-a-pellet/page/1',
        },
      ]);
    });
  });

  describe('with more products than limit', () => {
    test('generates numbered pages and main rewrite', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: 'riscaldamento' },
          },
        },
        3,
      );

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
        },
        {
          slug: 'riscaldamento/page/2',
          products: [dummyProduct],
        },
        {
          slug: 'riscaldamento',
          rewrite: 'riscaldamento/page/1',
        },
      ]);
    });

    test('generates hierarchical numbered and main rewrites', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[34], subCategories },
        {
          34: {
            slugs: {
              hierarchical: 'riscaldamento/camini-inserti',
              main: 'camini-inserti',
            },
          },
        },
        3,
      );

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/camini-inserti/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
        },
        {
          slug: 'riscaldamento/camini-inserti/page/2',
          products: [dummyProduct, dummyProduct],
        },
        {
          slug: 'riscaldamento/camini-inserti',
          rewrite: 'riscaldamento/camini-inserti/page/1',
        },
        {
          slug: 'camini-inserti/page/1',
          rewrite: 'riscaldamento/camini-inserti/page/1',
        },
        {
          slug: 'camini-inserti/page/2',
          rewrite: 'riscaldamento/camini-inserti/page/2',
        },
        {
          slug: 'camini-inserti',
          rewrite: 'riscaldamento/camini-inserti/page/1',
        },
      ]);
    });
  });
});

describe.skip('generates product pages');
