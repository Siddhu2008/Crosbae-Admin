import api from "@/lib/api";
// Customers
export const customersAPI = {
  getCustomers: async (params?: Record<string, any>) => {
    const response = await api.get("/v1/inventory/customers/", { params });
    return response.data.results ?? response.data;
  },
  getCustomer: async (id: string | number) => {
    const response = await api.get(`/v1/inventory/customers/${id}/`);
    return response.data;
  },
  createCustomer: async (data: any) => {
    const response = await api.post("/v1/inventory/customers/", data);
    return response.data;
  },
  updateCustomer: async (id: string | number, data: any) => {
    const response = await api.patch(`/v1/inventory/customers/${id}/`, data);
    return response.data;
  },
  deleteCustomer: async (id: string | number) => {
    const response = await api.delete(`/v1/inventory/customers/${id}/`);
    return response.data;
  },
};