import { ShopDetails, InventoryItem, Bill, Category } from "@shared/schema";

const SHOP_DETAILS_KEY = "billmaker_shop_details";
const INVENTORY_KEY = "billmaker_inventory";
const BILL_HISTORY_KEY = "billmaker_bill_history";
const CATEGORIES_KEY = "billmaker_categories";
const SETTINGS_KEY = "billmaker_settings";

// Default shop details
const DEFAULT_SHOP_DETAILS: ShopDetails = {
  name: "Your Shop",
  address: "Shop Address",
  contact: "Contact Number",
  email: "",
  website: "",
  gst: "",
  logo: "",
  currency: "$",
  footerText: "Thank you for your business!",
  taxRate: 10,
  theme: "light",
};

export const storage = {
  // Shop Details
  getShopDetails: (): ShopDetails => {
    const stored = localStorage.getItem(SHOP_DETAILS_KEY);
    return stored ? { ...DEFAULT_SHOP_DETAILS, ...JSON.parse(stored) } : DEFAULT_SHOP_DETAILS;
  },

  saveShopDetails: (details: ShopDetails): void => {
    localStorage.setItem(SHOP_DETAILS_KEY, JSON.stringify(details));
  },

  // Categories
  getCategories: (): Category[] => {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveCategories: (categories: Category[]): void => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  addCategory: (category: Category): void => {
    const categories = storage.getCategories();
    categories.push(category);
    storage.saveCategories(categories);
  },

  updateCategory: (category: Category): void => {
    const categories = storage.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    if (index !== -1) {
      categories[index] = category;
      storage.saveCategories(categories);
    }
  },

  deleteCategory: (id: string): void => {
    const categories = storage.getCategories();
    const filtered = categories.filter((cat) => cat.id !== id);
    storage.saveCategories(filtered);
  },

  getCategoryById: (id: string): Category | undefined => {
    const categories = storage.getCategories();
    return categories.find((cat) => cat.id === id);
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveInventory: (inventory: InventoryItem[]): void => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
  },

  addInventoryItem: (item: InventoryItem): InventoryItem => {
    const now = new Date().toISOString();
    const inventory = storage.getInventory();
    const newItem = {
      ...item,
      createdAt: now,
      updatedAt: now
    };
    inventory.push(newItem);
    storage.saveInventory(inventory);
    return newItem;
  },

  updateInventoryItem: (item: InventoryItem): void => {
    const inventory = storage.getInventory();
    const index = inventory.findIndex((i) => i.id === item.id);
    if (index !== -1) {
      inventory[index] = {
        ...item,
        updatedAt: new Date().toISOString()
      };
      storage.saveInventory(inventory);
    }
  },

  deleteInventoryItem: (id: string): void => {
    const inventory = storage.getInventory();
    const filtered = inventory.filter((item) => item.id !== id);
    storage.saveInventory(filtered);
  },

  getInventoryItemById: (id: string): InventoryItem | undefined => {
    const inventory = storage.getInventory();
    return inventory.find((item) => item.id === id);
  },

  getInventoryByCategory: (categoryId: string): InventoryItem[] => {
    const inventory = storage.getInventory();
    return inventory.filter((item) => item.categoryId === categoryId);
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

  updateBill: (bill: Bill): void => {
    const history = storage.getBillHistory();
    const index = history.findIndex((b) => b.id === bill.id);
    if (index !== -1) {
      history[index] = bill;
      storage.saveBillHistory(history);
    }
  },

  getBillById: (id: string): Bill | undefined => {
    const history = storage.getBillHistory();
    return history.find((bill) => bill.id === id);
  },

  clearBillHistory: (): void => {
    localStorage.removeItem(BILL_HISTORY_KEY);
  },

  // App Settings
  getSetting: (key: string, defaultValue: any): any => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return defaultValue;
    
    const settings = JSON.parse(stored);
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  saveSetting: (key: string, value: any): void => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : {};
    settings[key] = value;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};

export const generateId = (): string => {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (value: number, currencySymbol?: string): string => {
  const shopDetails = storage.getShopDetails();
  const symbol = currencySymbol || shopDetails.currency || "$";
  return symbol + value.toFixed(2);
};

export const getPaymentMethodLabel = (method: string): string => {
  const methods: Record<string, string> = {
    "cash": "Cash",
    "credit_card": "Credit Card",
    "debit_card": "Debit Card",
    "bank_transfer": "Bank Transfer",
    "check": "Check",
    "online_payment": "Online Payment",
    "other": "Other"
  };
  return methods[method] || method;
};

export const getFormattedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
