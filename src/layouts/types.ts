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
