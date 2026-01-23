export type Category = {
  id: number;
  name: string;
  slug: string;
  children: Category[];
};

interface ProductImage {
  src: string;
  alt?: string;
}

interface ProductAttribute {
  name: string;
  slug?: string;
  options: string[];
  visible?: boolean;
}

interface ProductCategory {
  name: string;
  slug?: string;
}

export interface Product {
  title: string;
  images?: {
    featured?: ProductImage;
    gallery?: ProductImage[];
  };
  description?: string;
  fullDescription?: string;
  attributes?: ProductAttribute[];
  categories?: ProductCategory[];
}
