import type { AstroIntegration } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { loadEnv } from 'vite';

const { USER_KEY } = loadEnv(process.env.USER_KEY || '', process.cwd(), '');
const { USER_SECRET } = loadEnv(
  process.env.USER_SECRET || '',
  process.cwd(),
  '',
);
const WOOCOMMERCE_URL = 'https://api.pieroni.it/wp-json/wc/v3';

const getShopCategories = async () => {
  try {
    const auth = Buffer.from(`${USER_KEY}:${USER_SECRET}`).toString('base64');
    let allCategories: any[] = [];
    let page = 1;
    const perPage = 100;

    // Fetch all categories
    while (true) {
      const response = await fetch(
        `${WOOCOMMERCE_URL}/products/categories?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json();
      if (categories.length === 0) {
        break;
      }

      allCategories = allCategories.concat(categories);

      if (categories.length < perPage) {
        break;
      }

      page++;
    }

    // Organize categories hierarchically
    const categoryMap = new Map<number, any[]>();
    const rootCategories: any[] = [];

    allCategories.forEach((cat) => {
      if (cat.parent === 0) {
        rootCategories.push(cat);
      } else {
        if (!categoryMap.has(cat.parent)) {
          categoryMap.set(cat.parent, []);
        }
        categoryMap.get(cat.parent)!.push(cat);
      }
    });

    // Helper function to build category tree
    function buildCategoryTree(category: any): any {
      const children = categoryMap.get(category.id) || [];
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.count,
        children: children.map(buildCategoryTree),
        image: {
          src: category.image?.src,
          alt: category.image?.alt,
        },
      };
    }

    // Build hierarchical structure
    const categoryTree = rootCategories.map(buildCategoryTree);

    // Write to file
    const dataDir = join(process.cwd(), 'src', 'data', 'products');
    await mkdir(dataDir, { recursive: true });
    const filePath = join(dataDir, 'categories.json');
    await writeFile(filePath, JSON.stringify(categoryTree, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed updating shop categories');
    throw error;
  }
};

const { REST_USER } = loadEnv(process.env.REST_USER || '', process.cwd(), '');
const { REST_PASSWORD } = loadEnv(
  process.env.REST_PASSWORD || '',
  process.cwd(),
  '',
);
const WORDPRESS_URL = 'https://api.pieroni.it/wp-json/wp/v2';

const getBlogCategories = async () => {
  const auth = Buffer.from(`${REST_USER}:${REST_PASSWORD}`).toString('base64');

  try {
    let allCategories: any[] = [];
    let page = 1;
    const perPage = 100;

    // Fetch all categories
    while (true) {
      const response = await fetch(
        `${WORDPRESS_URL}/categories?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        break;
      }

      const categories = await response.json();
      if (categories.length === 0) {
        break;
      }

      allCategories = allCategories.concat(categories);

      if (categories.length < perPage) {
        break;
      }

      page++;
    }

    // Organize categories hierarchically
    const categoryMap = new Map<number, any[]>();
    const rootCategories: any[] = [];

    allCategories.forEach((cat) => {
      if (cat.parent === 0) {
        rootCategories.push(cat);
      } else {
        if (!categoryMap.has(cat.parent)) {
          categoryMap.set(cat.parent, []);
        }
        categoryMap.get(cat.parent)!.push(cat);
      }
    });

    // Helper function to build category tree
    function buildCategoryTree(category: any): any {
      const children = categoryMap.get(category.id) || [];
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        count: category.count,
        description: category.description,
        children: children.map(buildCategoryTree),
      };
    }

    // Build hierarchical structure
    const categoryTree = rootCategories.map(buildCategoryTree);

    // Write to file
    const dataDir = join(process.cwd(), 'src', 'data', 'blog');
    await mkdir(dataDir, { recursive: true });
    const filePath = join(dataDir, 'categories.json');
    await writeFile(filePath, JSON.stringify(categoryTree, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed updating shop categories');
    throw error;
  }
};

export const categoriesFetcher: AstroIntegration = {
  name: 'getJson',
  hooks: {
    'astro:config:setup': async (options) => {
      if (options.command === 'build') {
        options.logger.info('Fetching shop categories');
        await getShopCategories();
        options.logger.info('Done fetching shop categories');
        options.logger.info('Fetching blog categories');
        await getBlogCategories();
        options.logger.info('Done fetching blog categories');
      }
    },
  },
};
