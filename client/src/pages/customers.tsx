import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Customer } from "@shared/schema";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  User,
  Mail,
  Phone,
  Home,
  Briefcase,
  Edit,
  Trash2,
  Filter,
  Download,
  Plus,
  X,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateId } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Customers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerType, setCustomerType] = useState<"all" | "individual" | "business">("all");

  // Form schema for customer
  const formSchema = z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    company: z.string().optional(),
    gst: z.string().optional(),
    pan: z.string().optional(),
    customerType: z.enum(["individual", "business"]),
    notes: z.string().optional(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      company: "",
      gst: "",
      pan: "",
      customerType: "individual",
      notes: "",
    },
  });

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    try {
      const loadedCustomers = storage.getCustomers();
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    }
  };

  // Filter customers based on search and type
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchTerm));

    if (customerType === "all") return matchesSearch;
    return matchesSearch && customer.customerType === customerType;
  });

  const handleOpenAddCustomer = () => {
    form.reset();
    setSelectedCustomer(null);
    setIsAddCustomerOpen(true);
  };

  const handleOpenEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.reset({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      postalCode: customer.postalCode || "",
      country: customer.country || "",
      company: customer.company || "",
      gst: customer.gst || "",
      pan: customer.pan || "",
      customerType: customer.customerType,
      notes: customer.notes || "",
    });
    setIsAddCustomerOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = () => {
    if (selectedCustomer) {
      try {
        storage.deleteCustomer(selectedCustomer);
        loadCustomers();
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast({
          title: "Error",
          description: "Failed to delete customer",
          variant: "destructive",
        });
      }
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        const updatedCustomer: Customer = { ...data };
        storage.updateCustomer(updatedCustomer);
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        // Add new customer
        const newCustomer: Customer = { ...data };
        storage.addCustomer(newCustomer);
        toast({
          title: "Success",
          description: "Customer added successfully",
        });
      }
      loadCustomers();
      setIsAddCustomerOpen(false);
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const exportCustomers = () => {
    const customersCSV = [
      [
        "Name",
        "Email",
        "Phone",
        "Address",
        "City",
        "State",
        "Postal Code",
        "Country",
        "Company",
        "GST",
        "PAN",
        "Type",
        "Notes",
      ].join(","),
      ...filteredCustomers.map(
        (customer) =>
          [
            `"${customer.name}"`,
            `"${customer.email || ""}"`,
            `"${customer.phone || ""}"`,
            `"${customer.address || ""}"`,
            `"${customer.city || ""}"`,
            `"${customer.state || ""}"`,
            `"${customer.postalCode || ""}"`,
            `"${customer.country || ""}"`,
            `"${customer.company || ""}"`,
            `"${customer.gst || ""}"`,
            `"${customer.pan || ""}"`,
            `"${customer.customerType}"`,
            `"${customer.notes || ""}"`,
          ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([customersCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="btn-outline"
            onClick={exportCustomers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="btn-primary" onClick={handleOpenAddCustomer}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={customerType}
          onValueChange={(value: "all" | "individual" | "business") =>
            setCustomerType(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="tabs-container">
          <TabsTrigger value="list" className="tab-inactive">List View</TabsTrigger>
          <TabsTrigger value="card" className="tab-inactive">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="h-10 w-10 mb-2 text-gray-300" />
                            <p>No customers found</p>
                            {searchTerm && (
                              <Button
                                variant="link"
                                onClick={() => setSearchTerm("")}
                                className="mt-2"
                              >
                                Clear search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="font-medium">{customer.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              {customer.email && (
                                <span className="text-sm flex items-center">
                                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {customer.email}
                                </span>
                              )}
                              {customer.phone && (
                                <span className="text-sm flex items-center">
                                  <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {customer.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                customer.customerType === "business"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {customer.customerType === "business"
                                ? "Business"
                                : "Individual"}
                            </span>
                          </TableCell>
                          <TableCell>{customer.company || "-"}</TableCell>
                          <TableCell>
                            {customer.city
                              ? `${customer.city}${
                                  customer.state ? `, ${customer.state}` : ""
                                }`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditCustomer(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCustomer(customer)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="card" className="mt-4">
          {filteredCustomers.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Users className="h-10 w-10 mb-2 text-gray-300" />
                <p>No customers found</p>
                {searchTerm && (
                  <Button
                    variant="link"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCustomers.map((customer, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="card-with-hover h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{customer.name}</CardTitle>
                          <span
                            className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              customer.customerType === "business"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {customer.customerType === "business"
                              ? "Business"
                              : "Individual"}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2">
                      <div className="space-y-2">
                        {customer.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.company && (
                          <div className="flex items-center text-sm">
                            <Briefcase className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span>{customer.company}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-start text-sm">
                            <Home className="h-3.5 w-3.5 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                              <div>{customer.address}</div>
                              {(customer.city || customer.state) && (
                                <div>
                                  {customer.city}
                                  {customer.city && customer.state && ", "}
                                  {customer.state} {customer.postalCode}
                                </div>
                              )}
                              {customer.country && <div>{customer.country}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {selectedCustomer 
                ? "Update customer information in your database"
                : "Add a new customer to your database"
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this customer"
                          {...field}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCustomerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="btn-primary">
                  {selectedCustomer ? "Update Customer" : "Add Customer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {selectedCustomer && <strong>{selectedCustomer.name}</strong>}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCustomer}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}