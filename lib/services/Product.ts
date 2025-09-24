import api from "@/lib/api";

// Products
export const productsAPI = {
  getProducts: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/products/", { params });
    return response.data.results ?? response.data;
  },
  getProduct: async (id: number) => {
    const response = await api.get(`/v1/inventory/products/${id}/`);
    return response.data;
  },
  createProduct: async (data: any) => {
    const response = await api.post("/v1/inventory/products/", data);
    return response.data;
  },
  updateProduct: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/products/${id}/`, data);
    return response.data;
  },
  deleteProduct: async (id: number) => {
    const response = await api.delete(`/v1/inventory/products/${id}/`);
    return response.data;
  },
};