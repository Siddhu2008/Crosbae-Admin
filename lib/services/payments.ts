import api from "@/lib/api";
// Payments
// Payments API
export const paymentsAPI = {
  getPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/payments/", { params })
    return response.data
  },

  exportPayments: async (params?: Record<string, any>) => {
    const response = await api.get("/payments/export/", {
      params,
      responseType: "blob",
    })

    // Create download link
    const url = window.URL.createObjectURL(response.data)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `payments-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return response.data
  },

  // Razorpay placeholder
  processRazorpayPayment: async (paymentData: any) => {
    console.log("Razorpay integration needed - replace this with actual implementation")
    throw new Error("Razorpay integration not implemented")
  },
}