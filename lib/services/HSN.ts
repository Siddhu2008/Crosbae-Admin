import api from "@/lib/api";
// HSN Codes
export const hsncodesAPI = {
  getHSNCodes: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/hscodes/", { params });
    return response.data.results ?? response.data;
  },
  getHSNCode: async (id: number) => {
    const response = await api.get(`/v1/inventory/hscodes/${id}/`);
    return response.data;
  },
  createHSNCode: async (data: any) => {
    const response = await api.post("/v1/inventory/hscodes/", data);
    return response.data;
  },
  updateHSNCode: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/hscodes/${id}/`, data);
    return response.data;
  },
  deleteHSNCode: async (id: number) => {
    const response = await api.delete(`/v1/inventory/hscodes/${id}/`);
    return response.data;
  },
};