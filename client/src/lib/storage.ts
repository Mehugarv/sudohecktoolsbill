import { ShopDetails, InventoryItem, Bill, Category, Customer } from "@shared/schema";

const SHOP_DETAILS_KEY = "billmaker_shop_details";
const INVENTORY_KEY = "billmaker_inventory";
const BILL_HISTORY_KEY = "billmaker_bill_history";
const CATEGORIES_KEY = "billmaker_categories";
const SETTINGS_KEY = "billmaker_settings";
const CUSTOMERS_KEY = "billmaker_customers";

// Default shop details
const DEFAULT_SHOP_DETAILS: ShopDetails = {
  name: "Your Shop",
  tagline: "Quality Products & Services",
  address: "Shop Address",
  city: "City",
  state: "State",
  postalCode: "000000",
  country: "Country",
  contact: "Contact Number",
  alternateContact: "",
  email: "",
  website: "",
  gst: "",
  pan: "",
  businessType: "Retail",
  registrationNumber: "",
  logo: "",
  currency: "₹",
  footerText: "Thank you for your business!",
  termsAndConditions: "1. All goods must be returned within 7 days with receipt.\n2. No refunds on damaged items.\n3. Prices include all applicable taxes.",
  bankDetails: "",
  invoicePrefix: "INV",
  taxRate: 18,
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
  getBills: (): Bill[] => {
    const stored = localStorage.getItem(BILL_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getBillHistory: (): Bill[] => {
    return storage.getBills(); // Alias for backward compatibility
  },

  saveBillHistory: (history: Bill[]): void => {
    localStorage.setItem(BILL_HISTORY_KEY, JSON.stringify(history));
  },

  addBill: (bill: Bill): void => {
    const history = storage.getBills();
    history.unshift(bill); // Add to beginning of array
    storage.saveBillHistory(history);
  },

  updateBill: (bill: Bill): void => {
    const history = storage.getBills();
    const index = history.findIndex((b) => b.id === bill.id);
    if (index !== -1) {
      history[index] = bill;
      storage.saveBillHistory(history);
    }
  },

  deleteBill: (id: string): void => {
    const history = storage.getBills();
    const filtered = history.filter((bill) => bill.id !== id);
    storage.saveBillHistory(filtered);
  },

  getBillById: (id: string): Bill | undefined => {
    const history = storage.getBills();
    return history.find((bill) => bill.id === id);
  },

  clearBillHistory: (): void => {
    localStorage.removeItem(BILL_HISTORY_KEY);
  },

  // Customers Management
  getCustomers: (): Customer[] => {
    const stored = localStorage.getItem(CUSTOMERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveCustomers: (customers: Customer[]): void => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  addCustomer: (customer: Customer): Customer => {
    const customers = storage.getCustomers();
    const newCustomer = {
      ...customer,
    };
    customers.push(newCustomer);
    storage.saveCustomers(customers);
    return newCustomer;
  },

  updateCustomer: (customer: Customer): void => {
    const customers = storage.getCustomers();
    const index = customers.findIndex((c) => c.name === customer.name);
    if (index !== -1) {
      customers[index] = customer;
      storage.saveCustomers(customers);
    }
  },

  deleteCustomer: (customer: Customer): void => {
    const customers = storage.getCustomers();
    const filtered = customers.filter((c) => c.name !== customer.name);
    storage.saveCustomers(filtered);
  },

  getCustomerByName: (name: string): Customer | undefined => {
    const customers = storage.getCustomers();
    return customers.find((c) => c.name === name);
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

  // Helper methods for business functionality
  generateInvoiceNumber: (): string => {
    const shopDetails = storage.getShopDetails();
    const prefix = shopDetails.invoicePrefix || 'INV';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const billCount = storage.getBillHistory().length + 1;
    return `${prefix}/${year}${month}/${billCount.toString().padStart(4, '0')}`;
  },
  
  // Data management
  resetData: (): void => {
    localStorage.removeItem(SHOP_DETAILS_KEY);
    localStorage.removeItem(INVENTORY_KEY);
    localStorage.removeItem(BILL_HISTORY_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CUSTOMERS_KEY);
  },
};

export const generateId = (): string => {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (value: number, currencySymbol?: string): string => {
  const shopDetails = storage.getShopDetails();
  
  // Make sure we have a valid currency symbol
  let symbol = currencySymbol || shopDetails.currency || "$";
  
  // Ensure symbol is not empty or just a dash
  if (!symbol || symbol === "-" || symbol.trim() === "") {
    symbol = "$";
  }
  
  // Format the number with proper spacing
  const formattedValue = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Return the formatted currency with the symbol
  return symbol + " " + formattedValue;
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

export const getFormattedDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

export const getDatePlusNDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};
