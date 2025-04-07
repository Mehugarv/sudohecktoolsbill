import { useState, useEffect } from "react";
import { storage, formatCurrency, generateId } from "../lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  FileText, 
  ShoppingBag, 
  Settings, 
  PlusCircle, 
  DollarSign,
  BarChart3,
  Package,
  CreditCard,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

// Importing full types from schema
import { ShopDetails, InventoryItem, Bill, Customer } from "@shared/schema";

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

export default function Home() {
  const [shopDetails, setShopDetails] = useState<ShopDetails>(storage.getShopDetails());
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "" });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [shopFormData, setShopFormData] = useState(shopDetails);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [isShopDetailsDialogOpen, setIsShopDetailsDialogOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setInventory(storage.getInventory());
    setBills(storage.getBillHistory());
  }, []);

  const refreshData = () => {
    setShopDetails(storage.getShopDetails());
    setInventory(storage.getInventory());
    setBills(storage.getBillHistory());
  };

  const handleSaveShopDetails = () => {
    storage.saveShopDetails(shopFormData);
    setShopDetails(shopFormData);
    setIsShopDetailsDialogOpen(false);
    toast({
      title: "Shop details updated",
      description: "Your shop details have been saved successfully.",
    });
    refreshData();
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Error adding item",
        description: "Name and price are required fields.",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(newItem.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const item: InventoryItem = {
      id: generateId(),
      name: newItem.name,
      description: newItem.description,
      price: price,
    };

    storage.addInventoryItem(item);
    setNewItem({ name: "", price: "", description: "" });
    setIsAddItemDialogOpen(false);
    refreshData();
    
    toast({
      title: "Item added",
      description: `${item.name} has been added to your inventory.`,
    });
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    
    storage.updateInventoryItem(editingItem);
    setEditingItem(null);
    setIsEditItemDialogOpen(false);
    refreshData();
    
    toast({
      title: "Item updated",
      description: `${editingItem.name} has been updated.`,
    });
  };

  const handleDeleteItem = (id: string) => {
    storage.deleteInventoryItem(id);
    refreshData();
    
    toast({
      title: "Item deleted",
      description: "The item has been removed from your inventory.",
    });
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditItemDialogOpen(true);
  };

  const handleCreateNewBill = () => {
    if (inventory.length === 0) {
      toast({
        title: "Cannot create bill",
        description: "You need to add items to your inventory first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Creating new bill",
      description: "Opening the bill creation form...",
    });
    // Will navigate to billing page in the future
  };

  // Card component with animation
  const StatsCard = ({ title, value, icon: Icon, description, buttonText, buttonAction, colorClass = "from-primary/20 to-primary/5" }) => (
    <motion.div variants={fadeInUp} className="w-full">
      <Card className={`card-hover overflow-hidden relative bg-gradient-to-br ${colorClass}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full button-pop" onClick={buttonAction}>
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Dashboard</h1>
        <Button onClick={handleCreateNewBill} className="button-pop">
          <FileText className="mr-2 h-4 w-4" /> Create New Bill
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="button-pop">Overview</TabsTrigger>
          <TabsTrigger value="inventory" className="button-pop">Inventory</TabsTrigger>
          <TabsTrigger value="bills" className="button-pop">Bills</TabsTrigger>
          <TabsTrigger value="settings" className="button-pop">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <StatsCard 
              title="Total Inventory Items" 
              value={inventory.length.toString()} 
              icon={Package} 
              description="Products and services in your inventory" 
              buttonText="Manage Inventory"
              buttonAction={() => setActiveTab("inventory")}
              colorClass="from-indigo-500/20 to-indigo-500/5"
            />
            
            <StatsCard 
              title="Shop Details" 
              value={shopDetails.name || "Not Set"} 
              icon={Settings} 
              description={shopDetails.address || "Set up your shop details"} 
              buttonText="Update Details"
              buttonAction={() => setIsShopDetailsDialogOpen(true)}
              colorClass="from-emerald-500/20 to-emerald-500/5"
            />
            
            <StatsCard 
              title="Billing" 
              value={bills.length.toString()} 
              icon={CreditCard} 
              description="Total bills generated" 
              buttonText="View Bills"
              buttonAction={() => setActiveTab("bills")}
              colorClass="from-amber-500/20 to-amber-500/5"
            />
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible" 
            className="grid gap-4 md:grid-cols-2"
          >
            <motion.div variants={fadeInUp}>
              <Card className="col-span-1 card-hover">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent bills and inventory changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {bills.length > 0 ? (
                      bills.slice(0, 3).map((bill, index) => (
                        <div key={bill.id} className="flex items-center space-x-4">
                          <div className="rounded-full bg-primary/20 p-2">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              Bill #{bill.invoiceNumber || index + 1}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(bill.date).toLocaleDateString()} - {formatCurrency(bill.total)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center">
                        <div className="mr-4 space-y-1">
                          <p className="text-sm font-medium leading-none">No recent activity</p>
                          <p className="text-sm text-muted-foreground">
                            Create a bill or add inventory items to see activity
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <Card className="col-span-1 card-hover overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span>Getting Started</span>
                    <Sparkles className="ml-2 h-4 w-4 text-yellow-500" />
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to set up your shop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all 
                        ${shopDetails.name ? "bg-green-100 text-green-700 scale-110" : "bg-muted"}`}>
                        {shopDetails.name ? "✓" : "1"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Update shop details
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Set your shop name, address, and contact details
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all
                        ${inventory.length > 0 ? "bg-green-100 text-green-700 scale-110" : "bg-muted"}`}>
                        {inventory.length > 0 ? "✓" : "2"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Add inventory items
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add products or services to your inventory
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all
                        ${bills.length > 0 ? "bg-green-100 text-green-700 scale-110" : "bg-muted"}`}>
                        {bills.length > 0 ? "✓" : "3"}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Create your first bill
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Generate and download a professional invoice
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute h-24 w-24 rounded-full bg-primary/10 -bottom-12 -right-12 blur-2xl"></div>
                <div className="absolute h-16 w-16 rounded-full bg-primary/10 top-0 -left-8 blur-xl"></div>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>
                  Add, edit, and manage your inventory items
                </CardDescription>
              </div>
              <Button className="button-pop" onClick={() => setIsAddItemDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                You have {inventory.length} items in your inventory
              </p>
              
              {inventory.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="rounded-full bg-primary/10 p-6 mb-4">
                    <ShoppingBag className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No inventory items yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                    Add products or services to your inventory to include them in your bills
                  </p>
                  <Button className="button-pop" onClick={() => setIsAddItemDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add First Item
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {inventory.map((item) => (
                    <motion.div
                      key={item.id}
                      variants={fadeInUp}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all card-hover"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatCurrency(item.price)}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="button-pop" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="button-pop text-destructive" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bills" className="space-y-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and manage your generated bills
                </CardDescription>
              </div>
              <Button className="button-pop" onClick={handleCreateNewBill}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Bill
              </Button>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="rounded-full bg-primary/10 p-6 mb-4">
                    <FileText className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No bills generated yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                    Create your first bill to see it appear here
                  </p>
                  <Button className="button-pop" onClick={handleCreateNewBill}>
                    <FileText className="mr-2 h-4 w-4" /> Create First Bill
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Bill list will go here */}
                  <p>Bill list placeholder</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>
                Update your shop information that appears on bills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <p className="font-medium">Shop Name</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.name || "Not set"}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.address || "Not set"}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <p className="font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.contact || "Not set"}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.email || "Not set"}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <p className="font-medium">Website</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.website || "Not set"}
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <p className="font-medium">Tax Information</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.gst || "Not set"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <p className="font-medium">Currency</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.currency || "$"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <p className="font-medium">Tax Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {shopDetails.taxRate}%
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full button-pop" onClick={() => setIsShopDetailsDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /> Update Shop Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new product or service to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Product or service name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter item description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details of this inventory item.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Product or service name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => 
                    setEditingItem({ 
                      ...editingItem, 
                      price: parseFloat(e.target.value) || 0 
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter item description"
                  value={editingItem.description || ""}
                  onChange={(e) => 
                    setEditingItem({ 
                      ...editingItem, 
                      description: e.target.value 
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (editingItem) handleDeleteItem(editingItem.id);
                setIsEditItemDialogOpen(false);
              }}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsEditItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shop Details Dialog */}
      <Dialog open={isShopDetailsDialogOpen} onOpenChange={setIsShopDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Shop Details</DialogTitle>
            <DialogDescription>
              Update your shop information that appears on bills.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  placeholder="Your shop name"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-currency">Currency Symbol</Label>
                <Input
                  id="shop-currency"
                  placeholder="$"
                  value={shopFormData.currency}
                  onChange={(e) => setShopFormData({ ...shopFormData, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-tagline">Tagline (Optional)</Label>
              <Input
                id="shop-tagline"
                placeholder="Quality Products & Services"
                value={shopFormData.tagline || ""}
                onChange={(e) => setShopFormData({ ...shopFormData, tagline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-address">Address</Label>
              <Textarea
                id="shop-address"
                placeholder="Your business address"
                value={shopFormData.address}
                onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-contact">Contact Number</Label>
                <Input
                  id="shop-contact"
                  placeholder="Phone number"
                  value={shopFormData.contact}
                  onChange={(e) => setShopFormData({ ...shopFormData, contact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-email">Email (Optional)</Label>
                <Input
                  id="shop-email"
                  placeholder="Email address"
                  type="email"
                  value={shopFormData.email || ""}
                  onChange={(e) => setShopFormData({ ...shopFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-website">Website (Optional)</Label>
                <Input
                  id="shop-website"
                  placeholder="Website URL"
                  value={shopFormData.website || ""}
                  onChange={(e) => setShopFormData({ ...shopFormData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-tax-rate">Tax Rate (%)</Label>
                <Input
                  id="shop-tax-rate"
                  placeholder="0"
                  type="number"
                  min="0"
                  max="100"
                  value={shopFormData.taxRate}
                  onChange={(e) => setShopFormData({ ...shopFormData, taxRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop-gst">GST/Tax Number (Optional)</Label>
                <Input
                  id="shop-gst"
                  placeholder="GST or VAT number"
                  value={shopFormData.gst || ""}
                  onChange={(e) => setShopFormData({ ...shopFormData, gst: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop-invoice-prefix">Invoice Prefix (Optional)</Label>
                <Input
                  id="shop-invoice-prefix"
                  placeholder="INV"
                  value={shopFormData.invoicePrefix || ""}
                  onChange={(e) => setShopFormData({ ...shopFormData, invoicePrefix: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShopDetailsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShopDetails}>
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}