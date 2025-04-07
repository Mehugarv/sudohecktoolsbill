import { useState, useEffect } from "react";
import { storage, formatCurrency } from "../lib/storage";
import { Button } from "../components/ui/button";
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
  FileText, 
  ShoppingBag, 
  Settings, 
  PlusCircle, 
  DollarSign,
  BarChart3
} from "lucide-react";

// Temporary type definitions until proper import is fixed
interface ShopDetails {
  name: string;
  address: string;
  contact: string;
  phone?: string;
  email?: string;
  website?: string;
  taxIdentifier?: string;
  currency: string;
  taxRate: number;
  theme: "light" | "dark" | "blue" | "green" | "purple";
  [key: string]: any;
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  [key: string]: any;
}

export default function Home() {
  const [shopDetails, setShopDetails] = useState<ShopDetails>(storage.getShopDetails() as unknown as ShopDetails);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setInventory(storage.getInventory() as unknown as InventoryItem[]);
  }, []);

  const handleSaveShopDetails = (details: any) => {
    storage.saveShopDetails(details);
    setShopDetails(details as ShopDetails);
  };

  const handleEditItem = (item: InventoryItem) => {
    // Will be implemented with dialog
    console.log("Edit item:", item);
  };

  const handleInventoryChange = () => {
    setInventory(storage.getInventory() as unknown as InventoryItem[]);
  };

  const refreshData = () => {
    setShopDetails(storage.getShopDetails() as unknown as ShopDetails);
    setInventory(storage.getInventory() as unknown as InventoryItem[]);
  };

  const handleCreateNewBill = () => {
    console.log("Create new bill");
    // Will navigate to billing page in the future
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleCreateNewBill}>
          <FileText className="mr-2 h-4 w-4" /> Create New Bill
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inventory Items
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Manage your product inventory
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("inventory")}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Shop Details
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopDetails.name || "Not Set"}</div>
                <p className="text-xs text-muted-foreground truncate">
                  {shopDetails.address || "No address set"}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("settings")}>
                  Update Shop Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Billing
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Bills generated this month
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("bills")}>
                  View Bills
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent bills and inventory changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">No recent activity</p>
                      <p className="text-sm text-muted-foreground">
                        Create a bill or add inventory items to see activity
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Complete these steps to set up your shop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${shopDetails.name ? "bg-green-100 text-green-700" : "bg-muted"}`}>
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
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${inventory.length > 0 ? "bg-green-100 text-green-700" : "bg-muted"}`}>
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
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-muted">
                      3
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
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Add, edit, and manage your inventory items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground pb-4">
                You have {inventory.length} items in your inventory
              </p>
              
              {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No inventory items yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Add products or services to your inventory to include them in your bills
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Price: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and manage your generated bills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No bills generated yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  Create your first bill to see it appear here
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateNewBill}>
                <FileText className="mr-2 h-4 w-4" /> Create New Bill
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
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
                    {shopDetails.phone || "Not set"}
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
                    {shopDetails.taxIdentifier || "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Settings className="mr-2 h-4 w-4" /> Update Shop Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}