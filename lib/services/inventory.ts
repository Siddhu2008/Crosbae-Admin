import api from "@/lib/api";

// Inventory API
export const inventoryAPI = {
  getProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/products/", { params })
    return response.data
  },

  getProduct: async (id: number) => {
    const response = await api.get(`/v1/inventory/products/${id}/`)
    return response.data
  },

  createProduct: async (data: any) => {
    const response = await api.post("/v1/inventory/products/", data)
    return response.data
  },

  updateProduct: async (id: number, data: any) => {
    const response = await api.put(`/v1/inventory/products/${id}/`, data)
    return response.data
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete(`/v1/inventory/products/${id}/`)
    return response.data
  },

  bulkUploadProducts: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post("/v1/inventory/products/bulk-upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  exportProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/products/export/", {
      params,
      responseType: "blob",
    })
    return response.data
  },

  getCategories: async () => {
    const response = await api.get("/v1/inventory/categories/")
    return response.data
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post("/v1/inventory/categories/", data)
    return response.data
  },

  getBrands: async () => {
    const response = await api.get("/v1/inventory/brands/")
    return response.data
  },

  createBrand: async (data: FormData) => {
    const response = await api.post("/v1/inventory/brands/", data)
    return response.data
  },

  updateBrand: async (id: number, data: FormData) => {
    const response = await api.put(`/v1/inventory/brands/${id}/`, data)
    return response.data
  },

  getMetalTypes: async () => {
    const response = await api.get("/v1/inventory/metal-types/")
    return response.data
  },

  createMetalType: async (data: { name: string; purity?: string }) => {
    const response = await api.post("/v1/inventory/metal-types/", data)
    return response.data
  },

  getStoneTypes: async () => {
    const response = await api.get("/v1/inventory/stone-types/")
    return response.data
  },

  createStoneType: async (data: { name: string; quality?: string }) => {
    const response = await api.post("/v1/inventory/stone-types/", data)
    return response.data
  },

  getCertifications: async () => {
    const response = await api.get("/v1/inventory/certifications/")
    return response.data
  },

  createCertification: async (data: { name: string; authority?: string }) => {
    const response = await api.post("/v1/inventory/certifications/", data)
    return response.data
  },

  uploadProductImages: async (productId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("image_file", file); // no []
  });

  const response = await api.post(
    `/v1/inventory/products/${productId}/images/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
},

  getProductImages: async (productId: number) => {
    const response = await api.get(`/v1/inventory/products/${productId}/images/`)
    return response.data
  },
}


