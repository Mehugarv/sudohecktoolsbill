import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import Layout from "./components/layout";

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
      <Component />
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
