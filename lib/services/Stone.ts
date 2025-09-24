import api from "@/lib/api";

// Stone Types
export const stoneTypesAPI = {
  getStoneTypes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/stone-types/", { params });
    return response.data.results ?? response.data;
  },
  getStoneType: async (id: number) => {
    const response = await api.get(`/v1/inventory/stone-types/${id}/`);
    return response.data;
  },
  createStoneType: async (data: any) => {
    const response = await api.post("/v1/inventory/stone-types/", data);
    return response.data;
  },
  updateStoneType: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/stone-types/${id}/`, data);
    return response.data;
  },
  deleteStoneType: async (id: number) => {
    const response = await api.delete(`/v1/inventory/stone-types/${id}/`);
    return response.data;
  },
};