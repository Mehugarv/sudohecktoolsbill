import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { storage } from "../../lib/storage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PackageSearch,
  Receipt,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  PlusCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "../../hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

// Mock notifications for this feature
const mockNotifications = [
  { id: 1, title: "New update available", description: "Version 2.0 is now available", read: false, time: "5m ago" },
  { id: 2, title: "Inventory alert", description: "3 items are running low on stock", read: false, time: "1h ago" },
  { id: 3, title: "Welcome to Bill Maker", description: "Thanks for using our application", read: true, time: "1d ago" },
];

export default function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const shopDetails = storage.getShopDetails();
  const [unreadCount, setUnreadCount] = useState(mockNotifications.filter(n => !n.read).length);

  const handleCreateBill = () => {
    navigate("/create-bill");
  };

  const markAllNotificationsAsRead = () => {
    setUnreadCount(0);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read"
    });
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventory", href: "/inventory", icon: PackageSearch },
    { name: "Billing", href: "/billing", icon: Receipt },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen app-background">
      {/* Header */}
      <header className="w-full header-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-purple-700"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
            <Link href="/">
              <a className="flex items-center gap-2">
                <span className="font-bold text-xl gradient-text">
                  Aryaman Ne Shopping Kari
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                              (item.href === "/" && location === "/dashboard");
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center px-4 py-2 text-sm rounded-md
                    ${isActive 
                      ? "bg-purple-100 text-purple-700 font-medium" 
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Create Bill Button */}
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white hidden md:flex" 
              onClick={handleCreateBill}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
            
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-600 hover:text-purple-700 relative"
                  onClick={() => setNotificationsOpen(true)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-auto px-2 py-1"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="cursor-pointer p-3 flex flex-col items-start">
                    <div className="flex w-full justify-between items-start">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-purple-700' : ''}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                    {!notification.read && <div className="h-1.5 w-1.5 bg-purple-600 rounded-full absolute top-3 right-2"></div>}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer p-2 text-center justify-center text-sm text-purple-700">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full bg-purple-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-purple-700 text-sm font-medium">
                    {shopDetails.name ? shopDetails.name[0].toUpperCase() : "A"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {shopDetails.name || "Your Shop"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {shopDetails.email || "No email"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-4 shadow-lg" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/">
                    <a className="flex items-center">
                      <span className="font-bold text-xl gradient-text">
                        Aryaman Ne Shopping Kari
                      </span>
                    </a>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-500"
                  >
                    <X size={20} />
                  </Button>
                </div>
                
                <nav className="flex flex-col space-y-1">
                  {navigation.map((item) => {
                    const isActive = location === item.href ||
                                    (item.href === "/" && location === "/dashboard");
                    return (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`flex items-center justify-between px-3 py-3 text-sm rounded-md 
                          ${isActive 
                            ? "bg-purple-100 text-purple-700 font-medium" 
                            : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </a>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-6">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleCreateBill}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Bill
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Dialog for Mobile */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Stay updated with the latest information about your business.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-auto">
            {mockNotifications.map((notification) => (
              <div key={notification.id} className="p-3 rounded-lg border bg-card relative">
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-purple-700' : ''}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                {!notification.read && (
                  <div className="absolute top-3 right-3 h-2 w-2 bg-purple-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllNotificationsAsRead}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © 2025 Aryaman Ne Shopping Kari. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/about">
                <a className="text-sm text-gray-500 hover:text-purple-600">About</a>
              </Link>
              <Link href="/privacy">
                <a className="text-sm text-gray-500 hover:text-purple-600">Privacy</a>
              </Link>
              <Link href="/terms">
                <a className="text-sm text-gray-500 hover:text-purple-600">Terms</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}