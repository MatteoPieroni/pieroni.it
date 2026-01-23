import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const USER_KEY = import.meta.env.USER_KEY;
const USER_SECRET = import.meta.env.USER_SECRET;
const WOOCOMMERCE_URL = 'https://www.pieroni.it/wp-json/wc/v3';

export const GET: APIRoute = async () => {
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
      };
    }

    // Build hierarchical structure
    const categoryTree = rootCategories.map(buildCategoryTree);

    // Write to file
    try {
      const dataDir = join(process.cwd(), 'src', 'data', 'products');
      await mkdir(dataDir, { recursive: true });
      const filePath = join(dataDir, 'categories.json');
      await writeFile(filePath, JSON.stringify(categoryTree, null, 2), 'utf-8');
    } catch (fileError) {
      console.error('Error writing categories file:', fileError);
      // Continue even if file write fails
    }

    return new Response(JSON.stringify(categoryTree, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
};
