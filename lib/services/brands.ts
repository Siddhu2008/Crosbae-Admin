// Brands
import api from "@/lib/api";

// type BrandCreatePayload = {
//   name: string;
//   description?: string;
//   website?: string;
//   is_active?: boolean;
//   logo?: File | null;
// };


export const brandsAPI = {
  getBrands: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/brands/", { params });
    return response.data.results ?? response.data;
  },
  getBrand: async (id: number) => {
    const response = await api.get(`/v1/inventory/brands/${id}/`);
    return response.data;
  },
  createBrand: async (data: Record<string, any> | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData()
            if (data.name) fd.append("name", data.name)
            if (data.description) fd.append("description", data.description)
            if (data.website) fd.append("website", data.website)
            if (data.is_active !== undefined) fd.append("is_active", String(data.is_active))
            if (data.logo) fd.append("logo", data.logo)
            return fd
          })()

    const response = await api.post("/v1/inventory/brands/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
  updateBrand: async (id: number, data: Partial<Record<string, any>> | FormData) => {
    const formData =
      data instanceof FormData
        ? data
        : (() => {
            const fd = new FormData()
            if (data.name) fd.append("name", data.name)
            if (data.description) fd.append("description", data.description)
            if (data.website) fd.append("website", data.website)
            if (data.is_active !== undefined) fd.append("is_active", String(data.is_active))
            if ((data as any).logo) fd.append("logo", (data as any).logo)
            return fd
          })()

    const response = await api.patch(`/v1/inventory/brands/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/v1/inventory/brands/${id}/`);
    return response.data;
  },
};