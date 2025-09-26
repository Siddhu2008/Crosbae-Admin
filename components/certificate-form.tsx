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

export const certificateSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  issuer: z.string().optional(),
  // you can add more: issue_date, validity, etc.
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;

interface CertificateFormProps extends React.HTMLAttributes<HTMLDivElement> {
  certificate?: {
    id: number;
    name: string;
    issuer?: string;
  };
  onSubmit: (data: CertificateFormValues) => void;
  onCancel?: () => void;
}

export function CertificateForm({
  certificate,
  onSubmit,
  onCancel,
  className,
  ...props
}: CertificateFormProps) {
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      name: certificate?.name ?? "",
      issuer: certificate?.issuer ?? "",
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
                <FormLabel>Certificate Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter certificate name" {...field} />
                </FormControl>
                <FormDescription>Name of certificate (e.g. GIA, IGI)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issuer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issuer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter issuer name (optional)" {...field} />
                </FormControl>
                <FormDescription>Optional: who issued this certificate</FormDescription>
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
              {certificate ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
