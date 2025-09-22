// lib/services/v1/inventory.ts
import api from "@/lib/api";

type CategoryCreatePayload = {
  name: string;
  parent?: number;
  image_file?: File | null;
};

type BrandCreatePayload = {
  name: string;
  description?: string;
  website?: string;
  is_active?: boolean;
  logo?: File | null;
};

export const inventoryAPI = {
  // ===== Categories =====
  getCategories: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/categories/", { params });
    return response.data.results;
  },

  getCategory: async (slug: string) => {
    const response = await api.get(`/v1/inventory/categories/${slug}/`);
    return response.data;
  },

  createCategory: async (data: CategoryCreatePayload | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            fd.append("name", data.name);
            if (data.parent) fd.append("parent", String(data.parent));
            if (data.image_file) fd.append("image_file", data.image_file);
            return fd;
          })();

    const response = await api.post("/v1/inventory/categories/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCategory: async (
    slug: string,
    data: Partial<CategoryCreatePayload> | FormData
  ) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            if (data.name) fd.append("name", data.name);
            if (data.parent !== undefined)
              fd.append("parent", String(data.parent));
            if (data.image_file) fd.append("image_file", data.image_file);
            return fd;
          })();

    const response = await api.patch(`/v1/inventory/categories/${slug}/`, formData);
    return response.data;
  },

  deleteCategory: async (slug: string) => {
    const response = await api.delete(`/v1/inventory/categories/${slug}/`);
    return response.data;
  },

  // ===== Brands =====
  getBrands: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/brands/", { params });
    return response.data.results;
  },

  getBrand: async (id: number) => {
    const response = await api.get(`/v1/inventory/brands/${id}/`);
    return response.data;
  },

  createBrand: async (data: BrandCreatePayload | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            fd.append("name", data.name);
            if (data.description) fd.append("description", data.description);
            if (data.website) fd.append("website", data.website);
            fd.append("is_active", String(data.is_active ?? true));
            if (data.logo) fd.append("logo", data.logo);
            return fd;
          })();

    const response = await api.post("/v1/inventory/brands/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateBrand: async (
    id: number,
    data: Partial<BrandCreatePayload> | FormData
  ) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData();
            if (data.name) fd.append("name", data.name);
            if (data.description) fd.append("description", data.description);
            if (data.website) fd.append("website", data.website);
            if (data.is_active !== undefined) {
              fd.append("is_active", String(data.is_active));
            }
            if (data.logo) fd.append("logo", data.logo);
            return fd;
          })();

    const response = await api.patch(`/v1/inventory/brands/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteBrand: async (id: number) => {
    const response = await api.delete(`/v1/inventory/brands/${id}/`);
    return response.data;
  },
};
