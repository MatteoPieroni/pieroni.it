import { describe, expect, test } from "vitest";

import { getCategoryPaths, type CategoryWithSubcategories } from "./categories";
import type { Category, DbCategoryProduct, SubCategory } from "../types";

const dummyProductForCategory = {
  name: "test product",
  featuredImage: {
    url: "",
    alt: "",
  },
  fullSlug: `riscaldamento/test-product`,
} satisfies DbCategoryProduct;

const baseCategory = {
  featured_image: null,
  breadcrumbs: [],
};

const preparedDbWithProducts: Category[] = [
  {
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
  {
    id: 35,
    name: "Caldaie",
    slug: "caldaie-a-pellet",
    fullSlug: "riscaldamento/caldaie-a-pellet",
    count: 1,
    ...baseCategory,
    products: [dummyProductForCategory],
  },
  {
    id: 406,
    name: "Caldaie a pellet",
    slug: "caldaie-a-pellet-caldaie-a-pellet",
    fullSlug:
      "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
    count: 1,
    ...baseCategory,
    products: [dummyProductForCategory],
  },
  {
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
  {
    id: 407,
    name: "Inserti a legna",
    slug: "inserti-a-legna-camini-inserti",
    fullSlug: "riscaldamento/camini-inserti/inserti-a-legna-camini-inserti",
    ...baseCategory,
    count: 1,
    products: [dummyProductForCategory],
  },
];

/**
 * for a category
 *   - generate hierarchical numbered pages ({long-slug}/page/x)
 *   - generate hierarchical page ({long-slug}
 *   - generate main numbered pages ({slug}/page/x)
 *   - generate main slug page ({slug})
 */
describe.each<[string, undefined | SubCategory[]]>([
  ["without subcategories", undefined],
  [
    "with subcategories",
    [
      {
        name: "Inserti a legna",
        url: "riscaldamento/inserti-a-legna-camini-inserti",
        count: 10,
      },
    ],
  ],
])("generates category page %s", (_, subCategories) => {
  describe("with products in limit", () => {
    test("generates number page and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        {
          ...preparedDbWithProducts[0],
          ...(subCategories ? { subCategories } : {}),
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
        breadcrumbs: [],
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento",
          fullSlug: "riscaldamento",
          ...basePage,
        },
        {
          slug: "riscaldamento/page/1",
          fullSlug: "riscaldamento",
          ...basePage,
        },
      ]);
    });

    test("generates hierarchical numbered, hierarchical page, main numbered page and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[1], subCategories },
        3,
      );

      const basePage = {
        title: "Caldaie",
        products: [dummyProductForCategory],
        fullSlug: "riscaldamento/caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
        breadcrumbs: [],
        ...(subCategories ? { subCategories } : {}),
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento/caldaie-a-pellet",
          ...basePage,
        },
        {
          slug: "riscaldamento/caldaie-a-pellet/page/1",
          ...basePage,
        },
        {
          slug: "caldaie-a-pellet",
          ...basePage,
        },
        {
          slug: "caldaie-a-pellet/page/1",
          ...basePage,
        },
      ]);
    });
  });

  describe("with more products than limit", () => {
    test("generates numbered pages and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        { ...preparedDbWithProducts[0], subCategories },
        3,
      );

      const basePage = {
        title: "Riscaldamento",
        breadcrumbs: [],
      };

      expect(generatedCategoryPages).toStrictEqual([
        {
          slug: "riscaldamento",
          fullSlug: "riscaldamento",
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
        {
          slug: "riscaldamento/page/1",
          fullSlug: "riscaldamento",
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
          fullSlug: "riscaldamento/page/2",
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
      ]);
    });

    test("generates hierarchical numbered pages, hierarchical page, main numbered pages and main page", () => {
      const generatedCategoryPages = getCategoryPaths(
        {
          ...preparedDbWithProducts[3],
          ...(subCategories ? { subCategories } : {}),
        },
        3,
      );

      const basePage = {
        title: "Camini",
        breadcrumbs: [],
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
          slug: "riscaldamento/camini-inserti",
          fullSlug: "riscaldamento/camini-inserti",
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
          slug: "riscaldamento/camini-inserti/page/1",
          fullSlug: "riscaldamento/camini-inserti",
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
          fullSlug: "riscaldamento/camini-inserti/page/2",
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
          slug: "camini-inserti",
          fullSlug: "riscaldamento/camini-inserti",
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
        {
          slug: "camini-inserti/page/1",
          fullSlug: "riscaldamento/camini-inserti",
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
          fullSlug: "riscaldamento/camini-inserti/page/2",
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
      ]);
    });
  });
});
