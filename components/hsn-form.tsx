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
  code: z
    .string()
    .min(1, { message: "HSN code is required" }),
  description: z.string().optional(),
});

export type HsnFormValues = z.infer<typeof hsnSchema>;

interface HsnFormProps extends React.HTMLAttributes<HTMLDivElement> {
  hsn?: {
    id: number;
    code: string;
    description?: string;
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
      code: hsn?.code ?? "",
      description: hsn?.description ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSN Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter HSN code" {...field} />
                </FormControl>
                <FormDescription>
                  Harmonized System of Nomenclature code
                </FormDescription>
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
                  <Input placeholder="Optional description" {...field} />
                </FormControl>
                <FormDescription>
                  Additional description or notes
                </FormDescription>
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
