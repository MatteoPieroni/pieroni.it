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

export type PageProps = PropsWithBreadcrumbs & PropsWithSEO;

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
