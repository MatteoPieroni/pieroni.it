import { expect, test } from "vitest";

import type { Category, DbProduct, ProductForCategory } from "../types";
import { getAllCategories } from ".";

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

const baseCategory = {
  featured_image: null,
  level: 0,
  breadcrumbs: [],
  parent: null,
};

test("generates the full payload", async () => {
  const result = await getAllCategories(
    () =>
      new Promise((res) =>
        res([
          {
            id: 24,
            name: "Riscaldamento",
            slug: "riscaldamento",
            fullSlug: "riscaldamento",
            count: 2,
            ...baseCategory,
          },
          {
            id: 35,
            name: "Caldaie",
            slug: "caldaie-a-pellet",
            fullSlug: "riscaldamento/caldaie-a-pellet",
            count: 1,
            ...baseCategory,
            parent: 24,
          },
          {
            id: 406,
            name: "Caldaie a pellet",
            slug: "caldaie-a-pellet-caldaie-a-pellet",
            fullSlug:
              "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
            count: 1,
            ...baseCategory,
            parent: 35,
          },
        ]),
      ),
    async (category) => {
      if (category === 24) {
        return [
          { ...dummyProduct, name: "test product 1" },
          { ...dummyProduct, name: "test product 2" },
        ];
      }

      return [{ ...dummyProduct, name: "test product 2" }];
    },
  );

  expect(result).toStrictEqual({
    categories: [
      {
        title: "Riscaldamento",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 1",
          },
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "riscaldamento/page/1",
        baseSlug: "riscaldamento",
        count: {
          end: 2,
          start: 1,
          total: 2,
        },
        subCategories: [
          {
            count: 1,
            name: "Caldaie",
            url: "riscaldamento/caldaie-a-pellet",
          },
        ],
      },
      {
        title: "Riscaldamento",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 1",
          },
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],

        subCategories: [
          {
            count: 1,
            name: "Caldaie",
            url: "riscaldamento/caldaie-a-pellet",
          },
        ],
        slug: "riscaldamento",
        baseSlug: "riscaldamento",
        count: {
          end: 2,
          start: 1,
          total: 2,
        },
      },
      {
        title: "Caldaie",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "riscaldamento/caldaie-a-pellet/page/1",
        baseSlug: "caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
        subCategories: [
          {
            count: 1,
            name: "Caldaie a pellet",
            url: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
          },
        ],
      },
      {
        title: "Caldaie",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        subCategories: [
          {
            count: 1,
            name: "Caldaie a pellet",
            url: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
          },
        ],
        slug: "riscaldamento/caldaie-a-pellet",
        baseSlug: "caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        subCategories: [
          {
            count: 1,
            name: "Caldaie a pellet",
            url: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
          },
        ],
        slug: "caldaie-a-pellet/page/1",
        baseSlug: "caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        subCategories: [
          {
            count: 1,
            name: "Caldaie a pellet",
            url: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
          },
        ],
        slug: "caldaie-a-pellet",
        baseSlug: "caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie a pellet",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/page/1",
        baseSlug: "caldaie-a-pellet-caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie a pellet",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
        baseSlug: "caldaie-a-pellet-caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie a pellet",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "caldaie-a-pellet-caldaie-a-pellet/page/1",
        baseSlug: "caldaie-a-pellet-caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
      {
        title: "Caldaie a pellet",
        products: [
          {
            ...dummyProductForCategory,
            name: "test product 2",
          },
        ],
        slug: "caldaie-a-pellet-caldaie-a-pellet",
        baseSlug: "caldaie-a-pellet-caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
    ],
    productsPages: [],
    // productsPages: [
    //   {
    //     product: {
    //       id: 1,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "riscaldamento/test-product",
    //   },
    //   {
    //     product: {
    //       id: 1,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "riscaldamento/test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "riscaldamento/caldaie-a-pellet/test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "caldaie-a-pellet/test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "test-product",
    //   },
    //   {
    //     product: {
    //       id: 2,
    //       name: "test product",
    //       slug: "test-product",
    //     },
    //     slug: "caldaie-a-pellet-caldaie-a-pellet/test-product",
    //   },
    // ],
  });
});
