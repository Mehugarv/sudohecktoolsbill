import React from "react";
import { Link, useLocation } from "wouter";
import { storage } from "../../lib/storage";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Home,
  ShoppingBag,
  FileText,
  Settings,
  Menu,
  X,
  BellRing,
  PlusCircle,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "../../hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const shopDetails = storage.getShopDetails();

  const handleCreateBill = () => {
    toast({
      title: "Creating new bill",
      description: "Preparing bill creation form...",
    });
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Inventory", href: "/inventory", icon: ShoppingBag },
    { name: "Billing", href: "/billing", icon: FileText },
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
                <span className="font-bold text-xl text-purple-600">
                  {shopDetails.name || "Your Shop"}
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center px-4 py-2 text-sm 
                    ${isActive ? "text-purple-700" : "text-gray-600 hover:text-purple-700"}`}
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
              className="primary-button hidden md:flex" 
              onClick={handleCreateBill}
            >
              <span className="mr-1">Create Bill</span>
            </Button>
            
            {/* Notification Bell */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 hover:text-purple-700 relative"
            >
              <BellRing size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full bg-purple-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-purple-700 text-sm font-medium">
                    {shopDetails.name ? shopDetails.name[0] : "U"}
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
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 shadow-lg" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <a className="flex items-center">
                    <span className="font-bold text-xl text-purple-600">
                      {shopDetails.name || "Your Shop"}
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
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`flex items-center px-3 py-2 text-sm rounded-md 
                        ${isActive 
                          ? "bg-purple-100 text-purple-700 font-medium" 
                          : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6">
                <Button className="primary-button w-full" onClick={handleCreateBill}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Bill
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4">{children}</main>
    </div>
  );
}