"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

export const notificationSchema = z.object({
  customer: z.string().min(1, { message: "Customer is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  is_read: z.boolean().optional(),
  related_id: z.string().optional(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

interface NotificationFormProps {
  customers: { id: string; name: string }[];
  notification?: Partial<NotificationFormValues>;
  onSubmit: (data: NotificationFormValues) => void;
  onCancel?: () => void;
  className?: string;
}

export function NotificationForm({
  customers,
  notification,
  onSubmit,
  onCancel,
  className,
  ...props
}: NotificationFormProps) {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      customer: notification?.customer ?? "",
      title: notification?.title ?? "",
      message: notification?.message ?? "",
      type: notification?.type ?? "",
      is_read: notification?.is_read ?? false,
      related_id: notification?.related_id ?? "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="customer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <div className="flex gap-2 items-center">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={customers.length ? "Select customer" : "No customers found"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.length === 0 ? (
                        <div className="px-4 py-2 text-muted-foreground">No customers available</div>
                      ) : (
                        customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">Add Customer</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Customer</DialogTitle>
                      </DialogHeader>
                      {/* TODO: Add your customer form here */}
                      <div className="text-muted-foreground">Customer form goes here.</div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input placeholder="Enter message" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_read"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Is Read</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="related_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter related id" {...field} />
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
              {notification ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
