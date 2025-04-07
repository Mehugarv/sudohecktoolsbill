import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InventoryItem, inventoryItemSchema } from "@shared/schema";
import { storage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface EditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave: () => void;
}

type FormValues = {
  name: string;
  price: string;
};

export default function EditItemDialog({ 
  isOpen, 
  onClose, 
  item, 
  onSave 
}: EditItemDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(
      inventoryItemSchema
        .omit({ id: true })
        .extend({
          price: z.string().min(1, "Price is required").transform((val) => parseFloat(val)),
        })
    ),
    defaultValues: {
      name: item?.name || "",
      price: item?.price?.toString() || "",
    }
  });
  
  // Update form when item changes
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        price: item.price.toString(),
      });
    }
  }, [form, item]);
  
  const handleSubmit = form.handleSubmit((data) => {
    if (!item) return;
    
    const updatedItem: InventoryItem = {
      id: item.id,
      name: data.name,
      price: parseFloat(data.price),
    };
    
    storage.updateInventoryItem(updatedItem);
    onSave();
    
    toast({
      title: "Item Updated",
      description: `"${updatedItem.name}" has been updated`,
    });
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Per Item</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        $
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">Update Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
