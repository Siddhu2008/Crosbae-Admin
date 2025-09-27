"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export const hsnSchema = z.object({
  item_code: z.string().min(1, { message: "Item code is required" }),
  item_name: z.string().min(1, { message: "Item name is required" }),
  item_type: z.string().min(1, { message: "Item type is required" }),
  GSTe: z.string().min(1, { message: "GSTe is required" }),
  hsn_code: z.string().min(1, { message: "HSN code is required" }),
  GST: z.string().min(1, { message: "GST is required" }),
});

export type HsnFormValues = z.infer<typeof hsnSchema>;

interface HsnFormProps extends React.HTMLAttributes<HTMLDivElement> {
  hsn?: {
    id: number;
    item_code: string;
    item_name: string;
    item_type: string;
    GSTe: string;
    hsn_code: string;
    GST: string;
  };
  onSubmit: (data: HsnFormValues) => void;
  onCancel?: () => void;
}

export function HsnForm({
  hsn,
  onSubmit,
  onCancel,
  className,
  ...props
}: HsnFormProps) {
  const form = useForm<HsnFormValues>({
    resolver: zodResolver(hsnSchema),
    defaultValues: {
      item_code: hsn?.item_code ?? "",
      item_name: hsn?.item_name ?? "",
      item_type: hsn?.item_type ?? "",
      GSTe: hsn?.GSTe ?? "",
      hsn_code: hsn?.hsn_code ?? "",
      GST: hsn?.GST ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // ✅ Reset form when `hsn` changes
  React.useEffect(() => {
    if (hsn) {
      form.reset({
        item_code: hsn.item_code ?? "",
        item_name: hsn.item_name ?? "",
        item_type: hsn.item_type ?? "",
        GSTe: hsn.GSTe ?? "",
        hsn_code: hsn.hsn_code ?? "",
        GST: hsn.GST ?? "",
      });
    }
  }, [hsn]);

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="item_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="item_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="item_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="GSTe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GSTe</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GSTe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hsn_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSN Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter HSN code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="GST"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST</FormLabel>
                <FormControl>
                  <Input placeholder="Enter GST" {...field} />
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
              {hsn ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
