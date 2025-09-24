import api from "@/lib/api";

// Categories


type CategoryCreatePayload = {
  name: string;
  parent?: number;
  image_file?: File | null;
};


export const categoriesAPI = {
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
};

