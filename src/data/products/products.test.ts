import { describe, expect, test } from "vitest";

import { getProductPaths } from "./products";
import type { DbProduct } from "./db/types";
import type { ProductPageData } from "./types";

const dummyDbProduct = {
  id: 1,
  name: "test product",
  slug: "test-product",
  fullSlug: "riscaldamento/test-product",
  brand: "test-brand",
  featuredImage: {
    alt: "",
    url: "",
  },
  categories: [
    {
      name: "Riscaldamento",
      slug: "riscaldamento",
      fullSlug: "riscaldamento",
      breadcrumbs: [
        {
          label: "Riscaldamento",
          url: "riscaldamento",
        },
      ],
    },
  ],
  description: "test-description",
  formats: "test-format",
  fullDescription: "test-full-description",
  images: [],
  mainCategory: {
    name: "Riscaldamento",
    slug: "riscaldamento",
    fullSlug: "riscaldamento",
    breadcrumbs: [
      {
        label: "Riscaldamento",
        url: "riscaldamento",
      },
    ],
  },
} satisfies DbProduct;

const dummyProduct = {
  title: "test product",
  slug: "test-product",
  brand: "test-brand",
  categories: [
    {
      name: "Riscaldamento",
      url: "riscaldamento",
    },
  ],
  description: "test-description",
  formats: "test-format",
  fullDescription: "test-full-description",
  featuredImage: {
    alt: "",
    url: "",
  },
  images: [],
  breadcrumbs: [
    {
      label: "Riscaldamento",
      url: "riscaldamento",
    },
  ],
  fullSlug: "riscaldamento/test-product",
} satisfies ProductPageData;

/**
 * for a category
 *  for each product
 *    - generate product page with deepest ({long-slug}/{product-slug})
 *    - generate rewrite product slug to deepest ({product-slug} -> {long-slug}/{product-slug})
 *    - generate rewrite main slug to deepest ({slug}/{product-slug} -> {long-slug}/{product-slug})
 */
describe("generates product pages", () => {
  test("generates category product page and base product page", () => {
    const generatedProductPages = getProductPaths(dummyDbProduct);

    expect(generatedProductPages).toStrictEqual([
      {
        ...dummyProduct,
        slug: "riscaldamento/test-product",
      },
      {
        ...dummyProduct,
        slug: "test-product",
      },
    ]);
  });

  test("generates full category product page, main category page and product page", () => {
    const generatedProductPages = getProductPaths({
      ...dummyDbProduct,
      fullSlug: "riscaldamento/caldaie-a-pellet/test-product",
      categories: [
        {
          name: "Riscaldamento",
          slug: "riscaldamento",
          fullSlug: "riscaldamento",
          breadcrumbs: [
            {
              label: "Riscaldamento",
              url: "riscaldamento",
            },
          ],
        },
        {
          name: "Caldaie",
          slug: "caldaie-a-pellet",
          fullSlug: "riscaldamento/caldaie-a-pellet",
          breadcrumbs: [
            {
              label: "Riscaldamento",
              url: "riscaldamento",
            },
            {
              label: "Caldaie",
              url: "riscaldamento/caldaie-a-pellet",
            },
          ],
        },
      ],
      mainCategory: {
        name: "Caldaie",
        slug: "caldaie-a-pellet",
        fullSlug: "riscaldamento/caldaie-a-pellet",
        breadcrumbs: [
          {
            label: "Riscaldamento",
            url: "riscaldamento",
          },
          {
            label: "Caldaie",
            url: "riscaldamento/caldaie-a-pellet",
          },
        ],
      },
    });

    const deepDummyProduct = {
      ...dummyProduct,
      categories: [
        {
          name: "Riscaldamento",
          url: "riscaldamento",
        },
        {
          name: "Caldaie",
          url: "riscaldamento/caldaie-a-pellet",
        },
      ],
      fullSlug: "riscaldamento/caldaie-a-pellet/test-product",
      breadcrumbs: [
        {
          label: "Riscaldamento",
          url: "riscaldamento",
        },
        {
          label: "Caldaie",
          url: "riscaldamento/caldaie-a-pellet",
        },
      ],
    };

    expect(generatedProductPages).toStrictEqual([
      {
        ...deepDummyProduct,
        breadcrumbs: [
          {
            label: "Riscaldamento",
            url: "riscaldamento",
          },
        ],
        slug: "riscaldamento/test-product",
      },
      {
        ...deepDummyProduct,
        slug: "riscaldamento/caldaie-a-pellet/test-product",
      },
      {
        ...deepDummyProduct,
        slug: "caldaie-a-pellet/test-product",
      },
      {
        ...deepDummyProduct,
        slug: "test-product",
      },
    ]);
  });
});
