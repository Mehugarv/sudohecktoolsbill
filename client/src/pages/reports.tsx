import { useState, useEffect } from "react";
import { storage, formatCurrency, getFormattedDate } from "@/lib/storage";
import { Bill, InventoryItem } from "@shared/schema";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  CreditCard,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  RefreshCcw,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

type DateRange = "7days" | "30days" | "90days" | "year" | "all";

type PaymentStats = {
  method: string;
  count: number;
  amount: number;
};

type DailyStats = {
  date: string;
  sales: number;
  items: number;
};

type CategoryStats = {
  category: string;
  sales: number;
  value: number; // For pie chart
};

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [paymentStats, setPaymentStats] = useState<PaymentStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [revenueTrend, setRevenueTrend] = useState(0);
  const [billsTrend, setBillsTrend] = useState(0);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = () => {
    // Load bills and inventory data
    const allBills = storage.getBills();
    const allInventory = storage.getInventory();
    const customers = storage.getCustomers();
    
    setInventory(allInventory);
    setTotalCustomers(customers.length);

    // Filter bills based on date range
    const filteredBills = filterBillsByDate(allBills, dateRange);
    setBills(filteredBills);

    // Calculate summary statistics
    calculateSummaryStats(filteredBills);
    calculatePaymentStats(filteredBills);
    calculateDailyStats(filteredBills);
    calculateCategoryStats(filteredBills, allInventory);
    calculateTrends(allBills, filteredBills);
  };

  const filterBillsByDate = (bills: Bill[], range: DateRange): Bill[] => {
    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
      case "7days":
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        cutoffDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        cutoffDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case "year":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "all":
        // No filtering needed
        return bills;
      default:
        cutoffDate = new Date(now.setDate(now.getDate() - 30));
    }

    return bills.filter((bill) => new Date(bill.date) >= cutoffDate);
  };

  const calculateSummaryStats = (bills: Bill[]) => {
    const revenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    const itemCount = bills.reduce(
      (sum, bill) => sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    setTotalRevenue(revenue);
    setTotalBills(bills.length);
    setTotalItems(itemCount);
  };

  const calculatePaymentStats = (bills: Bill[]) => {
    const paymentMethods = new Map<string, { count: number; amount: number }>();

    bills.forEach((bill) => {
      const method = getPaymentMethodLabel(bill.paymentMethod);
      if (!paymentMethods.has(method)) {
        paymentMethods.set(method, { count: 0, amount: 0 });
      }
      const current = paymentMethods.get(method)!;
      paymentMethods.set(method, {
        count: current.count + 1,
        amount: current.amount + bill.total,
      });
    });

    const stats = Array.from(paymentMethods.entries()).map(
      ([method, { count, amount }]) => ({
        method,
        count,
        amount,
      })
    );

    setPaymentStats(stats);
  };

  const calculateDailyStats = (bills: Bill[]) => {
    const dailyData = new Map<string, { sales: number; items: number }>();

    // Get date range
    const dates: Date[] = [];
    const now = new Date();
    
    // Add dates based on selected range
    let daysToAdd = 30;
    switch (dateRange) {
      case "7days": daysToAdd = 7; break;
      case "30days": daysToAdd = 30; break;
      case "90days": daysToAdd = 90; break;
      case "year": daysToAdd = 365; break;
      case "all": 
        // For "all", we'll use the date of the oldest bill
        if (bills.length > 0) {
          const oldest = new Date(Math.min(...bills.map(b => new Date(b.date).getTime())));
          const daysDiff = Math.ceil((now.getTime() - oldest.getTime()) / (1000 * 3600 * 24));
          daysToAdd = daysDiff;
        }
        break;
    }

    // Initialize with zeroes for all dates
    for (let i = daysToAdd; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.set(dateStr, { sales: 0, items: 0 });
      dates.push(date);
    }

    // Fill in actual data
    bills.forEach((bill) => {
      const dateStr = new Date(bill.date).toISOString().split('T')[0];
      if (dailyData.has(dateStr)) {
        const current = dailyData.get(dateStr)!;
        const items = bill.items.reduce((sum, item) => sum + item.quantity, 0);
        dailyData.set(dateStr, {
          sales: current.sales + bill.total,
          items: current.items + items,
        });
      }
    });

    // Convert to array and sort by date
    const stats = Array.from(dailyData.entries())
      .map(([date, { sales, items }]) => ({
        date: getFormattedDate(date),
        sales,
        items,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setDailyStats(stats);
  };

  const calculateCategoryStats = (bills: Bill[], inventory: InventoryItem[]) => {
    // Create a map of item ID to its category
    const itemCategories = new Map<string, string>();
    inventory.forEach((item) => {
      const categoryName = item.categoryId || "Uncategorized";
      itemCategories.set(item.id, categoryName);
    });

    // Calculate sales by category
    const categories = new Map<string, number>();
    
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        // Since bill items don't have category info, we're using item name to match
        const matchingInventoryItem = inventory.find(invItem => invItem.name === item.name);
        const category = matchingInventoryItem?.categoryId || "Uncategorized";
        
        if (!categories.has(category)) {
          categories.set(category, 0);
        }
        categories.set(category, categories.get(category)! + item.total);
      });
    });

    // Convert to array format needed for the charts
    const stats = Array.from(categories.entries())
      .map(([category, sales], index) => ({
        category,
        sales,
        value: sales, // For pie chart
      }))
      .sort((a, b) => b.sales - a.sales);

    setCategoryStats(stats);
  };

  const calculateTrends = (allBills: Bill[], currentBills: Bill[]) => {
    // Calculate revenue trend
    const previousPeriodBills = getPreviousPeriodBills(allBills, currentBills);
    
    const currentRevenue = currentBills.reduce((sum, bill) => sum + bill.total, 0);
    const previousRevenue = previousPeriodBills.reduce((sum, bill) => sum + bill.total, 0);
    
    const revTrend = previousRevenue === 0 
      ? 100 
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    // Calculate bills count trend
    const billsTrend = previousPeriodBills.length === 0
      ? 100
      : ((currentBills.length - previousPeriodBills.length) / previousPeriodBills.length) * 100;
    
    setRevenueTrend(revTrend);
    setBillsTrend(billsTrend);
  };

  const getPreviousPeriodBills = (allBills: Bill[], currentBills: Bill[]): Bill[] => {
    if (dateRange === "all" || currentBills.length === 0) {
      return [];
    }
    
    // Find the earliest date in current bills
    const earliestDate = new Date(Math.min(...currentBills.map(b => new Date(b.date).getTime())));
    
    // Calculate the date range of current bills
    const latestDate = new Date(Math.max(...currentBills.map(b => new Date(b.date).getTime())));
    const daysDiff = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 3600 * 24)) + 1;
    
    // Calculate previous period start/end
    const previousPeriodEnd = new Date(earliestDate);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
    
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
    
    // Filter bills in previous period
    return allBills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= previousPeriodStart && billDate <= previousPeriodEnd;
    });
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case "cash": return "Cash";
      case "credit_card": return "Credit Card";
      case "debit_card": return "Debit Card";
      case "bank_transfer": return "Bank Transfer";
      case "check": return "Check";
      case "online_payment": return "Online Payment";
      case "other": return "Other";
      default: return method;
    }
  };

  const exportReport = () => {
    const reportDate = new Date().toISOString().split('T')[0];
    const csvRows = [
      ["Report Date", reportDate],
      ["Date Range", dateRange],
      [""],
      ["Summary Statistics"],
      ["Total Revenue", formatCurrency(totalRevenue)],
      ["Total Bills", totalBills.toString()],
      ["Total Items Sold", totalItems.toString()],
      ["Total Customers", totalCustomers.toString()],
      [""],
      ["Payment Method Statistics"],
      ["Method", "Count", "Amount"],
      ...paymentStats.map(stat => [
        stat.method,
        stat.count.toString(),
        formatCurrency(stat.amount)
      ]),
      [""],
      ["Daily Sales"],
      ["Date", "Sales", "Items Sold"],
      ...dailyStats.map(stat => [
        stat.date,
        formatCurrency(stat.sales),
        stat.items.toString()
      ]),
      [""],
      ["Category Sales"],
      ["Category", "Sales"],
      ...categoryStats.map(stat => [
        stat.category,
        formatCurrency(stat.sales)
      ])
    ];

    // Convert to CSV format
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${reportDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom formatter for currency in charts
  const currencyFormatter = (value: number) => {
    return formatCurrency(value);
  };

  const dateFormatter = (value: string) => {
    // Only show every nth label to avoid overcrowding
    const labels = dailyStats.map(stat => stat.date);
    const index = labels.indexOf(value);
    
    const skipFactor = labels.length > 30 ? 5 : (labels.length > 14 ? 3 : 1);
    if (index % skipFactor !== 0 && index !== labels.length - 1) {
      return '';
    }
    
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your business performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(value: DateRange) => setDateRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="btn-outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-with-hover bg-blur-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs flex items-center ${
                  revenueTrend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {revenueTrend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(revenueTrend).toFixed(1)}% from previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-with-hover bg-blur-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs flex items-center ${
                  billsTrend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {billsTrend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(billsTrend).toFixed(1)}% from previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-with-hover bg-blur-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                Average {totalBills > 0 ? (totalItems / totalBills).toFixed(1) : 0} items per bill
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-with-hover bg-blur-effect">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                In your customer database
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="tabs-container mb-4">
          <TabsTrigger value="revenue" className="tab-inactive">
            <LineChart className="h-4 w-4 mr-2" />
            Revenue Over Time
          </TabsTrigger>
          <TabsTrigger value="categories" className="tab-inactive">
            <PieChart className="h-4 w-4 mr-2" />
            Sales by Category
          </TabsTrigger>
          <TabsTrigger value="payments" className="tab-inactive">
            <BarChart3 className="h-4 w-4 mr-2" />
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="bg-blur-effect">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Daily revenue for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={dailyStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={dateFormatter}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tickFormatter={currencyFormatter} />
                      <Tooltip 
                        formatter={(value: number) => [currencyFormatter(value), "Revenue"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="Revenue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-blur-effect">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Breakdown of sales by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {categoryStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="category"
                        label={({ category, value, percent }) => 
                          `${category}: ${formatCurrency(value)} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [currencyFormatter(value), "Sales"]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="bg-blur-effect">
            <CardHeader>
              <CardTitle>Sales by Payment Method</CardTitle>
              <CardDescription>
                Breakdown of sales by payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {paymentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="method" />
                      <YAxis tickFormatter={currencyFormatter} />
                      <Tooltip
                        formatter={(value: number) => [currencyFormatter(value), "Amount"]}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Amount"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available for the selected time period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="card-with-hover bg-blur-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
              Popular Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentStats.length > 0 ? (
                paymentStats
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 4)
                  .map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span>{stat.method}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{stat.count} bills</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(stat.amount)}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No payment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-with-hover bg-blur-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-500" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills.length > 0 ? (
                getTopSellingItems(bills)
                  .slice(0, 4)
                  .map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.quantity} sold</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No sales data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get top selling items
function getTopSellingItems(bills: Bill[]) {
  const itemsMap = new Map<
    string,
    { name: string; quantity: number; total: number }
  >();

  bills.forEach((bill) => {
    bill.items.forEach((item) => {
      if (!itemsMap.has(item.name)) {
        itemsMap.set(item.name, {
          name: item.name,
          quantity: 0,
          total: 0,
        });
      }
      const current = itemsMap.get(item.name)!;
      itemsMap.set(item.name, {
        name: item.name,
        quantity: current.quantity + item.quantity,
        total: current.total + item.total,
      });
    });
  });

  return Array.from(itemsMap.values()).sort((a, b) => b.quantity - a.quantity);
}