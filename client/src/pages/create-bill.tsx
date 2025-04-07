import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { storage, formatCurrency, generateId, getCurrentDateTime, getDatePlusNDays } from "../lib/storage";
import { InventoryItem, BillItem, Bill, Customer, PaymentMethod } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Plus, 
  X, 
  ArrowLeft, 
  Save, 
  Download, 
  User,
  ShoppingCart,
  PackagePlus,
  Trash2,
  CreditCard,
  CalendarDays,
  BadgePercent,
  Receipt,
  Calculator
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Form schema for customer
const customerFormSchema = z.object({
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
  customerType: z.enum(["individual", "business"]).default("individual"),
  notes: z.string().optional(),
});

export default function CreateBill() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const shopDetails = storage.getShopDetails();
  
  // State for inventory and bill items
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for customer
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // State for bill details
  const [invoiceNumber, setInvoiceNumber] = useState(storage.generateInvoiceNumber());
  const [billDate, setBillDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 7))
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(shopDetails.taxRate || 18);
  const [notes, setNotes] = useState<string>("");
  const [termsAndConditions, setTermsAndConditions] = useState<string>(
    shopDetails.termsAndConditions || ""
  );
  
  // Step state
  const [currentStep, setCurrentStep] = useState<'items' | 'customer' | 'payment'>('items');
  
  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === "none" 
    ? 0 
    : discountType === "percentage" 
      ? (subtotal * discountValue) / 100 
      : discountValue;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;
  
  // Form for adding customer
  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      customerType: "individual",
    },
  });

  useEffect(() => {
    // Load inventory, customers, etc.
    setInventory(storage.getInventory());
    setCustomers(storage.getCustomers());
  }, []);

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch && item.isActive;
  });

  const addItemToBill = (item: InventoryItem, quantity: number = 1) => {
    // Check if item is already in the bill
    const existingItem = billItems.find(billItem => billItem.id === item.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      const updatedItems = billItems.map(billItem => 
        billItem.id === item.id 
          ? { 
              ...billItem, 
              quantity: billItem.quantity + quantity,
              total: (billItem.quantity + quantity) * billItem.price
            } 
          : billItem
      );
      setBillItems(updatedItems);
    } else {
      // Add new item
      const newBillItem: BillItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        total: item.price * quantity
      };
      
      setBillItems([...billItems, newBillItem]);
    }
    
    // Reset selected quantity
    const updatedSelectedItems = { ...selectedItems };
    delete updatedSelectedItems[item.id];
    setSelectedItems(updatedSelectedItems);
    
    toast({
      title: "Item added",
      description: `${item.name} added to bill.`,
    });
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = billItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total: quantity * item.price } 
        : item
    );
    
    setBillItems(updatedItems);
  };

  const removeItemFromBill = (itemId: string) => {
    const updatedItems = billItems.filter(item => item.id !== itemId);
    setBillItems(updatedItems);
    
    toast({
      title: "Item removed",
      description: "Item removed from bill.",
    });
  };

  const handleAddCustomer = (data: z.infer<typeof customerFormSchema>) => {
    const newCustomer: Customer = {
      ...data
    };
    
    // Add to storage if it doesn't exist already
    if (!customers.some(c => c.name === newCustomer.name)) {
      storage.addCustomer(newCustomer);
      setCustomers([...customers, newCustomer]);
    }
    
    // Set as selected customer
    setSelectedCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    
    // Move to next step
    setCurrentStep('payment');
    
    toast({
      title: "Customer added",
      description: `${newCustomer.name} has been added.`,
    });
  };

  const handleSaveBill = (download: boolean = false) => {
    // Validate bill data
    if (billItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      });
      setCurrentStep('items');
      return;
    }
    
    if (!selectedCustomer) {
      toast({
        title: "No customer selected",
        description: "Please select or add a customer for this bill.",
        variant: "destructive",
      });
      setCurrentStep('customer');
      return;
    }
    
    // Create bill object
    const bill: Bill = {
      id: generateId(),
      invoiceNumber,
      customer: selectedCustomer,
      date: billDate.toISOString(),
      createdAt: getCurrentDateTime(),
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      items: billItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      tax: taxAmount,
      total,
      paymentMethod,
      notes,
      isPaid: false,
      termsAndConditions
    };
    
    // Save bill to storage
    storage.addBill(bill);
    
    toast({
      title: "Bill saved",
      description: `Invoice #${invoiceNumber} has been saved.`,
    });
    
    // Download if requested
    if (download) {
      downloadBill(bill);
    }
    
    // Redirect to billing page
    navigate("/billing");
  };

  const downloadBill = (bill: Bill) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPos = 20;

      // Company details at the top
      doc.setFontSize(18);
      doc.setTextColor(75, 85, 99);
      doc.text(shopDetails.name, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(10);
      if (shopDetails.tagline) {
        doc.text(shopDetails.tagline, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
      
      doc.text(shopDetails.address, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      if (shopDetails.contact) {
        doc.text(`Contact: ${shopDetails.contact}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
      
      if (shopDetails.email) {
        doc.text(`Email: ${shopDetails.email}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
      
      // Add line separator
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Invoice header
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("INVOICE", margin, yPos);
      
      // Invoice details on the right
      doc.setFontSize(10);
      doc.text(`Invoice #: ${bill.invoiceNumber || bill.id}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      
      doc.text(`Date: ${format(new Date(bill.date), "MMM dd, yyyy")}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      
      if (bill.dueDate) {
        doc.text(`Due Date: ${format(new Date(bill.dueDate), "MMM dd, yyyy")}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;
      }
      
      doc.text(`Status: ${bill.isPaid ? 'Paid' : 'Unpaid'}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 15;

      // Customer information
      doc.setFontSize(12);
      doc.text("Bill To:", margin, yPos);
      yPos += 6;
      
      doc.setFontSize(10);
      doc.text(bill.customer.name, margin, yPos);
      yPos += 5;
      
      if (bill.customer.company) {
        doc.text(bill.customer.company, margin, yPos);
        yPos += 5;
      }
      
      if (bill.customer.address) {
        doc.text(bill.customer.address, margin, yPos);
        yPos += 5;
      }
      
      if (bill.customer.email) {
        doc.text(`Email: ${bill.customer.email}`, margin, yPos);
        yPos += 5;
      }
      
      if (bill.customer.phone) {
        doc.text(`Phone: ${bill.customer.phone}`, margin, yPos);
        yPos += 5;
      }
      
      yPos += 15;

      // Items table
      const tableColumns = ['Item', 'Price', 'Qty', 'Total'];
      const columnWidths = [pageWidth - (margin * 2) - 90, 30, 20, 40];
      const cellPadding = 6;
      
      // Table header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos - 4, pageWidth - (margin * 2), 10, 'F');
      
      let xPos = margin;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      tableColumns.forEach((column, i) => {
        if (i === 0) {
          doc.text(column, xPos + 2, yPos + 2);
        } else {
          doc.text(column, xPos + columnWidths[i] - 2, yPos + 2, { align: 'right' });
        }
        xPos += columnWidths[i];
      });
      
      yPos += cellPadding + 5;
      doc.setFont('helvetica', 'normal');
      
      // Table rows
      bill.items.forEach((item, index) => {
        xPos = margin;
        
        // Item name
        doc.text(item.name, xPos + 2, yPos);
        xPos += columnWidths[0];
        
        // Price
        doc.text(formatCurrency(item.price, shopDetails.currency), xPos + columnWidths[1] - 2, yPos, { align: 'right' });
        xPos += columnWidths[1];
        
        // Quantity
        doc.text(item.quantity.toString(), xPos + columnWidths[2] - 2, yPos, { align: 'right' });
        xPos += columnWidths[2];
        
        // Total
        doc.text(formatCurrency(item.total, shopDetails.currency), xPos + columnWidths[3] - 2, yPos, { align: 'right' });
        
        yPos += cellPadding;
        
        // Add a light gray line after each item
        if (index < bill.items.length - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
        }
      });
      
      // Total calculation section
      yPos += 10;
      const totalsX = pageWidth - margin - 80;
      const valuesX = pageWidth - margin;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      
      doc.text("Subtotal:", totalsX, yPos);
      doc.text(formatCurrency(bill.subtotal, shopDetails.currency), valuesX, yPos, { align: 'right' });
      yPos += 6;
      
      if (bill.discountAmount > 0) {
        doc.text("Discount:", totalsX, yPos);
        doc.text(`- ${formatCurrency(bill.discountAmount, shopDetails.currency)}`, valuesX, yPos, { align: 'right' });
        yPos += 6;
      }
      
      doc.text(`Tax (${bill.taxRate}%):`, totalsX, yPos);
      doc.text(formatCurrency(bill.tax, shopDetails.currency), valuesX, yPos, { align: 'right' });
      yPos += 6;
      
      doc.line(totalsX, yPos, valuesX, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text("Total:", totalsX, yPos);
      doc.text(formatCurrency(bill.total, shopDetails.currency), valuesX, yPos, { align: 'right' });
      yPos += 15;
      
      // Payment information
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Method: ${paymentMethod.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`, margin, yPos);
      yPos += 6;
      
      doc.text(`Payment Status: ${bill.isPaid ? 'Paid' : 'Unpaid'}`, margin, yPos);
      yPos += 20;
      
      // Add terms and conditions if available
      if (bill.termsAndConditions || shopDetails.termsAndConditions) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text("Terms & Conditions:", margin, yPos);
        yPos += 5;
        
        const terms = bill.termsAndConditions || shopDetails.termsAndConditions || "";
        const termsLines = doc.splitTextToSize(terms, pageWidth - (margin * 2));
        doc.text(termsLines, margin, yPos);
        yPos += termsLines.length * 5 + 10;
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footerText = shopDetails.footerText || `This is a computer generated invoice for ${shopDetails.name}.`;
      doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      
      // Save PDF
      doc.save(`Invoice-${bill.invoiceNumber || bill.id}.pdf`);
      
      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded as a PDF file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating the PDF.",
        variant: "destructive",
      });
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/billing")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold gradient-text">Create New Bill</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => handleSaveBill(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Save & Download
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white button-pop"
            onClick={() => handleSaveBill(false)}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Bill
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="bg-white">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle>Create Invoice #{invoiceNumber}</CardTitle>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={currentStep === 'items' ? 'bg-purple-100 text-purple-700' : ''}
                    onClick={() => setCurrentStep('items')}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Items
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={currentStep === 'customer' ? 'bg-purple-100 text-purple-700' : ''}
                    onClick={() => setCurrentStep('customer')}
                    disabled={billItems.length === 0}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={currentStep === 'payment' ? 'bg-purple-100 text-purple-700' : ''}
                    onClick={() => setCurrentStep('payment')}
                    disabled={billItems.length === 0 || !selectedCustomer}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Add Items Step */}
              {currentStep === 'items' && (
                <div className="space-y-4 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add Items to Bill</h3>
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                              {searchTerm 
                                ? "No items match your search." 
                                : "No items in inventory. Add some items first."}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInventory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.name}
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.price, shopDetails.currency)}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  className="w-16"
                                  value={selectedItems[item.id] || 1}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value > 0) {
                                      setSelectedItems({
                                        ...selectedItems,
                                        [item.id]: value
                                      });
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  onClick={() => addItemToBill(item, selectedItems[item.id] || 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setCurrentStep('customer')}
                      disabled={billItems.length === 0}
                    >
                      Continue to Customer
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Customer Step */}
              {currentStep === 'customer' && (
                <div className="space-y-4 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Customer</h3>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAddCustomerOpen(true)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Add New Customer
                    </Button>
                  </div>
                  
                  {selectedCustomer ? (
                    <div className="border rounded-md p-4 mb-4 bg-purple-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{selectedCustomer.name}</h3>
                          {selectedCustomer.company && (
                            <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                          )}
                          {selectedCustomer.email && (
                            <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                          )}
                          {selectedCustomer.phone && (
                            <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                          )}
                          {selectedCustomer.address && (
                            <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedCustomer(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    customers.length > 0 ? (
                      <div className="border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Contact</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customers.map((customer) => (
                              <TableRow key={customer.name}>
                                <TableCell className="font-medium">
                                  {customer.name}
                                </TableCell>
                                <TableCell>
                                  {customer.email || customer.phone || "No contact info"}
                                </TableCell>
                                <TableCell>
                                  {customer.company || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setSelectedCustomer(customer)}
                                  >
                                    Select
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-md">
                        <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium">No Customers Found</h3>
                        <p className="text-gray-500 mb-4">Add a new customer to continue</p>
                        <Button 
                          onClick={() => setIsAddCustomerOpen(true)}
                        >
                          Add New Customer
                        </Button>
                      </div>
                    )
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep('items')}
                    >
                      Back to Items
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => setCurrentStep('payment')}
                      disabled={!selectedCustomer}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="space-y-4 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Payment Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invoice-date">Invoice Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {billDate ? format(billDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={billDate}
                              onSelect={(date) => date && setBillDate(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal mt-1"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, "PPP") : "Select due date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={(date) => setDueDate(date)}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select 
                          value={paymentMethod} 
                          onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="credit_card">Credit Card</SelectItem>
                            <SelectItem value="debit_card">Debit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="online_payment">Online Payment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="discount-type">Discount</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Select 
                            value={discountType} 
                            onValueChange={(value: "none" | "percentage" | "fixed") => {
                              setDiscountType(value);
                              if (value === "none") setDiscountValue(0);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Discount type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Discount</SelectItem>
                              <SelectItem value="percentage">Percentage (%)</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Input
                            type="number"
                            min="0"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            disabled={discountType === "none"}
                            placeholder={discountType === "percentage" ? "%" : "Amount"}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes for this bill"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        placeholder="Terms and conditions for this bill"
                        value={termsAndConditions}
                        onChange={(e) => setTermsAndConditions(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep('customer')}
                    >
                      Back to Customer
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => handleSaveBill(true)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Save & Download
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleSaveBill(false)}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Bill
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card className="bg-white bg-blur-effect">
            <CardHeader className="pb-3 border-b">
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Selected customer summary */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
                {selectedCustomer ? (
                  <div className="p-3 bg-purple-50 rounded-md">
                    <p className="font-medium">{selectedCustomer.name}</p>
                    {selectedCustomer.email && <p className="text-xs text-gray-600">{selectedCustomer.email}</p>}
                    {selectedCustomer.phone && <p className="text-xs text-gray-600">{selectedCustomer.phone}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No customer selected</p>
                )}
              </div>
              
              {/* Items list */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500">Items</h3>
                  <span className="text-xs text-gray-500">{billItems.length} items</span>
                </div>
                
                {billItems.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">No items added</p>
                ) : (
                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
                    {billItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div className="flex-1 mr-2">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.price, shopDetails.currency)} × 
                            </p>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                              className="w-12 h-6 ml-1 px-1 py-0 text-xs"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(item.total, shopDetails.currency)}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 mt-1 text-gray-400 hover:text-red-500"
                            onClick={() => removeItemFromBill(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Totals */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotal, shopDetails.currency)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount 
                      {discountType === "percentage" ? ` (${discountValue}%)` : ""}:
                    </span>
                    <span className="text-red-600">
                      -{formatCurrency(discountAmount, shopDetails.currency)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({taxRate}%):</span>
                  <span>{formatCurrency(taxAmount, shopDetails.currency)}</span>
                </div>
                
                <div className="flex justify-between font-medium text-lg pt-2 mt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total, shopDetails.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Add a new customer to your billing system.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleAddCustomer)} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={customerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={customerForm.control}
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
                  control={customerForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={customerForm.control}
                  name="gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input placeholder="GST registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={customerForm.control}
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
              
              <FormField
                control={customerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Customer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}