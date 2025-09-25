export interface Brand {
  id: number;
  name: string;
  tagline?: string | null;
  since?: string | null;
  types?: string | null;
  origin?: string | null;
  description?: string | null;
  logo_url?: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}