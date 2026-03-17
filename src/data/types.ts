type Media = {
  alt: string;
  url: string;
};

type Breadcrumb = {
  url: string;
  label: string;
};

export type DbCategoryProduct = {
  name: string;
  fullSlug: string;
  featuredImage: Media;
};
export type DbCategory = {
  id: number;
  name: string;
  slug: string;
  featuredImage?: Media | null;
  count: number;
  fullSlug: string;
  breadcrumbs: (Breadcrumb | null)[];
  parent?: number | null;
  products: DbCategoryProduct[];
};

type DbProductCategory = Pick<
  DbCategory,
  "breadcrumbs" | "fullSlug" | "name" | "slug"
>;
export type DbProduct = {
  id: number;
  name: string;
  slug: string;
  fullSlug: string;
  description: string;
  fullDescription: string;
  featuredImage: Media;
  images: Media[] | null;
  mainCategory: DbProductCategory;
  categories: DbProductCategory[];
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
  fullSlug: string;
  title: string;
  products: DbCategoryProduct[];
  subCategories?: SubCategory[];
  breadcrumbs: Breadcrumb[];

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

export type ProductPageData = {
  title: string;
  slug: string;
  fullSlug: string;
  featuredImage: Media;
  images: Media[] | null;
  description: string;
  fullDescription: {};
  formats: string | null;
  brand: string | null;
  breadcrumbs: Breadcrumb[];
  categories: {
    name: string;
    url: string;
  }[];
};
