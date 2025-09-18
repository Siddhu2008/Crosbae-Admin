// types/category.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: number | null; // parent id (if any)
  image?: string | null; // the R2 key stored in model (backend)
  image_url?: string | null; // public URL constructed by serializer
  created_at: string;
  updated_at: string;
}
