import api from "@/lib/api";
import type { Coupon } from "@/types/coupon";

type CouponPayload = {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  max_uses?: number;
  is_active?: boolean;
  start_date: string;         
  end_date: string;
};

// Coupons
export const couponsAPI = {
  getCoupons: async (params?: Record<string, any>): Promise<{ results: Coupon[] }> => {
    const response = await api.get("/coupons/", { params });
    return response.data;
  },

  getCoupon: async (id: number): Promise<Coupon> => {
    const response = await api.get(`/coupons/${id}/`);
    return response.data;
  },

  createCoupon: async (data: CouponPayload): Promise<Coupon> => {
    const response = await api.post("/coupons/", data);
    return response.data;
  },

  updateCoupon: async (id: number, data: Partial<CouponPayload>): Promise<Coupon> => {
    const response = await api.patch(`/coupons/${id}/`, data);
    return response.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}/`);
  },

};
