import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { storage, formatCurrency, getFormattedDate, getPaymentMethodLabel } from "../lib/storage";
import { Bill } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Eye, 
  Download, 
  Trash2,
  Calendar,
  CreditCard,
  RefreshCcw,
  Filter,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle
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
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Billing() {
  const [location, navigate] = useLocation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "customer">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">("all");
  const { toast } = useToast();
  const shopDetails = storage.getShopDetails();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBills(storage.getBillHistory());
  };

  const handleDownloadBill = (bill: Bill) => {
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
      
      doc.text(`Date: ${getFormattedDate(bill.date)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      
      if (bill.dueDate) {
        doc.text(`Due Date: ${getFormattedDate(bill.dueDate)}`, pageWidth - margin, yPos, { align: 'right' });
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
      doc.text(`Payment Method: ${getPaymentMethodLabel(bill.paymentMethod)}`, margin, yPos);
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

  const handleDeleteBill = () => {
    if (!selectedBill) return;
    
    try {
      // Get all bills
      const allBills = storage.getBillHistory();
      // Filter out the selected bill
      const updatedBills = allBills.filter(bill => bill.id !== selectedBill.id);
      // Save the updated list
      storage.saveBillHistory(updatedBills);
      
      // Refresh the bills list
      refreshData();
      setSelectedBill(null);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Bill Deleted",
        description: `Invoice #${selectedBill.invoiceNumber || selectedBill.id} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the bill.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePaidStatus = (bill: Bill) => {
    try {
      const updatedBill = { ...bill, isPaid: !bill.isPaid };
      storage.updateBill(updatedBill);
      refreshData();
      
      toast({
        title: bill.isPaid ? "Marked as Unpaid" : "Marked as Paid",
        description: `Invoice #${bill.invoiceNumber || bill.id} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating the bill status.",
        variant: "destructive",
      });
    }
  };

  const sortedBills = [...bills]
    .filter(bill => {
      // Filter by search term
      const searchMatch = 
        (bill.customer?.name ? bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (bill.invoiceNumber ? bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (bill.id ? bill.id.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      
      // Filter by payment status
      const statusMatch = 
        filterStatus === "all" || 
        (filterStatus === "paid" && bill.isPaid) || 
        (filterStatus === "unpaid" && !bill.isPaid);
      
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      // Sort by the selected field
      if (sortBy === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "amount") {
        return sortDirection === "asc" 
          ? a.total - b.total
          : b.total - a.total;
      } else { // Sort by customer name
        return sortDirection === "asc" 
          ? a.customer.name.localeCompare(b.customer.name)
          : b.customer.name.localeCompare(a.customer.name);
      }
    });

  const toggleSort = (field: "date" | "amount" | "customer") => {
    if (sortBy === field) {
      // Toggle direction if it's the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (field: "date" | "amount" | "customer") => {
    if (sortBy !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="ml-1 h-4 w-4" /> 
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Billing</h1>
          <p className="text-gray-500 mt-1">View and manage your bills and invoices</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white button-pop" 
          onClick={() => navigate("/create-bill")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Bill
        </Button>
      </motion.div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by customer or invoice number..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Bills</h4>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Payment Status</h5>
                      <Select
                        value={filterStatus}
                        onValueChange={(value: any) => setFilterStatus(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Bills</SelectItem>
                          <SelectItem value="paid">Paid Only</SelectItem>
                          <SelectItem value="unpaid">Unpaid Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilterStatus("all");
                          setSearchTerm("");
                        }}
                      >
                        <RefreshCcw className="mr-2 h-3 w-3" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">
                    <button 
                      className="flex items-center focus:outline-none hover:text-purple-700"
                      onClick={() => toggleSort("customer")}
                    >
                      Customer 
                      {renderSortIcon("customer")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center focus:outline-none hover:text-purple-700"
                      onClick={() => toggleSort("date")}
                    >
                      Date 
                      {renderSortIcon("date")}
                    </button>
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="hidden md:table-cell">Payment Method</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center focus:outline-none hover:text-purple-700"
                      onClick={() => toggleSort("amount")}
                    >
                      Amount 
                      {renderSortIcon("amount")}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm || filterStatus !== "all" 
                        ? "No bills match your search criteria." 
                        : "You haven't created any bills yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedBills.map((bill) => (
                    <TableRow key={bill.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                      setSelectedBill(bill);
                      setIsViewDialogOpen(true);
                    }}>
                      <TableCell className="font-medium">
                        <div>
                          {bill.customer.name}
                          {bill.customer.company && (
                            <div className="text-xs text-gray-500">{bill.customer.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                          {getFormattedDate(bill.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {bill.invoiceNumber || bill.id.substring(0, 8)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                          {getPaymentMethodLabel(bill.paymentMethod)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(bill.total, shopDetails.currency)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {bill.isPaid ? (
                          <span className="status-badge status-paid">
                            Paid
                          </span>
                        ) : (
                          <span className="status-badge status-unpaid">
                            Unpaid
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedBill(bill);
                                setIsViewDialogOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadBill(bill)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleTogglePaidStatus(bill)}>
                                {bill.isPaid ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Mark as Unpaid
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Paid
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* View Bill Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Invoice #{selectedBill?.invoiceNumber || (selectedBill?.id.substring(0, 8))}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Bill From</h3>
                  <p className="font-medium">{shopDetails.name}</p>
                  <p className="text-sm text-gray-600">{shopDetails.address}</p>
                  {shopDetails.contact && <p className="text-sm text-gray-600">{shopDetails.contact}</p>}
                  {shopDetails.email && <p className="text-sm text-gray-600">{shopDetails.email}</p>}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
                  <p className="font-medium">{selectedBill.customer.name}</p>
                  {selectedBill.customer.company && <p className="text-sm text-gray-600">{selectedBill.customer.company}</p>}
                  {selectedBill.customer.address && <p className="text-sm text-gray-600">{selectedBill.customer.address}</p>}
                  {selectedBill.customer.phone && <p className="text-sm text-gray-600">{selectedBill.customer.phone}</p>}
                  {selectedBill.customer.email && <p className="text-sm text-gray-600">{selectedBill.customer.email}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Number</h3>
                  <p>{selectedBill.invoiceNumber || selectedBill.id.substring(0, 8)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Date</h3>
                  <p>{getFormattedDate(selectedBill.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                  <p>{getPaymentMethodLabel(selectedBill.paymentMethod)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <p>
                    {selectedBill.isPaid ? (
                      <span className="status-badge status-paid">Paid</span>
                    ) : (
                      <span className="status-badge status-unpaid">Unpaid</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md mb-6">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="text-right">{formatCurrency(item.price, shopDetails.currency)}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{formatCurrency(item.total, shopDetails.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(selectedBill.subtotal, shopDetails.currency)}</span>
                  </div>
                  
                  {selectedBill.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Discount 
                        {selectedBill.discountType === "percentage" 
                          ? ` (${selectedBill.discountValue}%)` 
                          : ""}:
                      </span>
                      <span>-{formatCurrency(selectedBill.discountAmount, shopDetails.currency)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({selectedBill.taxRate}%):</span>
                    <span>{formatCurrency(selectedBill.tax, shopDetails.currency)}</span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedBill.total, shopDetails.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {(selectedBill.notes || selectedBill.termsAndConditions) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {selectedBill.notes && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                      <p className="text-sm text-gray-600">{selectedBill.notes}</p>
                    </div>
                  )}
                  
                  {selectedBill.termsAndConditions && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Terms & Conditions</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{selectedBill.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant={selectedBill.isPaid ? "outline" : "default"}
                    onClick={() => {
                      handleTogglePaidStatus(selectedBill);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    {selectedBill.isPaid ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Mark as Unpaid
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={() => {
                      handleDownloadBill(selectedBill);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Bill Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Bill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="py-4">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium">Invoice #{selectedBill.invoiceNumber || selectedBill.id.substring(0, 8)}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Customer:</span> {selectedBill.customer.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount:</span> {formatCurrency(selectedBill.total, shopDetails.currency)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {getFormattedDate(selectedBill.date)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedBill(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBill}
            >
              Delete Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}