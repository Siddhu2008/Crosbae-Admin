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
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

export const stoneSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  image: z.any().optional(),
});

export type StoneFormValues = z.infer<typeof stoneSchema>;

interface StoneFormProps {
  stone?: {
    id: number;
    stone_name: string;
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
  const [image, setImage] = React.useState<File | null>(null);
  const form = useForm<StoneFormValues>({
    resolver: zodResolver(stoneSchema),
    defaultValues: {
      name: stone?.stone_name ?? "",
      image: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const handleFormSubmit = (values: StoneFormValues) => {
    // Always use FormData for backend compatibility
    const formData = new FormData();
    formData.append("stone_name", values.name);
    if (image) {
      formData.append("image", image);
    }
    onSubmit(formData);
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
          <div>
            <Label htmlFor="stone-image">Image</Label>
            <Input
              id="stone-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </div>

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
