import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { ShopDetails } from "@shared/schema";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  LogOut,
  FileText,
  Brush,
  Database,
  CreditCard,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Percent,
  ExternalLink,
  DollarSign,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Trash,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
];

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("business");
  const [shopDetails, setShopDetails] = useState<ShopDetails>(storage.getShopDetails());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(shopDetails.logo || null);

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(1, "Shop name is required"),
    tagline: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    contact: z.string().min(1, "Contact is required"),
    alternateContact: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    gst: z.string().optional(),
    pan: z.string().optional(),
    businessType: z.string().optional(),
    registrationNumber: z.string().optional(),
    currency: z.string().min(1, "Currency symbol is required"),
    taxRate: z.number().min(0).max(100),
    footerText: z.string().optional(),
    termsAndConditions: z.string().optional(),
    bankDetails: z.string().optional(),
    invoicePrefix: z.string().optional(),
    theme: z.enum(["light", "dark", "blue", "green", "purple"]),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: shopDetails.name,
      tagline: shopDetails.tagline || "",
      address: shopDetails.address,
      city: shopDetails.city || "",
      state: shopDetails.state || "",
      postalCode: shopDetails.postalCode || "",
      country: shopDetails.country || "",
      contact: shopDetails.contact,
      alternateContact: shopDetails.alternateContact || "",
      email: shopDetails.email || "",
      website: shopDetails.website || "",
      gst: shopDetails.gst || "",
      pan: shopDetails.pan || "",
      businessType: shopDetails.businessType || "",
      registrationNumber: shopDetails.registrationNumber || "",
      currency: shopDetails.currency || "$",
      taxRate: shopDetails.taxRate || 10,
      footerText: shopDetails.footerText || "",
      termsAndConditions: shopDetails.termsAndConditions || "",
      bankDetails: shopDetails.bankDetails || "",
      invoicePrefix: shopDetails.invoicePrefix || "",
      theme: shopDetails.theme || "light",
    },
  });

  // Load shop details
  useEffect(() => {
    const details = storage.getShopDetails();
    setShopDetails(details);
    setLogoPreview(details.logo || null);
    
    // Reset the form with stored values
    form.reset({
      name: details.name,
      tagline: details.tagline || "",
      address: details.address,
      city: details.city || "",
      state: details.state || "",
      postalCode: details.postalCode || "",
      country: details.country || "",
      contact: details.contact,
      alternateContact: details.alternateContact || "",
      email: details.email || "",
      website: details.website || "",
      gst: details.gst || "",
      pan: details.pan || "",
      businessType: details.businessType || "",
      registrationNumber: details.registrationNumber || "",
      currency: details.currency || "$",
      taxRate: details.taxRate || 10,
      footerText: details.footerText || "",
      termsAndConditions: details.termsAndConditions || "",
      bankDetails: details.bankDetails || "",
      invoicePrefix: details.invoicePrefix || "",
      theme: details.theme || "light",
    });
  }, []);

  const handleLogoUpload = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click();
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      // Create updated shop details
      const updatedDetails: ShopDetails = {
        ...data,
        logo: logoPreview,
      };
      
      // Save to storage
      storage.saveShopDetails(updatedDetails);
      
      // Update state
      setShopDetails(updatedDetails);
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const handleResetData = () => {
    try {
      // Check if resetData function exists in storage
      if (typeof storage.resetData === 'function') {
        // Reset application data
        storage.resetData();
        
        // Show success message
        toast({
          title: "Success",
          description: "All application data has been reset",
        });
        
        // Refresh the page to reflect changes
        window.location.reload();
      } else {
        // Fallback: Delete individual keys from localStorage
        localStorage.removeItem('shopDetails');
        localStorage.removeItem('inventory');
        localStorage.removeItem('billHistory');
        localStorage.removeItem('categories');
        localStorage.removeItem('settings');
        localStorage.removeItem('customers');
        
        toast({
          title: "Success",
          description: "All application data has been reset",
        });
        
        // Refresh the page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast({
        title: "Error",
        description: "Failed to reset application data",
        variant: "destructive",
      });
    }
    
    // Close dialog
    setIsResetDialogOpen(false);
  };

  const exportAllData = () => {
    try {
      // Gather all data from storage
      const exportData = {
        shopDetails: storage.getShopDetails(),
        inventory: storage.getInventory(),
        categories: storage.getCategories(),
        bills: storage.getBills(),
        customers: storage.getCustomers(),
      };
      
      // Create JSON file
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create and click download link
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `shop_data_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your shop settings and preferences
        </p>
      </div>

      <Tabs defaultValue="business" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="tabs-container">
          <TabsTrigger value="business" className="tab-inactive">
            <Building className="h-4 w-4 mr-2" />
            Business Details
          </TabsTrigger>
          <TabsTrigger value="invoice" className="tab-inactive">
            <FileText className="h-4 w-4 mr-2" />
            Invoice Settings
          </TabsTrigger>
          <TabsTrigger value="appearance" className="tab-inactive">
            <Brush className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="data" className="tab-inactive">
            <Database className="h-4 w-4 mr-2" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
            <TabsContent value="business">
              <Card className="bg-blur-effect">
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Update your shop information that will appear on invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-24 h-24 rounded-md border flex items-center justify-center overflow-hidden bg-white"
                      >
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Shop Logo" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImagePlus className="h-10 w-10 text-gray-300" />
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="text-sm text-muted-foreground">
                          Upload your shop logo that will appear on invoices. Recommended size: 200x200px.
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={handleLogoUpload}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          {logoPreview && (
                            <Button 
                              type="button" 
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveLogo}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={logoInputRef}
                            onChange={handleLogoChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shop Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Shop Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Your shop tagline or slogan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Retail, Service, Manufacturing" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Business registration number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Contact*</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="alternateContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alternate Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Alternate Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="yourshop@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourshop.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line*</FormLabel>
                          <FormControl>
                            <Input placeholder="Street Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal/ZIP Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />
                  
                  {/* Tax Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tax Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gst"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="GST Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN Number</FormLabel>
                            <FormControl>
                              <Input placeholder="PAN Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="invoice">
              <Card className="bg-blur-effect">
                <CardHeader>
                  <CardTitle>Invoice Settings</CardTitle>
                  <CardDescription>
                    Customize how your invoices appear to customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Symbol*</FormLabel>
                          <FormControl>
                            <Input placeholder="$" {...field} />
                          </FormControl>
                          <FormDescription>
                            The symbol that will be shown before prices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              step="0.1"
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                field.onChange(isNaN(value) ? 0 : value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Default tax percentage applied to invoices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="invoicePrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Number Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="INV-" {...field} />
                        </FormControl>
                        <FormDescription>
                          Added before the invoice number (e.g., INV-001)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bankDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Account Name: Your Name&#10;Account Number: 1234567890&#10;Bank Name: Your Bank&#10;IFSC Code: ABCD0123456" 
                            className="min-h-24 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Bank account details to show on invoices
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms and Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="1. Payment due within 15 days&#10;2. Goods once sold cannot be returned&#10;3. Subject to local jurisdiction" 
                            className="min-h-24 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Terms that will appear at the bottom of your invoices
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Footer Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Thank you for your business!" {...field} />
                        </FormControl>
                        <FormDescription>
                          A short message to include at the bottom of invoices
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="bg-blur-effect">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how the application looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Theme</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {themeOptions.map((theme) => (
                              <SelectItem key={theme.value} value={theme.value}>
                                {theme.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a theme for the application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>

        <TabsContent value="data">
          <Card className="bg-blur-effect">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Import, export or reset your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Export Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download a backup of all your data including shop details, inventory, and bills
                </p>
                <Button variant="outline" onClick={exportAllData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-destructive">Reset Application Data</h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your data and reset the application to its default state. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setIsResetDialogOpen(true)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reset All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all your data including shop details, inventory items, bills, and customers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              className="bg-destructive text-destructive-foreground"
            >
              Reset All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}