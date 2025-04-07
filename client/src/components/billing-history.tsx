import { useState } from "react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bill } from "@shared/schema";
import { storage, formatCurrency, getFormattedDate } from "@/lib/storage";
import { History, Eye, FileDown, AlertTriangle } from "lucide-react";

interface BillingHistoryProps {
  billHistory: Bill[];
  onHistoryChange: () => void;
}

export default function BillingHistory({ billHistory, onHistoryChange }: BillingHistoryProps) {
  const { toast } = useToast();
  
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all billing history? This cannot be undone.")) {
      storage.clearBillHistory();
      onHistoryChange();
      
      toast({
        title: "History Cleared",
        description: "Billing history has been cleared",
      });
    }
  };
  
  const handleViewBill = (bill: Bill) => {
    // In a real app, we would generate the bill view
    // For this demo, we'll show a toast
    toast({
      title: `Invoice #${bill.id.slice(-3)}`,
      description: `Viewing bill for ${bill.customer}`,
    });
  };
  
  const handleDownloadBill = (bill: Bill) => {
    try {
      const doc = new jsPDF();
      
      // Get shop details from local storage
      const shopDetails = storage.getShopDetails();
      
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
      doc.text(`Customer: ${bill.customer}`, 150, 48, { align: "right" });
      
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
        doc.text(item.name, 20, y);
        doc.text(formatCurrency(item.price), 100, y);
        doc.text(item.quantity.toString(), 130, y);
        doc.text(formatCurrency(item.total), 160, y);
        y += 8;
      });
      
      doc.line(20, y, 190, y);
      y += 8;
      
      // Totals
      doc.text("Subtotal:", 130, y);
      doc.text(formatCurrency(bill.subtotal), 160, y);
      y += 8;
      
      doc.text("Tax (10%):", 130, y);
      doc.text(formatCurrency(bill.tax), 160, y);
      y += 8;
      
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 130, y);
      doc.text(formatCurrency(bill.total), 160, y);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your business!", 105, 250, { align: "center" });
      doc.text("Generated with BillMaker", 105, 255, { align: "center" });
      
      // Save the PDF
      doc.save(`Invoice-${bill.id.slice(-3)}.pdf`);
      
      toast({
        title: "Success",
        description: "Bill downloaded as PDF",
      });
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
    <Card className="mt-8">
      <CardHeader className="border-b border-slate-200 flex flex-row justify-between items-center">
        <CardTitle className="flex items-center text-xl">
          <History className="mr-2 h-5 w-5 text-secondary" /> Recent Bills
        </CardTitle>
        {billHistory.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:bg-red-50"
            onClick={handleClearHistory}
          >
            Clear History
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {billHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>No billing history yet</p>
            <p className="text-sm">Generated bills will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {billHistory.map((bill) => (
              <li key={bill.id} className="py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Invoice #{bill.id.slice(-3)}</h3>
                    <p className="text-sm text-slate-500">Customer: {bill.customer}</p>
                    <p className="text-xs text-slate-400">
                      {getFormattedDate(bill.date)} • {bill.items.length} items • {formatCurrency(bill.total)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary"
                      onClick={() => handleViewBill(bill)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => handleDownloadBill(bill)}
                    >
                      <FileDown className="mr-1 h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
