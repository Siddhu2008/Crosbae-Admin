import api from "@/lib/api";
// Purities
export const puritiesAPI = {
  getPurities: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/purities/", { params });
    return response.data.results ?? response.data;
  },
  getPurity: async (id: number) => {
    const response = await api.get(`/v1/inventory/purities/${id}/`);
    return response.data;
  },
  createPurity: async (data: any) => {
    const response = await api.post("/v1/inventory/purities/", data);
    return response.data;
  },
  updatePurity: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/purities/${id}/`, data);
    return response.data;
  },
  deletePurity: async (id: number) => {
    const response = await api.delete(`/v1/inventory/purities/${id}/`);
    return response.data;
  },
};
