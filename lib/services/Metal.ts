import api from "@/lib/api";
// Metal Types
export const metalTypesAPI = {
  getMetalTypes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/metal-types/", { params });
    return response.data.results ?? response.data;
  },
  getMetalType: async (id: number) => {
    const response = await api.get(`/v1/inventory/metal-types/${id}/`);
    return response.data;
  },
  createMetalType: async (data: any) => {
    const response = await api.post("/v1/inventory/metal-types/", data);
    return response.data;
  },
  updateMetalType: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/metal-types/${id}/`, data);
    return response.data;
  },
  deleteMetalType: async (id: number) => {
    const response = await api.delete(`/v1/inventory/metal-types/${id}/`);
    return response.data;
  },
};