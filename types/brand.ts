// types/brand.ts
export interface Brand {
  id: number;
  name: string;
  description?: string | null;
  website?: string | null;
  is_active: boolean;
  logo?: string | null;       // The logo URL or key (depending on backend)
  created_at: string;
  updated_at?: string;
}
