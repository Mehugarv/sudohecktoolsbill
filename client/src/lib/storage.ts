import { ShopDetails, InventoryItem, Bill } from "@shared/schema";

const SHOP_DETAILS_KEY = "billmaker_shop_details";
const INVENTORY_KEY = "billmaker_inventory";
const BILL_HISTORY_KEY = "billmaker_bill_history";

// Default shop details
const DEFAULT_SHOP_DETAILS: ShopDetails = {
  name: "Your Shop",
  address: "Shop Address",
  contact: "Contact Number",
  gst: "",
};

export const storage = {
  // Shop Details
  getShopDetails: (): ShopDetails => {
    const stored = localStorage.getItem(SHOP_DETAILS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SHOP_DETAILS;
  },

  saveShopDetails: (details: ShopDetails): void => {
    localStorage.setItem(SHOP_DETAILS_KEY, JSON.stringify(details));
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveInventory: (inventory: InventoryItem[]): void => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  },

  addInventoryItem: (item: InventoryItem): void => {
    const inventory = storage.getInventory();
    inventory.push(item);
    storage.saveInventory(inventory);
  },

  updateInventoryItem: (item: InventoryItem): void => {
    const inventory = storage.getInventory();
    const index = inventory.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      inventory[index] = item;
      storage.saveInventory(inventory);
    }
  },

  deleteInventoryItem: (id: string): void => {
    const inventory = storage.getInventory();
    const filtered = inventory.filter((item) => item.id !== id);
    storage.saveInventory(filtered);
  },

  // Bill History
  getBillHistory: (): Bill[] => {
    const stored = localStorage.getItem(BILL_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveBillHistory: (history: Bill[]): void => {
    localStorage.setItem(BILL_HISTORY_KEY, JSON.stringify(history));
  },

  addBill: (bill: Bill): void => {
    const history = storage.getBillHistory();
    history.unshift(bill); // Add to beginning of array
    storage.saveBillHistory(history);
  },

  clearBillHistory: (): void => {
    localStorage.removeItem(BILL_HISTORY_KEY);
  },
};

export const generateId = (): string => {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (value: number): string => {
  return "$" + value.toFixed(2);
};

export const getFormattedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
