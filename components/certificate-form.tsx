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
  description: z.string().optional(),
  image: z.any().optional(),
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;

interface CertificateFormProps extends React.HTMLAttributes<HTMLDivElement> {
  certificate?: {
    id: number;
    name: string;
    description?: string;
    image?: string;
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
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      name: certificate?.name ?? "",
      description: certificate?.description ?? "",
      image: certificate?.image ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => {
          onSubmit({
            ...data,
            image: imageFile || data.image || ""
          });
        })} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter certificate name" {...field} />
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
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files?.[0] ?? null)}
            />
            {imageFile && (
              <div className="mt-2">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-24 rounded" />
              </div>
            )}
          </div>

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
