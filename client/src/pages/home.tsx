import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import ShopDetailsForm from "@/components/shop-details-form";
import InventoryManagement from "@/components/inventory-management";
import BillGenerator from "@/components/bill-generator";
import BillingHistory from "@/components/billing-history";
import EditItemDialog from "@/components/edit-item-dialog";
import PrintTemplate from "@/components/print-template";
import { storage } from "@/lib/storage";
import { ShopDetails, InventoryItem, Bill } from "@shared/schema";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shopDetails, setShopDetails] = useState<ShopDetails>(storage.getShopDetails());
  const [inventory, setInventory] = useState<InventoryItem[]>(storage.getInventory());
  const [billHistory, setBillHistory] = useState<Bill[]>(storage.getBillHistory());
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    setShopDetails(storage.getShopDetails());
    setInventory(storage.getInventory());
    setBillHistory(storage.getBillHistory());
  }, []);

  // Save shop details
  const handleSaveShopDetails = (details: ShopDetails) => {
    storage.saveShopDetails(details);
    setShopDetails(details);
    toast({
      title: "Success",
      description: "Shop details saved successfully",
    });
  };

  // Update inventory state
  const handleInventoryChange = () => {
    setInventory(storage.getInventory());
  };

  // Update bill history state
  const handleBillHistoryChange = () => {
    setBillHistory(storage.getBillHistory());
  };

  // Open edit modal for an item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 w-full lg:hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">BillMaker</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-700"
          >
            <i className="ri-menu-line text-xl">
              {isMobileMenuOpen ? "✕" : "☰"}
            </i>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } lg:flex flex-col bg-white border-r border-slate-200 w-full lg:w-80 xl:w-96 p-6 h-screen lg:sticky top-0 overflow-y-auto`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">BillMaker</h1>
          <p className="text-sm text-slate-500">Inventory & Bill Management</p>
        </div>

        <ShopDetailsForm shopDetails={shopDetails} onSave={handleSaveShopDetails} />
        
        <InventoryManagement 
          inventory={inventory} 
          onInventoryChange={handleInventoryChange} 
          onEditItem={handleEditItem}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <BillGenerator 
            inventory={inventory} 
            shopDetails={shopDetails} 
            onBillSaved={handleBillHistoryChange} 
          />
          
          <BillingHistory 
            billHistory={billHistory} 
            onHistoryChange={handleBillHistoryChange} 
          />
        </div>
      </main>

      {/* Edit Item Dialog */}
      <EditItemDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={editingItem}
        onSave={() => {
          handleInventoryChange();
          setIsEditModalOpen(false);
        }}
      />

      {/* Hidden Print Template */}
      <PrintTemplate />
    </div>
  );
}
