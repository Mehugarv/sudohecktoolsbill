import React from "react";
import { Link, useLocation } from "wouter";
import { storage } from "../../lib/storage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  FileText,
  Settings,
  BarChart2,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  Bell,
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

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideIn = {
  hidden: { x: "-100%" },
  visible: { 
    x: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    }
  },
  exit: { 
    x: "-100%", 
    transition: { 
      ease: "easeInOut", 
      duration: 0.3 
    }
  }
};

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
    // Will be implemented with actual functionality
  };

  const handleLogout = () => {
    toast({
      title: "Not implemented",
      description: "Logout functionality not implemented yet.",
    });
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Inventory", href: "/inventory", icon: ShoppingBag },
    { name: "Billing", href: "/billing", icon: FileText },
    { name: "Customers", href: "/customers", icon: User },
    { name: "Reports", href: "/reports", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Animated shapes for background
  const AnimatedShapes = () => (
    <div className="animated-shapes">
      <div className="shape"></div>
      <div className="shape"></div>
      <div className="shape"></div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Animated background shapes */}
      <AnimatedShapes />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="button-pop"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </Button>
            )}
            <Link href="/">
              <a className="flex items-center gap-2">
                <motion.span 
                  className="font-bold text-xl gradient-text"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {shopDetails.name || "BillMaker Pro"}
                </motion.span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="mx-auto flex items-center space-x-4 lg:space-x-6">
              {navigation.map((item, index) => {
                const isActive = location === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={item.href}>
                      <a
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all hover:text-primary hover:bg-primary/10 button-pop ${
                          isActive
                            ? "bg-primary/15 text-primary font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </a>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {/* Quick actions */}
            <Button 
              variant="default" 
              size="sm" 
              className="hidden md:flex button-pop"
              onClick={handleCreateBill}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative button-pop"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full button-pop"
                >
                  <motion.span 
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-500 text-primary-foreground"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {shopDetails.name ? shopDetails.name[0] : "U"}
                  </motion.span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {shopDetails.name}
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
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
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
          <motion.div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <motion.div 
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg" 
              onClick={e => e.stopPropagation()}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideIn}
            >
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <Link href="/">
                    <a className="flex items-center">
                      <span className="font-bold text-xl gradient-text">
                        {shopDetails.name || "BillMaker Pro"}
                      </span>
                    </a>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="button-pop"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X size={20} />
                  </Button>
                </div>
                <motion.nav 
                  className="flex flex-col space-y-1"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <Link href={item.href}>
                          <a
                            className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors hover:bg-primary/10 hover:text-primary ${
                              isActive
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.name}
                          </a>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                <div className="mt-auto pt-6">
                  <Button className="w-full button-pop" onClick={handleCreateBill}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Bill
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 container py-6 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="w-full border-t bg-background/80 backdrop-blur-sm py-4 relative z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} {shopDetails.name || "BillMaker Pro"}. All rights reserved.
          </p>
          <nav className="flex gap-4 md:gap-6">
            <Link href="/about">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                About
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}