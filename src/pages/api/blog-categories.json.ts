import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const WORDPRESS_URL = 'https://www.pieroni.it/wp-json/wp/v2';

export const GET: APIRoute = async () => {
  try {
    let allCategories: any[] = [];
    let page = 1;
    const perPage = 100;

    // Fetch all categories
    while (true) {
      const response = await fetch(
        `${WORDPRESS_URL}/categories?per_page=${perPage}&page=${page}&_fields=id,name,slug,count,parent`,
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
        children: children.map(buildCategoryTree),
      };
    }

    // Build hierarchical structure
    const categoryTree = rootCategories.map(buildCategoryTree);

    // Write to file
    try {
      const dataDir = join(process.cwd(), 'src', 'data', 'blog');
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
