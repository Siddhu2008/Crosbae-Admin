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

export const metalSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  purity: z.string().optional(),
  // add other fields as needed, e.g. metal type, description, etc.
});

export type MetalFormValues = z.infer<typeof metalSchema>;

interface MetalFormProps extends React.HTMLAttributes<HTMLDivElement> {
  metal?: {
    id: number;
    name: string;
    purity?: string;
  };
  onSubmit: (data: MetalFormValues) => void;
  onCancel?: () => void;
}

export function MetalForm({
  metal,
  onSubmit,
  onCancel,
  className,
  ...props
}: MetalFormProps) {
  const form = useForm<MetalFormValues>({
    resolver: zodResolver(metalSchema),
    defaultValues: {
      name: metal?.name ?? "",
      purity: metal?.purity ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter metal name" {...field} />
                </FormControl>
                <FormDescription>Name of the metal (e.g. Gold, Silver)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purity</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 18K, 22K" {...field} />
                </FormControl>
                <FormDescription>Optional: purity of the metal</FormDescription>
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
              {metal ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
