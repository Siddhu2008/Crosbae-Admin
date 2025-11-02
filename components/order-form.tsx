"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const statusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "returned"]),
});

export type StatusFormValues = z.infer<typeof statusSchema>;

interface EditOrderStatusFormProps extends React.HTMLAttributes<HTMLDivElement> {
  order?: { status: string } | null;
  onSubmit: (data: StatusFormValues) => void;
  onCancel?: () => void;
}

export function EditOrderStatusForm({ order, onSubmit, onCancel, className, ...props }: EditOrderStatusFormProps) {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: order?.status ?? "pending",
    },
  });

  // Reset form when order changes
  React.useEffect(() => {
    if (order) {
      form.reset({
        status: order.status ?? "pending",
      });
    }
  }, [order]);

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              Update Status
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
