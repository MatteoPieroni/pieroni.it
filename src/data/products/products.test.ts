import { describe, expect, test } from "vitest";

import { getProductPaths } from "./products";
import type { DbProduct, ProductPageData } from "../types";

const dummyDbProduct = {
  id: 1,
  name: "test product",
  slug: "test-product",
  brand: "test-brand",
  categories: [
    {
      id: 24,
      name: "Riscaldamento",
      slug: "riscaldamento",
      count: 73,
      parent: null,
      featured_image: null,
      fullSlug: "riscaldamento",
      level: 0,
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
  fullDescription: {},
  images: [],
  mainCategory: {
    id: 24,
    name: "Riscaldamento",
    slug: "riscaldamento",
    count: 73,
    parent: null,
    featured_image: null,
    fullSlug: "riscaldamento",
    level: 0,
    breadcrumbs: [
      {
        label: "Riscaldamento",
        url: "riscaldamento",
      },
    ],
  },
} satisfies DbProduct;

const dummyProduct = {
  name: "test product",
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
  fullDescription: {},
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
      categories: [
        {
          id: 24,
          name: "Riscaldamento",
          slug: "riscaldamento",
          count: 73,
          parent: null,
          featured_image: null,
          fullSlug: "riscaldamento",
          level: 0,
          breadcrumbs: [
            {
              label: "Riscaldamento",
              url: "riscaldamento",
            },
          ],
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
        id: 35,
        name: "Caldaie",
        slug: "caldaie-a-pellet",
        count: 9,
        parent: 24,
        featured_image: null,
        level: 1,
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
