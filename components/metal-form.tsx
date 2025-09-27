"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { PurityForm } from "@/components/purity-form";
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
  purity: z.string().min(1, { message: "Purity is required" }),
  // add other fields as needed, e.g. metal type, description, etc.
});

export type MetalFormValues = z.infer<typeof metalSchema>;

export function MetalForm({
  metal,
  purities = [],
  onAddPurity,
  onSubmit,
  onCancel,
  className,
  ...props
}: MetalFormProps) {
  const [purityDialogOpen, setPurityDialogOpen] = React.useState(false);
  const form = useForm<MetalFormValues>({
    resolver: zodResolver(metalSchema),
    defaultValues: {
      name: metal?.name ?? "",
      purity: metal?.purity ?? (purities.length > 0 ? purities[0].id.toString() : ""),
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Ensure purity is sent as a number in payload
  const handleSubmit = (values: MetalFormValues) => {
    const purityId = values.purity ? Number(values.purity) : (purities.length > 0 ? purities[0].id : undefined);
    const payload = {
      metal_name: values.name,
      purity: purityId,
    };
    onSubmit(payload);
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                <div className="flex gap-2 items-center">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select purity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purities.map((p) => (
                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={purityDialogOpen} onOpenChange={setPurityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">Add Purity</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <PurityForm
                        onSubmit={data => {
                          onAddPurity?.(data);
                          setPurityDialogOpen(false);
                        }}
                        onCancel={() => setPurityDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <FormDescription>Select purity or add new</FormDescription>
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
