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

export const puritySchema = z.object({
  name: z.string().min(1, { message: "Purity name is required" }),
  description: z.string().optional(),
});

export type PurityFormValues = z.infer<typeof puritySchema>;

interface PurityFormProps extends React.HTMLAttributes<HTMLDivElement> {
  purity?: {
    id: number;
    name: string;
    description?: string;
  };
  onSubmit: (data: PurityFormValues) => void;
  onCancel?: () => void;
}

export function PurityForm({
  purity,
  onSubmit,
  onCancel,
  className,
  ...props
}: PurityFormProps) {
  const form = useForm<PurityFormValues>({
    resolver: zodResolver(puritySchema),
    defaultValues: {
      name: purity?.name ?? "",
      description: purity?.description ?? "",
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 18K, 22K" {...field} />
                </FormControl>
                <FormDescription>Name of the purity (e.g. 18K, 22K)</FormDescription>
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
                  <Input placeholder="Description (optional)" {...field} />
                </FormControl>
                <FormDescription>Optional description for purity</FormDescription>
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
              {purity ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
