import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import Layout from "./components/layout";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Inventory = lazy(() => import("./pages/inventory"));
const Billing = lazy(() => import("./pages/billing"));
const Customers = lazy(() => import("./pages/customers"));
const Reports = lazy(() => import("./pages/reports"));
const Settings = lazy(() => import("./pages/settings"));
const CreateBill = lazy(() => import("./pages/create-bill"));
const ViewBill = lazy(() => import("./pages/view-bill"));

// Loading component
const PageLoading = () => (
  <div className="w-full h-48 flex items-center justify-center">
    <div className="animate-pulse text-purple-600">Loading...</div>
  </div>
);

// Animated route component
const AnimatedRoute = ({ 
  component: Component, 
  ...rest 
}: { 
  component: React.ComponentType<any>; 
  [key: string]: any 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
      {...rest}
    >
      <Suspense fallback={<PageLoading />}>
        <Component />
      </Suspense>
    </motion.div>
  );
};

function Router() {
  const [location] = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/" component={() => <AnimatedRoute component={Home} />} />
          <Route path="/dashboard" component={() => <AnimatedRoute component={Home} />} />
          <Route path="/inventory" component={() => <AnimatedRoute component={Inventory} />} />
          <Route path="/billing" component={() => <AnimatedRoute component={Billing} />} />
          <Route path="/customers" component={() => <AnimatedRoute component={Customers} />} />
          <Route path="/reports" component={() => <AnimatedRoute component={Reports} />} />
          <Route path="/settings" component={() => <AnimatedRoute component={Settings} />} />
          <Route path="/create-bill" component={() => <AnimatedRoute component={CreateBill} />} />
          <Route path="/bills/:id" component={() => <AnimatedRoute component={ViewBill} />} />
          <Route component={() => <AnimatedRoute component={NotFound} />} />
        </Switch>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
