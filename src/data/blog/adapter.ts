import type { Category } from '../types';

export async function getPostsInCategory(
  category: Pick<Category, 'id'>,
  pageLimit = 100,
  page = 1,
): Promise<any[]> {
  const USER_KEY = import.meta.env.REST_USER;
  const USER_SECRET = import.meta.env.REST_PASSWORD;
  const WORDPRESS_URL = 'https://api.pieroni.it/wp-json/wp/v2';
  const auth = Buffer.from(`${USER_KEY}:${USER_SECRET}`).toString('base64');

  console.log({ USER_KEY, USER_SECRET });

  const posts: any[] = [];

  while (true) {
    const response = await fetch(
      `${WORDPRESS_URL}/posts?categories=${category.id}&per_page=${pageLimit}&page=${page}&status=publish`,
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

    const pagePosts = await response.json();
    if (pagePosts.length === 0) {
      break;
    }

    posts.push(...pagePosts);

    if (pagePosts.length < pageLimit) {
      break;
    }

    page++;
  }

  return posts;
}

export async function getMedia(id: string) {
  const USER_KEY = import.meta.env.REST_USER;
  const USER_SECRET = import.meta.env.REST_PASSWORD;
  const WORDPRESS_URL = 'https://api.pieroni.it/wp-json/wp/v2';

  const auth = Buffer.from(`${USER_KEY}:${USER_SECRET}`).toString('base64');

  try {
    const mediaResponse = await fetch(
      `${WORDPRESS_URL}/media/${id}?_fields=source_url,alt_text`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      return {
        src: media.source_url,
        alt: media.alt_text,
      };
    }
  } catch (err) {
    // Ignore errors
  }
}
