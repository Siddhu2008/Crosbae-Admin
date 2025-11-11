import api from "@/lib/api";
// Orders

export const ordersAPI = {
  getOrders: async (params?: Record<string, any>) => {
    const response = await api.get("/admin/orders/", { params })
    return response.data
  },

  getOrder: async (uuid: string) => {
    const response = await api.get(`/admin/orders/${uuid}/`)
    return response.data
  },

  updateOrderStatus: async (uuid: string, status: string) => {
    const response = await api.patch(`/admin/orders/${uuid}/`, { status })
    return response.data
  },
}