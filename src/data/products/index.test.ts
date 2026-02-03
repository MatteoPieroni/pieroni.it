import { describe, expect, test } from 'vitest';

import {
  getFlatCategories,
  getCategoryPaths,
  enrichCategoriesWithProducts,
  createSlugsCollection,
  type CategoryCollectionWithProduct,
  type FlatCategory,
  getProductsPaths,
  getAllCategories,
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
 *   - generate hierarchical numbered pages ({long-slug}/page/x)
 *   - generate hierarchical page ({long-slug}
 *   - generate main numbered pages ({slug}/page/x)
 *   - generate main slug page ({slug})
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
    test('generates number page and main page', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: 'riscaldamento' },
          },
        },
        5,
      );

      const basePage = {
        title: 'Riscaldamento',
        products: [dummyProduct, dummyProduct, dummyProduct, dummyProduct],
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/page/1',
          ...basePage,
        },
        {
          slug: 'riscaldamento',
          ...basePage,
        },
      ]);
    });

    test('generates hierarchical numbered, hierarchical page, main numbered page and main page', () => {
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

      const basePage = {
        title: 'Caldaie',
        products: [dummyProduct],
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/caldaie-a-pellet/page/1',
          ...basePage,
        },
        {
          slug: 'riscaldamento/caldaie-a-pellet',
          ...basePage,
        },
        {
          slug: 'caldaie-a-pellet/page/1',
          ...basePage,
        },
        {
          slug: 'caldaie-a-pellet',
          ...basePage,
        },
      ]);
    });
  });

  describe('with more products than limit', () => {
    test('generates numbered pages and main page', () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: 'riscaldamento' },
          },
        },
        3,
      );

      const basePage = {
        title: 'Riscaldamento',
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
        {
          slug: 'riscaldamento/page/2',
          products: [dummyProduct],
          ...basePage,
        },
        {
          slug: 'riscaldamento',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
      ]);
    });

    test('generates hierarchical numbered pages, heirarchical page, main numbered pages and main page', () => {
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

      const basePage = {
        title: 'Camini',
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: 'riscaldamento/camini-inserti/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
        {
          slug: 'riscaldamento/camini-inserti/page/2',
          products: [dummyProduct, dummyProduct],
          ...basePage,
        },
        {
          slug: 'riscaldamento/camini-inserti',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
        {
          slug: 'camini-inserti/page/1',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
        {
          slug: 'camini-inserti/page/2',
          products: [dummyProduct, dummyProduct],
          ...basePage,
        },
        {
          slug: 'camini-inserti',
          products: [dummyProduct, dummyProduct, dummyProduct],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
        },
      ]);
    });
  });
});

/**
 * for a category
 *  for each product
 *    - generate product page with deepest ({long-slug}/{product-slug})
 *    - generate rewrite product slug to deepest ({product-slug} -> {long-slug}/{product-slug})
 *    - generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
 */
describe('generates product pages', () => {
  test('generates category product page and product rewrite', () => {
    const generatedProductPages = getProductsPaths(preparedDbWithProducts[35], {
      35: {
        slugs: { main: 'caldaie-a-pellet' },
      },
    });

    expect(generatedProductPages).toStrictEqual([
      {
        slug: 'caldaie-a-pellet/test-product',
        product: dummyProduct,
      },
      {
        slug: 'test-product',
        product: dummyProduct,
      },
    ]);
  });

  test('generates hierarchical category product page, product and main rewrites', () => {
    const generatedProductPages = getProductsPaths(preparedDbWithProducts[35], {
      35: {
        slugs: {
          hierarchical: 'riscaldamento/caldaie-a-pellet',
          main: 'caldaie-a-pellet',
        },
      },
    });

    expect(generatedProductPages).toStrictEqual([
      {
        slug: 'riscaldamento/caldaie-a-pellet/test-product',
        product: dummyProduct,
      },
      {
        slug: 'test-product',
        product: dummyProduct,
      },
      {
        slug: 'caldaie-a-pellet/test-product',
        product: dummyProduct,
      },
    ]);
  });
});

test('generates the full payload', async () => {
  const result = await getAllCategories(
    [
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
        ],
      },
    ],
    async (category) => {
      if (category.id === 24) {
        return [
          { ...dummyProduct, id: 1 },
          { ...dummyProduct, id: 2 },
        ];
      }

      return [{ ...dummyProduct, id: 2 }];
    },
  );

  expect(result).toStrictEqual({
    categories: [
      {
        title: 'Riscaldamento',
        products: [
          {
            id: 1,
            name: 'test product',
            slug: 'test-product',
          },
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'riscaldamento/page/1',
        subCategories: [
          {
            count: 9,
            id: 35,
            name: 'Caldaie',
            slug: 'caldaie-a-pellet',
          },
        ],
      },
      {
        title: 'Riscaldamento',
        products: [
          {
            id: 1,
            name: 'test product',
            slug: 'test-product',
          },
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],

        subCategories: [
          {
            count: 9,
            id: 35,
            name: 'Caldaie',
            slug: 'caldaie-a-pellet',
          },
        ],
        slug: 'riscaldamento',
      },
      {
        title: 'Caldaie',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'riscaldamento/caldaie-a-pellet/page/1',
        subCategories: [
          {
            count: 3,
            id: 406,
            name: 'Caldaie a pellet',
            slug: 'caldaie-a-pellet-caldaie-a-pellet',
          },
        ],
      },
      {
        title: 'Caldaie',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],

        subCategories: [
          {
            count: 3,
            id: 406,
            name: 'Caldaie a pellet',
            slug: 'caldaie-a-pellet-caldaie-a-pellet',
          },
        ],
        slug: 'riscaldamento/caldaie-a-pellet',
      },
      {
        title: 'Caldaie',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],

        subCategories: [
          {
            count: 3,
            id: 406,
            name: 'Caldaie a pellet',
            slug: 'caldaie-a-pellet-caldaie-a-pellet',
          },
        ],
        slug: 'caldaie-a-pellet/page/1',
      },
      {
        title: 'Caldaie',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],

        subCategories: [
          {
            count: 3,
            id: 406,
            name: 'Caldaie a pellet',
            slug: 'caldaie-a-pellet-caldaie-a-pellet',
          },
        ],
        slug: 'caldaie-a-pellet',
      },
      {
        title: 'Caldaie a pellet',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/page/1',
      },
      {
        title: 'Caldaie a pellet',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet',
      },
      {
        title: 'Caldaie a pellet',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'caldaie-a-pellet-caldaie-a-pellet/page/1',
      },
      {
        title: 'Caldaie a pellet',
        products: [
          {
            id: 2,
            name: 'test product',
            slug: 'test-product',
          },
        ],
        slug: 'caldaie-a-pellet-caldaie-a-pellet',
      },
    ],
    productsPages: [
      {
        product: {
          id: 1,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'riscaldamento/test-product',
      },
      {
        product: {
          id: 1,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'riscaldamento/test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'riscaldamento/caldaie-a-pellet/test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'caldaie-a-pellet/test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'test-product',
      },
      {
        product: {
          id: 2,
          name: 'test product',
          slug: 'test-product',
        },
        slug: 'caldaie-a-pellet-caldaie-a-pellet/test-product',
      },
    ],
  });
});
