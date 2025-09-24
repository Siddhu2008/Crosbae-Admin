import api from "@/lib/api";
// Certifications
export const certificationsAPI = {
  getCertifications: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/certifications/", { params });
    return response.data.results ?? response.data;
  },
  getCertification: async (id: number) => {
    const response = await api.get(`/v1/inventory/certifications/${id}/`);
    return response.data;
  },
  createCertification: async (data: any) => {
    const response = await api.post("/v1/inventory/certifications/", data);
    return response.data;
  },
  updateCertification: async (id: number, data: any) => {
    const response = await api.patch(`/v1/inventory/certifications/${id}/`, data);
    return response.data;
  },
  deleteCertification: async (id: number) => {
    const response = await api.delete(`/v1/inventory/certifications/${id}/`);
    return response.data;
  },
};