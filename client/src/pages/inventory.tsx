import { useState, useEffect } from "react";
import { storage, generateId } from "../lib/storage";
import { InventoryItem, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Package, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Tag
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  
  // Dialog states
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  // Form states
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: "",
    description: "",
    price: 0,
    costPrice: 0,
    categoryId: "",
    isActive: true,
    isService: false,
    stockQuantity: 0,
    taxRate: 18,
    unit: ""
  });
  
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: "",
    color: "#a78bfa"
  });
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setInventory(storage.getInventory());
    setCategories(storage.getCategories());
  };

  const handleAddItem = () => {
    if (!itemForm.name || !itemForm.price) {
      toast({
        title: "Error adding item",
        description: "Name and price are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newItem: InventoryItem = {
        id: generateId(),
        name: itemForm.name || "",
        description: itemForm.description || "",
        price: Number(itemForm.price),
        categoryId: itemForm.categoryId || undefined,
        isActive: itemForm.isActive !== undefined ? itemForm.isActive : true,
        isService: itemForm.isService || false,
        stockQuantity: itemForm.stockQuantity !== undefined ? Number(itemForm.stockQuantity) : undefined,
        taxRate: itemForm.taxRate !== undefined ? Number(itemForm.taxRate) : 18,
        unit: itemForm.unit || undefined,
        costPrice: itemForm.costPrice !== undefined ? Number(itemForm.costPrice) : undefined,
      };

      storage.addInventoryItem(newItem);
      resetItemForm();
      setIsAddItemDialogOpen(false);
      refreshData();
      
      toast({
        title: "Item added",
        description: `${newItem.name} has been added to your inventory.`,
      });
    } catch (error) {
      toast({
        title: "Error adding item",
        description: "There was an error adding the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    
    try {
      storage.updateInventoryItem({
        ...selectedItem,
        ...itemForm
      });
      
      resetItemForm();
      setSelectedItem(null);
      setIsEditItemDialogOpen(false);
      refreshData();
      
      toast({
        title: "Item updated",
        description: `${selectedItem.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error updating item",
        description: "There was an error updating the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    try {
      storage.deleteInventoryItem(selectedItem.id);
      setSelectedItem(null);
      setIsDeleteItemDialogOpen(false);
      refreshData();
      
      toast({
        title: "Item deleted",
        description: `${selectedItem.name} has been removed from your inventory.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: "There was an error deleting the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) {
      toast({
        title: "Error adding category",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCategory: Category = {
        id: generateId(),
        name: categoryForm.name,
        color: categoryForm.color || "#a78bfa"
      };

      storage.addCategory(newCategory);
      setCategoryForm({ name: "", color: "#a78bfa" });
      setIsCategoryDialogOpen(false);
      refreshData();
      
      toast({
        title: "Category added",
        description: `${newCategory.name} has been added to your categories.`,
      });
    } catch (error) {
      toast({
        title: "Error adding category",
        description: "There was an error adding the category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      costPrice: item.costPrice,
      categoryId: item.categoryId,
      isActive: item.isActive,
      isService: item.isService,
      stockQuantity: item.stockQuantity,
      taxRate: item.taxRate,
      unit: item.unit
    });
    setIsEditItemDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteItemDialogOpen(true);
  };

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      price: 0,
      costPrice: 0,
      categoryId: "",
      isActive: true,
      isService: false,
      stockQuantity: 0,
      taxRate: 18,
      unit: ""
    });
  };

  // Filter inventory based on search term, active category, and active status
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = !activeCategory || item.categoryId === activeCategory;
    const matchesActiveStatus = !showActiveOnly || item.isActive;
    
    return matchesSearch && matchesCategory && matchesActiveStatus;
  });

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const getCategoryColor = (categoryId?: string) => {
    if (!categoryId) return "#94a3b8"; // slate-400
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || "#94a3b8";
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage your products and services</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="btn-secondary" 
            onClick={() => setIsCategoryDialogOpen(true)}
          >
            <Tag className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white button-pop" 
            onClick={() => setIsAddItemDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </motion.div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
                id="active-filter"
              />
              <Label htmlFor="active-filter">Show active only</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 bg-purple-100/50">
              <TabsTrigger 
                value="all" 
                onClick={() => setActiveCategory(null)}
                className="button-pop"
              >
                All Items
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className="button-pop"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden md:table-cell">Price</TableHead>
                      <TableHead className="hidden md:table-cell">Stock</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No items found. Add some items to your inventory.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium min-w-[200px]">
                            <div className="flex items-start">
                              <div>
                                {item.name}
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div 
                                className="w-2 h-2 rounded-full mr-2" 
                                style={{ backgroundColor: getCategoryColor(item.categoryId) }} 
                              />
                              <span>{getCategoryName(item.categoryId)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            ₹{item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {item.isService ? (
                              <span className="text-purple-600">Service</span>
                            ) : (
                              item.stockQuantity !== undefined ? 
                              item.stockQuantity : "N/A"
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {item.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    storage.updateInventoryItem({
                                      ...item,
                                      isActive: !item.isActive
                                    });
                                    refreshData();
                                    toast({
                                      title: `Item ${item.isActive ? 'deactivated' : 'activated'}`,
                                      description: `${item.name} is now ${item.isActive ? 'inactive' : 'active'}.`
                                    });
                                  }}
                                >
                                  {item.isActive ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Category tabs contents - will show the same table but filtered by category */}
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Price</TableHead>
                        <TableHead className="hidden md:table-cell">Stock</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No items found in this category.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div>
                                {item.name}
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              ₹{item.price.toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {item.isService ? (
                                <span className="text-purple-600">Service</span>
                              ) : (
                                item.stockQuantity !== undefined ? 
                                item.stockQuantity : "N/A"
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {item.isActive ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                      <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      storage.updateInventoryItem({
                                        ...item,
                                        isActive: !item.isActive
                                      });
                                      refreshData();
                                      toast({
                                        title: `Item ${item.isActive ? 'deactivated' : 'activated'}`,
                                        description: `${item.name} is now ${item.isActive ? 'inactive' : 'active'}.`
                                      });
                                    }}
                                  >
                                    {item.isActive ? (
                                      <>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new product or service to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Product or service name"
                value={itemForm.name || ""}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product or service description"
                value={itemForm.description || ""}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={itemForm.price || ""}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={itemForm.costPrice || ""}
                  onChange={(e) => setItemForm({ ...itemForm, costPrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={itemForm.categoryId || ""} 
                  onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  placeholder="18"
                  min={0}
                  max={100}
                  value={itemForm.taxRate || ""}
                  onChange={(e) => setItemForm({ ...itemForm, taxRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="isService">Item Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isService"
                    checked={itemForm.isService || false}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isService: checked })}
                  />
                  <Label htmlFor="isService">
                    {itemForm.isService ? "Service" : "Product"}
                  </Label>
                </div>
              </div>
              {!itemForm.isService && (
                <div className="grid gap-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="0"
                    min={0}
                    value={itemForm.stockQuantity || ""}
                    onChange={(e) => setItemForm({ ...itemForm, stockQuantity: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="pcs, kg, etc."
                  value={itemForm.unit || ""}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={itemForm.isActive !== undefined ? itemForm.isActive : true}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                  />
                  <Label htmlFor="isActive">
                    {itemForm.isActive !== undefined && itemForm.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetItemForm();
                setIsAddItemDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details of your item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Product or service name"
                value={itemForm.name || ""}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Product or service description"
                value={itemForm.description || ""}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={itemForm.price || ""}
                  onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-costPrice">Cost Price (₹)</Label>
                <Input
                  id="edit-costPrice"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={itemForm.costPrice || ""}
                  onChange={(e) => setItemForm({ ...itemForm, costPrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={itemForm.categoryId || ""} 
                  onValueChange={(value) => setItemForm({ ...itemForm, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-taxRate">Tax Rate (%)</Label>
                <Input
                  id="edit-taxRate"
                  type="number"
                  placeholder="18"
                  min={0}
                  max={100}
                  value={itemForm.taxRate || ""}
                  onChange={(e) => setItemForm({ ...itemForm, taxRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-isService">Item Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isService"
                    checked={itemForm.isService || false}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isService: checked })}
                  />
                  <Label htmlFor="edit-isService">
                    {itemForm.isService ? "Service" : "Product"}
                  </Label>
                </div>
              </div>
              {!itemForm.isService && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-stockQuantity">Stock Quantity</Label>
                  <Input
                    id="edit-stockQuantity"
                    type="number"
                    placeholder="0"
                    min={0}
                    value={itemForm.stockQuantity || ""}
                    onChange={(e) => setItemForm({ ...itemForm, stockQuantity: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  placeholder="pcs, kg, etc."
                  value={itemForm.unit || ""}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={itemForm.isActive !== undefined ? itemForm.isActive : true}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">
                    {itemForm.isActive !== undefined && itemForm.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetItemForm();
                setSelectedItem(null);
                setIsEditItemDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Item Dialog */}
      <Dialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedItem && (
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium">{selectedItem.name}</h3>
                {selectedItem.description && (
                  <p className="text-gray-500 text-sm mt-1">{selectedItem.description}</p>
                )}
                <p className="text-sm mt-2">
                  Price: ₹{selectedItem.price.toFixed(2)} • Category: {getCategoryName(selectedItem.categoryId)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedItem(null);
                setIsDeleteItemDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteItem}
            >
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add, edit, or delete categories for your inventory items.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Electronics, Food, Services"
                  value={categoryForm.name || ""}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-color">Category Color</Label>
                <Input
                  id="category-color"
                  type="color"
                  value={categoryForm.color || "#a78bfa"}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleAddCategory}
                disabled={!categoryForm.name}
              >
                Add Category
              </Button>
            </div>
            
            <div className="border rounded-md">
              <div className="py-2 px-3 bg-gray-50 border-b font-medium text-sm">
                Your Categories
              </div>
              <div className="p-2 max-h-60 overflow-auto">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    You haven't created any categories yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }} 
                          />
                          <span>{category.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            // Delete category
                            storage.deleteCategory(category.id);
                            refreshData();
                            toast({
                              title: "Category deleted",
                              description: `${category.name} has been removed.`,
                            });
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}