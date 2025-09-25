"use client"

import { useState, useEffect  } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code must be less than 20 characters"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().min(0, "Discount value must be positive"),
  min_order_amount: z.number().min(0, "Minimum order amount must be positive").optional(),
  max_discount_amount: z.number().min(0, "Maximum discount amount must be positive").optional(),
  start_date: z.date(),
  end_date: z.date(),
  max_uses: z.number().min(1, "Maximum uses must be at least 1").optional(),
  is_active: z.boolean(),
})

export type CouponFormValues = {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  start_date: string; // ISO string
  end_date: string;   // ISO string
  is_active: boolean;
};

type CouponFormData = z.infer<typeof couponSchema>

interface CouponFormProps {
  coupon?: any
  onSubmit: (data: CouponFormData) => Promise<void>
  onCancel: () => void
}

export function CouponForm({ coupon, onSubmit, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || "",
      description: coupon?.description || "",
      discount_type: coupon?.discount_type || "percentage",
      discount_value: coupon?.discount_value ?? undefined,
      min_order_amount: coupon?.min_order_amount || undefined,
      max_discount_amount: coupon?.max_discount_amount || undefined,
      start_date: coupon?.start_date ? new Date(coupon.start_date) : new Date(),
      end_date: coupon?.end_date ? new Date(coupon.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_uses: coupon?.max_uses || undefined,
      is_active: coupon?.is_active ?? true,
    },
  })

  const handleSubmit = async (data: CouponFormData) => {
  setLoading(true)
  try {
    await onSubmit(data) // no formatting
  } finally {
    setLoading(false)
  }
}


  const discountType = form.watch("discount_type")

  return (
   <Card className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <CardHeader>
        <CardTitle>{coupon ? "Edit Coupon" : "Create New Coupon"}</CardTitle>
        <CardDescription>
          {coupon ? "Update coupon information" : "Create a new discount coupon for customers"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input placeholder="SAVE20" {...field} className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this coupon is for..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">Enable or disable this coupon</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Discount Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value {discountType === "percentage" ? "(%)" : "(₹)"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={discountType === "percentage" ? "20" : "500"}
                          value={field.value === undefined || field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, "");
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_order_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {discountType === "percentage" && (
                  <FormField
                    control={form.control}
                    name="max_discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Discount Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="5000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Validity & Usage */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Validity & Usage</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <span className="text-xs text-muted-foreground mb-1">Select when the coupon becomes active.</span>
                      <Popover>
                        <PopoverTrigger>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-[9999] border-2 border-red-500" align="start">
                          <div style={{zIndex: 9999, position: 'relative'}}>
                            <Calendar
                              mode="single"
                              selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                              className="border-2 m-3 border-blue-500"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <span className="text-xs text-muted-foreground mb-1">Select when the coupon expires.</span>
                      <Popover>
                        <PopoverTrigger>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
      
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                  control={form.control}
                  name="max_uses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          value={field.value === undefined || field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, "");
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-3 sm:space-y-0 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
