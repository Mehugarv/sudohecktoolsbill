import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopDetails, InventoryItem, BillItem, Bill } from "@shared/schema";
import { storage, generateId, formatCurrency, getFormattedDate } from "@/lib/storage";
import { FileDown, Printer, RotateCcw, Receipt } from "lucide-react";

interface BillGeneratorProps {
  inventory: InventoryItem[];
  shopDetails: ShopDetails;
  onBillSaved: () => void;
}

export default function BillGenerator({ 
  inventory, 
  shopDetails, 
  onBillSaved 
}: BillGeneratorProps) {
  const [customerName, setCustomerName] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().substr(0, 10));
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  
  const { toast } = useToast();
  
  // Calculate totals when billItems change
  useEffect(() => {
    const newSubtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = shopDetails.taxRate / 100; // Convert percentage to decimal
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax;
    
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [billItems, shopDetails.taxRate]);
  
  const handleAddBillItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select an item and enter a valid quantity",
        variant: "destructive",
      });
      return;
    }
    
    const selectedItem = inventory.find(item => item.id === selectedItemId);
    
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Selected item not found in inventory",
        variant: "destructive",
      });
      return;
    }
    
    const newBillItem: BillItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: quantity,
      total: selectedItem.price * quantity,
    };
    
    setBillItems([...billItems, newBillItem]);
    
    // Reset form
    setSelectedItemId("");
    setQuantity(1);
    
    toast({
      title: "Item Added",
      description: `"${selectedItem.name}" added to bill`,
    });
  };
  
  const handleRemoveBillItem = (index: number) => {
    const newBillItems = [...billItems];
    newBillItems.splice(index, 1);
    setBillItems(newBillItems);
  };
  
  const handleResetBill = () => {
    if (billItems.length === 0) {
      toast({
        title: "Bill Empty",
        description: "Bill is already empty",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to reset the current bill?")) {
      setBillItems([]);
      setCustomerName("");
      setBillDate(new Date().toISOString().substr(0, 10));
      setSelectedItemId("");
      setQuantity(1);
      
      toast({
        title: "Bill Reset",
        description: "Bill has been reset",
      });
    }
  };
  
  const saveBillToHistory = (): Bill | null => {
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save empty bill",
        variant: "destructive",
      });
      return null;
    }
    
    const newBill: Bill = {
      id: generateId(),
      customer: {
        name: customerName.trim() || "Guest Customer",
        customerType: "individual"
      },
      date: billDate,
      createdAt: new Date().toISOString(),
      items: [...billItems],
      subtotal,
      tax,
      taxRate: shopDetails.taxRate,
      total,
      paymentMethod: "cash",
      discountType: "none",
      discountValue: 0,
      discountAmount: 0,
      isPaid: false
    };
    
    storage.addBill(newBill);
    onBillSaved();
    
    return newBill;
  };
  
  const handlePrintBill = () => {
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Nothing to print - bill is empty",
        variant: "destructive",
      });
      return;
    }
    
    // Save bill to history first
    const bill = saveBillToHistory();
    if (!bill) return;
    
    // Update print template
    const printTemplate = document.getElementById('print-template');
    if (!printTemplate) return;
    
    const printShopName = document.getElementById('print-shop-name');
    const printShopAddress = document.getElementById('print-shop-address');
    const printShopContact = document.getElementById('print-shop-contact');
    const printShopGst = document.getElementById('print-shop-gst');
    const printInvoiceId = document.getElementById('print-invoice-id');
    const printDate = document.getElementById('print-date');
    const printCustomerName = document.getElementById('print-customer-name');
    const printItems = document.getElementById('print-items');
    const printSubtotal = document.getElementById('print-subtotal');
    const printTax = document.getElementById('print-tax');
    const printTotal = document.getElementById('print-total');
    const printTaxLabel = document.querySelector('table tfoot tr:nth-child(2) td:first-child');
    
    if (printShopName) printShopName.textContent = shopDetails.name;
    if (printShopAddress) printShopAddress.textContent = shopDetails.address;
    if (printShopContact) printShopContact.textContent = shopDetails.contact;
    if (printShopGst) printShopGst.textContent = shopDetails.gst ? `GST: ${shopDetails.gst}` : '';
    if (printInvoiceId) printInvoiceId.textContent = bill.id.slice(-3);
    if (printDate) printDate.textContent = getFormattedDate(bill.date);
    if (printCustomerName) printCustomerName.textContent = bill.customer.name;
    
    // Populate items
    if (printItems) {
      printItems.innerHTML = '';
      
      bill.items.forEach(item => {
        const row = document.createElement('tr');
        // Truncate long item names
        const displayName = item.name.length > 50 ? item.name.substring(0, 47) + "..." : item.name;
        row.innerHTML = `
          <td class="py-2 border-b border-slate-200 max-w-[200px] overflow-hidden break-words" style="word-break: break-word;">${displayName}</td>
          <td class="py-2 border-b border-slate-200 text-right">${formatCurrency(item.price)}</td>
          <td class="py-2 border-b border-slate-200 text-right">${item.quantity}</td>
          <td class="py-2 border-b border-slate-200 text-right">${formatCurrency(item.total)}</td>
        `;
        printItems.appendChild(row);
      });
    }
    
    // Set totals
    if (printSubtotal) printSubtotal.textContent = formatCurrency(bill.subtotal);
    if (printTax) printTax.textContent = formatCurrency(bill.tax);
    if (printTotal) printTotal.textContent = formatCurrency(bill.total);
    if (printTaxLabel) printTaxLabel.textContent = `Tax (${bill.taxRate}%):`;
    
    // Open print dialog
    const printContents = printTemplate.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Reload page after printing
    window.location.reload();
  };
  
  const handleDownloadBill = () => {
    if (billItems.length === 0) {
      toast({
        title: "Error",
        description: "Nothing to download - bill is empty",
        variant: "destructive",
      });
      return;
    }
    
    // Save bill to history first
    const bill = saveBillToHistory();
    if (!bill) return;
    
    // Generate PDF
    try {
      const doc = new jsPDF();
      
      // Add shop details
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(shopDetails.name, 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(shopDetails.address, 105, 25, { align: "center" });
      doc.text(shopDetails.contact, 105, 30, { align: "center" });
      
      if (shopDetails.gst) {
        doc.text(`GST: ${shopDetails.gst}`, 105, 35, { align: "center" });
      }
      
      // Add bill details
      doc.line(20, 40, 190, 40);
      
      doc.setFontSize(11);
      doc.text(`Invoice #: ${bill.id.slice(-3)}`, 20, 48);
      doc.text(`Date: ${getFormattedDate(bill.date)}`, 20, 54);
      doc.text(`Customer: ${bill.customer.name}`, 150, 48, { align: "right" });
      
      doc.line(20, 60, 190, 60);
      
      // Table header
      doc.setFont("helvetica", "bold");
      doc.text("Item", 20, 68);
      doc.text("Price", 100, 68);
      doc.text("Qty", 130, 68);
      doc.text("Total", 160, 68);
      
      doc.line(20, 70, 190, 70);
      
      // Table content
      doc.setFont("helvetica", "normal");
      let y = 78;
      
      bill.items.forEach((item) => {
        // Truncate and split long item names into multiple lines if necessary
        let displayName = item.name;
        if (displayName.length > 50) {
          displayName = displayName.substring(0, 47) + "...";
        }
        
        const maxWidth = 75; // Maximum width for item name column
        const itemNameLines = doc.splitTextToSize(displayName, maxWidth);
        
        // Calculate line height based on number of lines
        const lineHeight = 5;
        // Limit to max 2 lines to prevent excessive space
        const linesCount = Math.min(itemNameLines.length, 2);
        const rowHeight = Math.max(8, linesCount * lineHeight);
        
        // Print each line of the item name (max 2 lines)
        for (let i = 0; i < linesCount; i++) {
          doc.text(itemNameLines[i], 20, y + (i * lineHeight));
        }
        
        // Print other columns at the vertical center of the row
        const verticalCenter = y + ((itemNameLines.length * lineHeight) / 2) - (lineHeight / 2);
        doc.text(formatCurrency(item.price), 100, verticalCenter);
        doc.text(item.quantity.toString(), 130, verticalCenter);
        doc.text(formatCurrency(item.total), 160, verticalCenter);
        
        y += rowHeight;
      });
      
      doc.line(20, y, 190, y);
      y += 8;
      
      // Totals
      doc.text("Subtotal:", 130, y);
      doc.text(formatCurrency(bill.subtotal), 160, y);
      y += 8;
      
      doc.text(`Tax (${bill.taxRate}%):`, 130, y);
      doc.text(formatCurrency(bill.tax), 160, y);
      y += 8;
      
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 130, y);
      doc.text(formatCurrency(bill.total), 160, y);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your business!", 105, 250, { align: "center" });
      doc.text("Generated with BillBuddy", 105, 255, { align: "center" });
      
      // Save the PDF
      doc.save(`Invoice-${bill.id.slice(-3)}.pdf`);
      
      toast({
        title: "Success",
        description: "Bill downloaded as PDF",
      });
      
      // Reset bill after downloading
      handleResetBill();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center text-xl">
          <Receipt className="mr-2 h-5 w-5 text-primary" /> Bill Generator
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bill-date">Date</Label>
            <Input
              id="bill-date"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="border-b border-slate-200 p-6">
        <h3 className="font-semibold mb-4">Add Items to Bill</h3>
        
        <form onSubmit={handleAddBillItem} className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label htmlFor="bill-item-select">Select Item</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger id="bill-item-select">
                  <SelectValue placeholder="Choose from inventory" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {`${item.name} - ${formatCurrency(item.price)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="bill-item-qty">Quantity</Label>
              <Input
                id="bill-item-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full">
                Add Item
              </Button>
            </div>
          </div>
        </form>
        
        <div className="overflow-x-auto">
          {billItems.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {billItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-normal break-words max-w-[200px] overflow-hidden">
                      {item.name.length > 50 ? item.name.substring(0, 47) + "..." : item.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">{item.quantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium">{formatCurrency(item.total)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveBillItem(index)}
                        className="text-slate-400 hover:text-destructive p-1"
                        title="Remove Item"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr className="border-t-2 border-slate-300">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold">Subtotal:</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(subtotal)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right">Tax ({shopDetails.taxRate}%):</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(tax)}</td>
                  <td></td>
                </tr>
                <tr className="bg-slate-100">
                  <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatCurrency(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Receipt className="h-8 w-8 mx-auto mb-2" />
              <p>No items added to the bill yet</p>
              <p className="text-sm">Select items from your inventory to add them</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 flex flex-wrap gap-3 justify-end p-6">
        <Button 
          variant="outline" 
          onClick={handleResetBill}
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Bill
        </Button>
        <Button 
          variant="secondary" 
          onClick={handlePrintBill}
        >
          <Printer className="mr-2 h-4 w-4" /> Print Bill
        </Button>
        <Button
          onClick={handleDownloadBill}
        >
          <FileDown className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
