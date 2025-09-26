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
  value: z.string().min(1, { message: "Purity is required" }),
  // optionally add description or note
});

export type PurityFormValues = z.infer<typeof puritySchema>;

interface PurityFormProps extends React.HTMLAttributes<HTMLDivElement> {
  purity?: {
    id: number;
    value: string;
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
      value: purity?.value ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purity Value</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 18K, 22K" {...field} />
                </FormControl>
                <FormDescription>The purity value</FormDescription>
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
