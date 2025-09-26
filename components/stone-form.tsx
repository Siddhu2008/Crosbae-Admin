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

export const stoneSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  // you can add more fields: type, color, carat, etc.
});

export type StoneFormValues = z.infer<typeof stoneSchema>;

interface StoneFormProps extends React.HTMLAttributes<HTMLDivElement> {
  stone?: {
    id: number;
    name: string;
    // other optional fields
  };
  onSubmit: (data: StoneFormValues) => void;
  onCancel?: () => void;
}

export function StoneForm({
  stone,
  onSubmit,
  onCancel,
  className,
  ...props
}: StoneFormProps) {
  const form = useForm<StoneFormValues>({
    resolver: zodResolver(stoneSchema),
    defaultValues: {
      name: stone?.name ?? "",
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
                <FormLabel>Stone Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter stone name" {...field} />
                </FormControl>
                <FormDescription>Name of the stone (e.g. Diamond, Ruby)</FormDescription>
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
              {stone ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
