

// You might already have a Coupon type in here, so just keep all coupon-related types together
export type Coupon = {
  id: number;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  // add other properties you use
};
