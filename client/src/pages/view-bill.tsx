import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { storage, formatCurrency, getFormattedDate, getPaymentMethodLabel } from "@/lib/storage";
import { Bill } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle,
  XCircle,
  CreditCard,
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  Edit,
  RefreshCcw,
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";

export default function ViewBill() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/bills/:id");
  const { toast } = useToast();
  const [bill, setBill] = useState<Bill | null>(null);
  const [shopDetails, setShopDetails] = useState(storage.getShopDetails());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (params && params.id) {
      try {
        const foundBill = storage.getBillById(params.id);
        if (foundBill) {
          setBill(foundBill);
        } else {
          toast({
            title: "Error",
            description: "Bill not found",
            variant: "destructive",
          });
          navigate("/billing");
        }
      } catch (error) {
        console.error("Error loading bill:", error);
        toast({
          title: "Error",
          description: "Failed to load bill details",
          variant: "destructive",
        });
        navigate("/billing");
      }
    }
  }, [params]);

  const handleTogglePaidStatus = () => {
    if (bill) {
      try {
        const updatedBill: Bill = {
          ...bill,
          isPaid: !bill.isPaid,
        };
        storage.updateBill(updatedBill);
        setBill(updatedBill);
        toast({
          title: "Success",
          description: `Bill marked as ${updatedBill.isPaid ? "paid" : "unpaid"}`,
        });
      } catch (error) {
        console.error("Error updating bill:", error);
        toast({
          title: "Error",
          description: "Failed to update bill status",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteBill = () => {
    if (bill) {
      try {
        storage.deleteBill(bill.id);
        toast({
          title: "Success",
          description: "Bill deleted successfully",
        });
        navigate("/billing");
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive",
        });
      }
    }
    setIsDeleteDialogOpen(false);
  };

  const handlePrintBill = () => {
    window.print();
  };

  const handleDownloadBill = () => {
    if (!bill) return;
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Set some defaults
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const lineHeight = 7;
      
      // Add logo if available
      if (shopDetails.logo) {
        try {
          doc.addImage(shopDetails.logo, 'JPEG', margin, margin, 40, 20);
        } catch (e) {
          console.error("Error adding logo to PDF:", e);
        }
      }
      
      // Shop details
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(shopDetails.name, margin, margin + 30);
      
      // Tagline if present
      if (shopDetails.tagline) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(shopDetails.tagline, margin, margin + 37);
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const addressLines = [
        shopDetails.address,
        shopDetails.city && shopDetails.state 
          ? `${shopDetails.city}, ${shopDetails.state} ${shopDetails.postalCode || ''}` 
          : shopDetails.city || shopDetails.state || '',
        shopDetails.country || '',
      ].filter(Boolean);
      
      let yPos = margin + 44;
      addressLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      
      // Contact info
      if (shopDetails.contact) {
        doc.text(`Phone: ${shopDetails.contact}`, margin, yPos);
        yPos += 5;
      }
      if (shopDetails.email) {
        doc.text(`Email: ${shopDetails.email}`, margin, yPos);
        yPos += 5;
      }
      if (shopDetails.website) {
        doc.text(`Web: ${shopDetails.website}`, margin, yPos);
        yPos += 5;
      }
      
      // GST info if present
      if (shopDetails.gst) {
        doc.text(`GST: ${shopDetails.gst}`, margin, yPos);
        yPos += 5;
      }
      
      // Invoice header
      yPos += 5;
      doc.setFillColor(240, 240, 255);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("INVOICE", margin + 2, yPos + 7);
      
      // Invoice number & date
      yPos += 15;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Number:", margin, yPos);
      doc.text("Date:", margin, yPos + lineHeight);
      doc.text("Due Date:", margin, yPos + lineHeight * 2);
      doc.text("Status:", margin, yPos + lineHeight * 3);
      
      const invoiceNumber = bill.invoiceNumber || bill.id.substring(0, 8).toUpperCase();
      
      doc.setFont("helvetica", "normal");
      doc.text(invoiceNumber, margin + 35, yPos);
      doc.text(getFormattedDate(bill.date), margin + 35, yPos + lineHeight);
      doc.text(bill.dueDate ? getFormattedDate(bill.dueDate) : "N/A", margin + 35, yPos + lineHeight * 2);
      doc.text(bill.isPaid ? "PAID" : "UNPAID", margin + 35, yPos + lineHeight * 3);
      
      // Bill to section
      yPos += lineHeight * 4 + 5;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", margin, yPos);
      
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(bill.customer.name, margin, yPos);
      
      let customerInfo = [];
      if (bill.customer.company) customerInfo.push(bill.customer.company);
      if (bill.customer.address) customerInfo.push(bill.customer.address);
      if (bill.customer.city || bill.customer.state) {
        const cityState = [bill.customer.city, bill.customer.state]
          .filter(Boolean)
          .join(", ");
        if (cityState) customerInfo.push(cityState);
      }
      if (bill.customer.postalCode) customerInfo.push(bill.customer.postalCode);
      if (bill.customer.country) customerInfo.push(bill.customer.country);
      if (bill.customer.phone) customerInfo.push(`Phone: ${bill.customer.phone}`);
      if (bill.customer.email) customerInfo.push(`Email: ${bill.customer.email}`);
      if (bill.customer.gst) customerInfo.push(`GST: ${bill.customer.gst}`);
      
      customerInfo.forEach(line => {
        yPos += lineHeight;
        doc.text(line, margin, yPos);
      });
      
      // Items table
      yPos += lineHeight * 2;
      
      // Table header
      doc.setFillColor(240, 240, 255);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text("Item", margin + 2, yPos + 5.5);
      doc.text("Price", margin + 90, yPos + 5.5);
      doc.text("Qty", margin + 115, yPos + 5.5);
      doc.text("Total", margin + 135, yPos + 5.5);
      
      // Table rows
      yPos += 8;
      doc.setFont("helvetica", "normal");
      
      bill.items.forEach((item, index) => {
        // Add a new page if we're running out of space
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = margin;
        }
        
        const isAlternateRow = index % 2 === 1;
        if (isAlternateRow) {
          doc.setFillColor(250, 250, 255);
          doc.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
        }
        
        // Split long item names into multiple lines if necessary
        const maxWidth = 80; // Maximum width for item name column
        const itemNameLines = doc.splitTextToSize(item.name, maxWidth);
        
        // Calculate row height based on number of lines
        const lineHeight = 5;
        const rowHeight = Math.max(7, itemNameLines.length * lineHeight);
        
        // Draw rectangle for alternate rows with adjusted height
        if (isAlternateRow) {
          doc.setFillColor(250, 250, 255);
          doc.rect(margin, yPos, pageWidth - margin * 2, rowHeight, 'F');
        }
        
        // Print each line of the item name
        for (let i = 0; i < itemNameLines.length; i++) {
          doc.text(itemNameLines[i], margin + 2, yPos + 5 + (i * lineHeight));
        }
        
        // Print other columns at the vertical center of the row
        const verticalCenter = yPos + (rowHeight / 2);
        doc.text(formatCurrency(item.price), margin + 90, verticalCenter);
        doc.text(item.quantity.toString(), margin + 115, verticalCenter);
        doc.text(formatCurrency(item.total), margin + 135, verticalCenter);
        
        yPos += rowHeight;
      });
      
      // Summary section
      yPos += 5;
      const summaryX = pageWidth - margin - 60;
      
      doc.setFont("helvetica", "normal");
      doc.text("Subtotal:", summaryX, yPos);
      doc.text(formatCurrency(bill.subtotal), pageWidth - margin - 5, yPos, { align: "right" });
      
      yPos += lineHeight;
      if (bill.discountAmount > 0) {
        const discountType = bill.discountType === "percentage" ? `(${bill.discountValue}%)` : "";
        doc.text(`Discount ${discountType}:`, summaryX, yPos);
        doc.text(`-${formatCurrency(bill.discountAmount)}`, pageWidth - margin - 5, yPos, { align: "right" });
        yPos += lineHeight;
      }
      
      doc.text(`Tax (${bill.taxRate}%):`, summaryX, yPos);
      doc.text(formatCurrency(bill.tax), pageWidth - margin - 5, yPos, { align: "right" });
      
      yPos += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.text("Total:", summaryX, yPos);
      doc.text(formatCurrency(bill.total), pageWidth - margin - 5, yPos, { align: "right" });
      
      // Payment method
      yPos += lineHeight * 2;
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Method: ${getPaymentMethodLabel(bill.paymentMethod)}`, margin, yPos);
      
      // Notes
      if (bill.notes) {
        yPos += lineHeight * 2;
        doc.setFont("helvetica", "bold");
        doc.text("Notes:", margin, yPos);
        yPos += lineHeight;
        doc.setFont("helvetica", "normal");
        const notesText = bill.notes || ""; // Ensure notes is not undefined
        doc.text(notesText, margin, yPos);
      }
      
      // Terms and conditions
      if (bill.termsAndConditions || shopDetails.termsAndConditions) {
        const terms = (bill.termsAndConditions || shopDetails.termsAndConditions || "").toString();
        yPos += lineHeight * 2;
        doc.setFont("helvetica", "bold");
        doc.text("Terms and Conditions:", margin, yPos);
        yPos += lineHeight;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        
        // Make sure terms is a string before splitting
        const termsLines = doc.splitTextToSize(terms.toString(), pageWidth - margin * 2);
        doc.text(termsLines, margin, yPos);
      }
      
      // Footer
      const footerText = shopDetails.footerText || "Thank you for your business!";
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        footerText,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      
      // Save the PDF
      doc.save(`Invoice_${invoiceNumber}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (!bill) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-pulse text-purple-600">Loading bill details...</div>
      </div>
    );
  }

  // Format the invoice number
  const invoiceNumber = bill.invoiceNumber || bill.id.substring(0, 8).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/billing")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Invoice #{invoiceNumber}
            </h1>
            <div className="flex items-center text-muted-foreground mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{getFormattedDate(bill.date)}</span>
              
              <span className="mx-2">•</span>
              
              <CreditCard className="h-4 w-4 mr-1" />
              <span>{getPaymentMethodLabel(bill.paymentMethod)}</span>
              
              <span className="mx-2">•</span>
              
              <Badge
                variant="outline"
                className={`${
                  bill.isPaid 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }`}
              >
                {bill.isPaid ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {bill.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleTogglePaidStatus}>
            {bill.isPaid ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Unpaid
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={handlePrintBill}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          <Button variant="outline" onClick={handleDownloadBill}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Link href={`/create-bill?edit=${bill.id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Left column - Business & Customer Details */}
        <div className="lg:col-span-1 space-y-6 print:mb-6">
          {/* Business Details */}
          <Card className="card-with-hover bg-blur-effect print:shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-500" />
                Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                {shopDetails.logo ? (
                  <div className="w-32 h-32 flex items-center justify-center overflow-hidden rounded-md bg-white p-2 border">
                    <img 
                      src={shopDetails.logo} 
                      alt={shopDetails.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-purple-100 rounded-md border border-purple-200">
                    <FileText className="h-10 w-10 text-purple-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg">{shopDetails.name}</h3>
                {shopDetails.tagline && (
                  <p className="text-muted-foreground text-sm">{shopDetails.tagline}</p>
                )}
              </div>
              
              <div className="space-y-1 text-sm">
                <p>{shopDetails.address}</p>
                {(shopDetails.city || shopDetails.state) && (
                  <p>
                    {shopDetails.city}
                    {shopDetails.city && shopDetails.state && ", "}
                    {shopDetails.state} {shopDetails.postalCode}
                  </p>
                )}
                {shopDetails.country && <p>{shopDetails.country}</p>}
              </div>
              
              <div className="space-y-1 text-sm">
                {shopDetails.contact && (
                  <div className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{shopDetails.contact}</span>
                  </div>
                )}
                {shopDetails.email && (
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{shopDetails.email}</span>
                  </div>
                )}
              </div>
              
              {shopDetails.gst && (
                <div className="text-sm">
                  <span className="font-medium">GST:</span> {shopDetails.gst}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Customer Details */}
          <Card className="card-with-hover bg-blur-effect print:shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{bill.customer.name}</h3>
                {bill.customer.company && (
                  <p className="text-muted-foreground text-sm">{bill.customer.company}</p>
                )}
              </div>
              
              {(bill.customer.address || bill.customer.city || bill.customer.state) && (
                <div className="space-y-1 text-sm">
                  {bill.customer.address && <p>{bill.customer.address}</p>}
                  {(bill.customer.city || bill.customer.state) && (
                    <p>
                      {bill.customer.city}
                      {bill.customer.city && bill.customer.state && ", "}
                      {bill.customer.state} {bill.customer.postalCode}
                    </p>
                  )}
                  {bill.customer.country && <p>{bill.customer.country}</p>}
                </div>
              )}
              
              <div className="space-y-1 text-sm">
                {bill.customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{bill.customer.phone}</span>
                  </div>
                )}
                {bill.customer.email && (
                  <div className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>{bill.customer.email}</span>
                  </div>
                )}
              </div>
              
              {bill.customer.gst && (
                <div className="text-sm">
                  <span className="font-medium">GST:</span> {bill.customer.gst}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Invoice Meta */}
          <Card className="card-with-hover bg-blur-effect print:shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-500" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-medium">{invoiceNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date:</span>
                <span>{getFormattedDate(bill.date)}</span>
              </div>
              
              {bill.dueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{getFormattedDate(bill.dueDate)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span>{getPaymentMethodLabel(bill.paymentMethod)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant="outline"
                  className={`${
                    bill.isPaid 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }`}
                >
                  {bill.isPaid ? "Paid" : "Unpaid"}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created At:</span>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span>{new Date(bill.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Invoice Items & Summary */}
        <div className="lg:col-span-2 space-y-6 print:mt-0">
          {/* Invoice Items */}
          <Card className="card-with-hover bg-blur-effect print:shadow-none">
            <CardHeader className="pb-3">
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="print:border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium whitespace-normal break-words max-w-xs">{item.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Subtotal</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.subtotal)}</TableCell>
                  </TableRow>
                  {bill.discountAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        Discount
                        {bill.discountType === "percentage" && ` (${bill.discountValue}%)`}
                      </TableCell>
                      <TableCell className="text-right">-{formatCurrency(bill.discountAmount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3}>Tax ({bill.taxRate}%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(bill.tax)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(bill.total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
          
          {/* Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notes */}
            {bill.notes && (
              <Card className="card-with-hover bg-blur-effect print:shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{bill.notes}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Terms & Conditions */}
            {(bill.termsAndConditions || shopDetails.termsAndConditions) && (
              <Card className="card-with-hover bg-blur-effect print:shadow-none md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">
                    {bill.termsAndConditions || shopDetails.termsAndConditions}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Bank Details */}
            {shopDetails.bankDetails && (
              <Card className="card-with-hover bg-blur-effect print:shadow-none md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">{shopDetails.bankDetails}</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Footer */}
          {shopDetails.footerText && (
            <div className="text-center pt-4 print:pt-8 print:border-t text-muted-foreground text-sm">
              {shopDetails.footerText}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice #{invoiceNumber}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBill}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}