import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InventoryItem, inventoryItemSchema } from "@shared/schema";
import { storage, generateId, formatCurrency } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Pencil, Trash } from "lucide-react";

interface InventoryManagementProps {
  inventory: InventoryItem[];
  onInventoryChange: () => void;
  onEditItem: (item: InventoryItem) => void;
}

type FormValues = {
  name: string;
  price: string;
};

export default function InventoryManagement({ 
  inventory, 
  onInventoryChange,
  onEditItem 
}: InventoryManagementProps) {
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
      name: "",
      price: "",
    },
  });

  const handleAddItem = form.handleSubmit((data) => {
    const newItem: InventoryItem = {
      id: generateId(),
      name: data.name,
      price: parseFloat(data.price),
    };

    storage.addInventoryItem(newItem);
    onInventoryChange();
    form.reset();

    toast({
      title: "Item Added",
      description: `"${newItem.name}" added to inventory`,
    });
  });

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      storage.deleteInventoryItem(id);
      onInventoryChange();
      
      toast({
        title: "Item Deleted",
        description: `"${name}" has been removed from inventory`,
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Archive className="mr-2 h-5 w-5" /> Item Inventory
      </h2>
      
      {/* Add Item Form */}
      <Form {...form}>
        <form onSubmit={handleAddItem} className="mb-6 space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sugar" {...field} />
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
                      placeholder="0.00" 
                      className="pl-7"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" variant="secondary">
            Add Item to Inventory
          </Button>
        </form>
      </Form>
      
      {/* Inventory List */}
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 max-h-64 overflow-y-auto">
        <h3 className="font-medium text-sm text-slate-500 mb-2">Your Inventory</h3>
        
        {inventory.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            <Archive className="h-5 w-5 mx-auto mb-1" />
            <p className="text-sm">No items in inventory yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <ul className="divide-y divide-slate-200">
              {inventory.map((item) => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onEditItem(item)}
                      className="text-slate-400 hover:text-secondary p-1"
                      title="Edit Item"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="text-slate-400 hover:text-destructive p-1"
                      title="Delete Item"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
