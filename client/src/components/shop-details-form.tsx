import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShopDetails, shopDetailsSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Store } from "lucide-react";

interface ShopDetailsFormProps {
  shopDetails: ShopDetails;
  onSave: (details: ShopDetails) => void;
}

export default function ShopDetailsForm({ shopDetails, onSave }: ShopDetailsFormProps) {
  const form = useForm<ShopDetails>({
    resolver: zodResolver(shopDetailsSchema),
    defaultValues: shopDetails,
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSave(data);
  });

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Store className="mr-2 h-5 w-5" /> Shop Details
      </h2>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Shop Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Shop Address" 
                    className="resize-none" 
                    rows={2} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST/Tax Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="GST/Tax Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            Save Shop Details
          </Button>
        </form>
      </Form>
    </div>
  );
}
