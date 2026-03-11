import { expect, test } from "vitest";

import type {
  Category,
  DbProduct,
  ProductForCategory,
  ProductPageData,
} from "../types";
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
  categories: [mockCategories[0]],
  description: "test-description",
  formats: "test-format",
  fullDescription: {},
  images: [],
};

const mockProduct = {
  id: 1,
  name: "test product",
  slug: "test-product",
  mainCategory: mockCategories[0],
  ...baseProduct,
  categories: [mockCategories[0]],
} satisfies DbProduct;
const dummyProductForCategory = {
  name: mockProduct.name,
  image: undefined,
  link: `riscaldamento/${mockProduct.slug}`,
} satisfies ProductForCategory;

const baseCategory = {
  featured_image: null,
  level: 0,
  breadcrumbs: [],
  parent: null,
};

const dummyProduct = {
  ...baseProduct,
  name: "test product",
  slug: "test-product",
  breadcrumbs: [],
  fullSlug: "riscaldamento/test-product",
  categories: [
    {
      name: "Riscaldamento",
      url: "riscaldamento",
    },
  ],
} satisfies ProductPageData;

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
          { ...mockProduct, name: "test product 1" },
          { ...mockProduct, name: "test product 2" },
        ];
      }

      return [{ ...mockProduct, name: "test product 2" }];
    },
    async () => {
      return [
        mockProduct,
        {
          ...mockProduct,
          name: "test product 2",
          slug: "test-product-2",
          mainCategory: mockCategories[2],
          categories: [mockCategories[2], mockCategories[1], mockCategories[0]],
        },
      ];
    },
  );

  const secondDummyProduct = {
    ...dummyProduct,
    name: "test product 2",
    fullSlug:
      "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/test-product-2",
    categories: [
      {
        name: "Caldaie a pellet",
        url: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
      },
      {
        name: "Caldaie",
        url: "riscaldamento/caldaie-a-pellet",
      },
      {
        name: "Riscaldamento",
        url: "riscaldamento",
      },
    ],
  };

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
        fullSlug: "riscaldamento",
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
        fullSlug: "riscaldamento",
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
        fullSlug: "riscaldamento/caldaie-a-pellet",
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
        fullSlug: "riscaldamento/caldaie-a-pellet",
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
        fullSlug: "riscaldamento/caldaie-a-pellet",
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
        fullSlug: "riscaldamento/caldaie-a-pellet",
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
        fullSlug:
          "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
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
        fullSlug:
          "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
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
        fullSlug:
          "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
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
        fullSlug:
          "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
        count: {
          end: 1,
          start: 1,
          total: 1,
        },
      },
    ],
    productsPages: [
      {
        ...dummyProduct,
        slug: "riscaldamento/test-product",
      },
      {
        ...dummyProduct,
        slug: "test-product",
      },
      {
        ...secondDummyProduct,
        slug: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/test-product-2",
      },
      {
        ...secondDummyProduct,
        slug: "riscaldamento/caldaie-a-pellet/test-product-2",
      },
      {
        ...secondDummyProduct,
        slug: "riscaldamento/test-product-2",
      },
      {
        ...secondDummyProduct,
        slug: "caldaie-a-pellet-caldaie-a-pellet/test-product-2",
      },
      {
        ...secondDummyProduct,
        slug: "caldaie-a-pellet/test-product-2",
      },
      {
        ...secondDummyProduct,
        slug: "test-product-2",
      },
    ],
  });
});
