import api from "@/lib/api";

// Shipping
// Shipping API
export const shippingAPI = {
  getShipments: async (params?: Record<string, any>) => {
    const response = await api.get("/shipping/", { params })
    return response.data
  },

  createShipment: async (data: any) => {
    const response = await api.post("/shipping/", data)
    return response.data
  },

  updateShipment: async (id: number, data: any) => {
    const response = await api.put(`/shipping/${id}/`, data)
    return response.data
  },

  // Courier integration placeholder
  createShipmentWithCourier: async (shipmentData: any) => {
    console.log("Courier integration needed - replace this with actual implementation")
    throw new Error("Courier integration not implemented")
  },

  trackShipment: async (awbNumber: string) => {
    console.log("Tracking integration needed - replace this with actual implementation")
    throw new Error("Tracking integration not implemented")
  },
}

