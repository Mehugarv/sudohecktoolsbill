import React from "react";
import { Link, useLocation } from "wouter";
import { storage } from "../../lib/storage";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
            <Link href="/">
              <a className="flex items-center gap-2">
                <span className="font-bold text-xl text-primary">
                  {shopDetails.name || "BillMaker"}
                </span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="mx-auto flex items-center space-x-4 lg:space-x-6">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`flex items-center px-2 py-1 text-sm font-medium transition-colors hover:text-primary ${
                        isActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {shopDetails.name ? shopDetails.name[0] : "U"}
                  </span>
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
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
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
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/">
                  <a className="flex items-center">
                    <span className="font-bold text-xl text-primary">
                      {shopDetails.name || "BillMaker"}
                    </span>
                  </a>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted ${
                          isActive
                            ? "bg-muted text-primary font-semibold"
                            : "text-muted-foreground"
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
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container py-6">{children}</main>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} {shopDetails.name || "BillMaker"}. All rights reserved.
          </p>
          <nav className="flex gap-4 md:gap-6">
            <Link href="/about">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary">
                About
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary">
                Privacy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-sm font-medium text-muted-foreground hover:text-primary">
                Terms
              </a>
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}