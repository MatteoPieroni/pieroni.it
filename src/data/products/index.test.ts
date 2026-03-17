import { expect, test } from "vitest";

import type {
  Category,
  DbProduct,
  DbCategoryProduct,
  ProductPageData,
  DbCategory,
} from "../types";
import { getAllCategories } from ".";

const dummyProductForCategory = {
  name: "test product 2",
  featuredImage: {
    alt: "",
    url: "",
  },
  fullSlug: `riscaldamento/test-product`,
} satisfies DbCategoryProduct;

const baseCategory = {
  featured_image: null,
  parent: null,
};
const mockCategories = [
  {
    id: 24,
    ...baseCategory,
    name: "Riscaldamento",
    slug: "riscaldamento",
    count: 2,
    fullSlug: "riscaldamento",
    breadcrumbs: [
      {
        label: "Riscaldamento",
        url: "riscaldamento",
      },
    ],
    products: [
      { ...dummyProductForCategory, name: "test product 1" },
      dummyProductForCategory,
    ],
  },
  {
    id: 35,
    ...baseCategory,
    name: "Caldaie",
    slug: "caldaie-a-pellet",
    count: 1,
    fullSlug: "riscaldamento/caldaie-a-pellet",
    breadcrumbs: [],
    products: [dummyProductForCategory],
    parent: 24,
  },
  {
    id: 406,
    ...baseCategory,
    name: "Caldaie a pellet",
    slug: "caldaie-a-pellet-caldaie-a-pellet",
    count: 1,
    fullSlug:
      "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet",
    breadcrumbs: [],
    products: [dummyProductForCategory],
    parent: 35,
  },
] satisfies DbCategory[];

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

const dummyProduct = {
  ...baseProduct,
  title: "test product",
  slug: "test-product",
  breadcrumbs: [
    {
      label: "Riscaldamento",
      url: "riscaldamento",
    },
  ],
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
    () => new Promise((res) => res(mockCategories)),
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
    breadcrumbs: [],
    title: "test product 2",
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
        breadcrumbs: [
          {
            label: "Riscaldamento",
            url: "riscaldamento",
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
        breadcrumbs: [
          {
            label: "Riscaldamento",
            url: "riscaldamento",
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
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
        breadcrumbs: [],
      },
    ],
    // productsPages: [
    //   {
    //     ...dummyProduct,
    //     slug: "riscaldamento/test-product",
    //   },
    //   {
    //     ...dummyProduct,
    //     slug: "test-product",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "riscaldamento/caldaie-a-pellet/caldaie-a-pellet-caldaie-a-pellet/test-product-2",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "riscaldamento/caldaie-a-pellet/test-product-2",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "riscaldamento/test-product-2",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "caldaie-a-pellet-caldaie-a-pellet/test-product-2",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "caldaie-a-pellet/test-product-2",
    //   },
    //   {
    //     ...secondDummyProduct,
    //     slug: "test-product-2",
    //   },
    // ],
  });
});
