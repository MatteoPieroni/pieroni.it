export type PropsWithSEO = {
  title: string;
  description: string;
  canonicalUrl?: string;
};

type PropsWithBreadcrumbs = {
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
};

type PropsWithArticle = {
  article?: {
    title: string;
    description: string;
    url: string;
    canonicalUrl: string;
    image: string;
    categories: Array<{ name: string }>;
    createdAt: string;
    contentUpdatedAt: string;
  };
};

export type PageProps = PropsWithBreadcrumbs & PropsWithSEO & PropsWithArticle;

type SubCategory = {
  url: string;
  name: string;
  count: number;
};

type PaginationPage = {
  number: number;
  href: string;
};

export type CategoryPageProps = {
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
