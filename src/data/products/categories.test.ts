import { describe, expect, test } from "vitest";

import {
  getCategoryPaths,
  enrichCategoriesWithProducts,
  createSlugsCollection,
  type CategoryCollectionWithProduct,
} from "./categories";
import type {
  Category,
  DbProduct,
  ProductForCategory,
  SubCategory,
} from "../types";
import { getProductsPaths } from "./products";

const mockCategories = [
  {
    id: 24,
    name: "Riscaldamento",
    slug: "riscaldamento",
    count: 73,
    parent: null,
    featured_image: null,
    fullSlug: "riscaldamento",
    level: 0,
    breadcrumbs: [],
  },
  {
    id: 35,
    name: "Caldaie",
    slug: "caldaie-a-pellet",
    count: 9,
    parent: 24,
    featured_image: null,
    level: 1,
    fullSlug: "riscaldamento/caldaie-a-pellet",
    breadcrumbs: [],
  },
  {
    id: 406,
    name: "Caldaie a pellet",
    slug: "caldaie-a-pellet-caldaie-a-pellet",
    count: 3,
    featured_image: null,
    parent: 35,
    fullSlug:
      "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
    breadcrumbs: [],
    level: 2,
  },
  {
    id: 34,
    name: "Camini",
    slug: "camini-inserti",
    count: 38,
    parent: 24,
    featured_image: null,
    breadcrumbs: [],
    fullSlug: "riscaldamento/camini-inserti",
    level: 1,
  },
  {
    id: 407,
    name: "Inserti a legna",
    slug: "inserti-a-legna-camini-inserti",
    count: 10,
    parent: 34,
    featured_image: null,
    breadcrumbs: [],
    fullSlug: "riscaldamento/camini-inserti/inserti-a-legna-camini-inserti",
    level: 2,
  },
] satisfies Category[];

const baseProduct = {
  brand: "test-brand",
  categories: [],
  description: "test-description",
  formats: "test-format",
  fullDescription: {},
  images: [],
  mainCategory: mockCategories[0],
};

const dummyProduct = {
  id: 1,
  name: "test product",
  slug: "test-product",
  ...baseProduct,
} satisfies DbProduct;
const dummyProductForCategory = {
  name: dummyProduct.name,
  image: undefined,
  link: `riscaldamento/${dummyProduct.slug}`,
} satisfies ProductForCategory;

const createMockGetProducts =
  (products?: (typeof dummyProduct)[]) => async () => {
    return products || [];
  };

const baseCategory = {
  featured_image: null,
  level: 0,
  breadcrumbs: [],
  parent: null,
};

const mockCategory = {
  id: 24,
  name: "Riscaldamento",
  slug: "riscaldamento",
  fullSlug: "riscaldamento",
  count: 73,
  ...baseCategory,
} satisfies Category;

describe("prepare db", () => {
  test("adds products to a category", async () => {
    const mockedGetProducts = createMockGetProducts([dummyProduct]);

    const categoriesWithProducts = await enrichCategoriesWithProducts(
      {
        24: mockCategory,
      },
      mockedGetProducts,
    );

    expect(categoriesWithProducts).toStrictEqual({
      24: {
        ...mockCategory,
        products: [dummyProductForCategory],
      },
    });
  });
});

describe("generates slugs for", () => {
  test("main and paginated first page", () => {
    expect(
      createSlugsCollection([
        {
          id: 24,
          name: "Riscaldamento",
          slug: "riscaldamento",
          fullSlug: "riscaldamento",
          count: 73,
          ...baseCategory,
        },
      ]),
    ).toStrictEqual({
      24: {
        slugs: { main: "riscaldamento" },
      },
    });
  });

  test("with children", () => {
    expect(
      createSlugsCollection([
        {
          id: 24,
          name: "Riscaldamento",
          slug: "riscaldamento",
          fullSlug: "riscaldamento",
          count: 73,
          ...baseCategory,
        },
        {
          id: 35,
          name: "Caldaie",
          slug: "caldaie-a-pellet",
          fullSlug: "riscaldamento/caldaie-a-pellet",
          count: 9,
          ...baseCategory,
          parent: 24,
        },
      ]),
    ).toStrictEqual({
      24: {
        slugs: { main: "riscaldamento" },
      },
      "35": {
        slugs: {
          hierarchical: "riscaldamento/caldaie-a-pellet",
          main: "caldaie-a-pellet",
        },
      },
    });
  });

  test("deep hierarchy", () => {
    expect(createSlugsCollection(mockCategories)).toStrictEqual({
      24: {
        slugs: { main: "riscaldamento" },
      },
      34: {
        slugs: {
          hierarchical: "riscaldamento/camini-inserti",
          main: "camini-inserti",
        },
      },
      35: {
        slugs: {
          hierarchical: "riscaldamento/caldaie-a-pellet",
          main: "caldaie-a-pellet",
        },
      },
      406: {
        slugs: {
          hierarchical:
            "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
          main: "caldaie-a-pellet-caldaie-a-pellet",
        },
      },
      407: {
        slugs: {
          hierarchical:
            "riscaldamento/camini-inserti/inserti-a-legna-camini-inserti",
          main: "inserti-a-legna-camini-inserti",
        },
      },
    });
  });
});

const preparedDbWithProducts: CategoryCollectionWithProduct = {
  24: {
    id: 24,
    name: "Riscaldamento",
    slug: "riscaldamento",
    fullSlug: "riscaldamento",
    count: 4,
    ...baseCategory,
    products: [
      dummyProductForCategory,
      dummyProductForCategory,
      dummyProductForCategory,
      dummyProductForCategory,
    ],
  },
  35: {
    id: 35,
    name: "Caldaie",
    slug: "caldaie-a-pellet",
    fullSlug: "riscaldamento/caldaie-a-pellet",
    count: 1,
    ...baseCategory,
    products: [dummyProductForCategory],
  },
  406: {
    id: 406,
    name: "Caldaie a pellet",
    slug: "caldaie-a-pellet-caldaie-a-pellet",
    fullSlug:
      "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
    count: 1,
    ...baseCategory,
    products: [dummyProductForCategory],
  },
  34: {
    id: 34,
    name: "Camini",
    slug: "camini-inserti",
    fullSlug: "riscaldamento/camini-inserti",
    count: 5,
    ...baseCategory,
    products: [
      dummyProductForCategory,
      dummyProductForCategory,
      dummyProductForCategory,
      dummyProductForCategory,
      dummyProductForCategory,
    ],
  },
  407: {
    id: 407,
    name: "Inserti a legna",
    slug: "inserti-a-legna-camini-inserti",
    fullSlug: "riscaldamento/camini-inserti/inserti-a-legna-camini-inserti",
    ...baseCategory,
    count: 1,
    products: [dummyProductForCategory],
  },
};

/**
 * for a category
 *   - generate hierarchical numbered pages ({long-slug}/page/x)
 *   - generate hierarchical page ({long-slug}
 *   - generate main numbered pages ({slug}/page/x)
 *   - generate main slug page ({slug})
 */
describe.each<[undefined | SubCategory[], string]>([
  [undefined, "without subcategories"],
  [
    [
      {
        name: "Inserti a legna",
        url: "riscaldamento/inserti-a-legna-camini-inserti",
        count: 10,
      },
    ],
    "with subcategories",
  ],
])("generates category page %s", (subCategories) => {
  describe("with products in limit", () => {
    test("generates number page and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: "riscaldamento" },
          },
        },
        5,
      );

      const basePage = {
        title: "Riscaldamento",
        products: [
          dummyProductForCategory,
          dummyProductForCategory,
          dummyProductForCategory,
          dummyProductForCategory,
        ],
        count: {
          end: 4,
          start: 1,
          total: 4,
        },
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento/page/1",
          baseSlug: "riscaldamento",
          ...basePage,
        },
        {
          slug: "riscaldamento",
          baseSlug: "riscaldamento",
          ...basePage,
        },
      ]);
    });

    test("generates hierarchical numbered, hierarchical page, main numbered page and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[35], subCategories },
        {
          35: {
            slugs: {
              hierarchical: "riscaldamento/caldaie-a-pellet",
              main: "caldaie-a-pellet",
            },
          },
        },
        3,
      );

      const basePage = {
        title: "Caldaie",
        products: [dummyProductForCategory],
        baseSlug: "caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento/caldaie-a-pellet/page/1",
          ...basePage,
        },
        {
          slug: "riscaldamento/caldaie-a-pellet",
          ...basePage,
        },
        {
          slug: "caldaie-a-pellet/page/1",
          ...basePage,
        },
        {
          slug: "caldaie-a-pellet",
          ...basePage,
        },
      ]);
    });
  });

  describe("with more products than limit", () => {
    test("generates numbered pages and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[24], subCategories },
        {
          24: {
            slugs: { main: "riscaldamento" },
          },
        },
        3,
      );

      const basePage = {
        title: "Riscaldamento",
        baseSlug: "riscaldamento",
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento/page/1",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: {
            end: 3,
            start: 1,
            total: 4,
          },
          pagination: {
            current: {
              href: "riscaldamento/page/1",
              number: 1,
            },
            first: {
              href: "riscaldamento/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/page/2",
              number: 2,
            },
            next: {
              href: "riscaldamento/page/2",
              number: 2,
            },
          },
        },
        {
          slug: "riscaldamento/page/2",
          products: [dummyProductForCategory],
          ...basePage,
          count: {
            end: 4,
            start: 4,
            total: 4,
          },
          pagination: {
            current: {
              href: "riscaldamento/page/2",
              number: 2,
            },
            first: {
              href: "riscaldamento/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/page/2",
              number: 2,
            },
            previous: {
              href: "riscaldamento/page/1",
              number: 1,
            },
          },
        },
        {
          slug: "riscaldamento",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: {
            end: 3,
            start: 1,
            total: 4,
          },
          pagination: {
            current: {
              href: "riscaldamento",
              number: 1,
            },
            first: {
              href: "riscaldamento/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/page/2",
              number: 2,
            },
            next: {
              href: "riscaldamento/page/2",
              number: 2,
            },
          },
        },
      ]);
    });

    test("generates hierarchical numbered pages, hierarchical page, main numbered pages and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[34], subCategories },
        {
          34: {
            slugs: {
              hierarchical: "riscaldamento/camini-inserti",
              main: "camini-inserti",
            },
          },
        },
        3,
      );

      const basePage = {
        title: "Camini",
        baseSlug: "camini-inserti",
      };
      const firstPageCount = {
        end: 3,
        start: 1,
        total: 5,
      };
      const secondPageCount = {
        end: 5,
        start: 4,
        total: 5,
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento/camini-inserti/page/1",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: firstPageCount,
          pagination: {
            current: {
              href: "riscaldamento/camini-inserti/page/1",
              number: 1,
            },
            first: {
              href: "riscaldamento/camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
            next: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
          },
        },
        {
          slug: "riscaldamento/camini-inserti/page/2",
          products: [dummyProductForCategory, dummyProductForCategory],
          ...basePage,
          count: secondPageCount,
          pagination: {
            current: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
            first: {
              href: "riscaldamento/camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
            previous: {
              href: "riscaldamento/camini-inserti/page/1",
              number: 1,
            },
          },
        },
        {
          slug: "riscaldamento/camini-inserti",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: firstPageCount,
          pagination: {
            current: {
              href: "riscaldamento/camini-inserti",
              number: 1,
            },
            first: {
              href: "riscaldamento/camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
            next: {
              href: "riscaldamento/camini-inserti/page/2",
              number: 2,
            },
          },
        },
        {
          slug: "camini-inserti/page/1",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: firstPageCount,
          pagination: {
            current: {
              href: "camini-inserti/page/1",
              number: 1,
            },
            first: {
              href: "camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "camini-inserti/page/2",
              number: 2,
            },
            next: {
              href: "camini-inserti/page/2",
              number: 2,
            },
          },
        },
        {
          slug: "camini-inserti/page/2",
          products: [dummyProductForCategory, dummyProductForCategory],
          ...basePage,
          count: secondPageCount,
          pagination: {
            current: {
              href: "camini-inserti/page/2",
              number: 2,
            },
            first: {
              href: "camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "camini-inserti/page/2",
              number: 2,
            },
            previous: {
              href: "camini-inserti/page/1",
              number: 1,
            },
          },
        },
        {
          slug: "camini-inserti",
          products: [
            dummyProductForCategory,
            dummyProductForCategory,
            dummyProductForCategory,
          ],
          ...(subCategories ? { subCategories } : {}),
          ...basePage,
          count: firstPageCount,
          pagination: {
            current: {
              href: "camini-inserti",
              number: 1,
            },
            first: {
              href: "camini-inserti/page/1",
              number: 1,
            },
            last: {
              href: "camini-inserti/page/2",
              number: 2,
            },
            next: {
              href: "camini-inserti/page/2",
              number: 2,
            },
          },
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
describe.skip("generates product pages", () => {
  test("generates category product page and product rewrite", () => {
    const generatedProductPages = getProductsPaths(preparedDbWithProducts[35], {
      35: {
        slugs: { main: "caldaie-a-pellet" },
      },
    });

    expect(generatedProductPages).toStrictEqual([
      {
        slug: "caldaie-a-pellet/test-product",
        product: dummyProduct,
      },
      {
        slug: "test-product",
        product: dummyProduct,
      },
    ]);
  });

  test("generates hierarchical category product page, product and main rewrites", () => {
    const generatedProductPages = getProductsPaths(preparedDbWithProducts[35], {
      35: {
        slugs: {
          hierarchical: "riscaldamento/caldaie-a-pellet",
          main: "caldaie-a-pellet",
        },
      },
    });

    expect(generatedProductPages).toStrictEqual([
      {
        slug: "riscaldamento/caldaie-a-pellet/test-product",
        product: dummyProduct,
      },
      {
        slug: "test-product",
        product: dummyProduct,
      },
      {
        slug: "caldaie-a-pellet/test-product",
        product: dummyProduct,
      },
    ]);
  });
});
