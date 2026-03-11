type Media = {
  id: number;
  alt: string;
  url: string;
};

export type DbCategory = {
  id: number;
  name: string;
  slug: string;
  featured_image: Media | null;
  count: number;
  fullSlug: string;
  level: number;
  breadcrumbs: ({
    url: string;
    label: string;
  } | null)[];
  parent:
    | number
    | {
        id: number;
      }
    | null;
};

export type DbProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  fullDescription: {};
  images: Media[] | null;
  mainCategory: DbCategory;
  categories: DbCategory[];
  formats: string | null;
  brand: string | null;
};

export type SubCategory = {
  url: string;
  name: string;
  count: number;
};

export type Category = Exclude<DbCategory, "parent"> & {
  subCategories?: SubCategory[];
};

export type CategoryPageData = {
  slug: string;
  baseSlug: string;
  title: string;
  products: ProductForCategory[];
  subCategories?: SubCategory[];

  count: {
    total: number;
    start: number;
    end: number;
  };
  pagination?:
    | {
        current: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      }
    | {
        current: PaginationPage;
        previous: PaginationPage;
        next: PaginationPage;
        first: PaginationPage;
        last: PaginationPage;
      };
};

type PaginationPage = {
  number: number;
  href: string;
};

export type ProductForCategory = {
  link: string;
  image?: Media | null;
  name: string;
};
