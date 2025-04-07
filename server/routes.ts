import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // This is a client-side only application
  // No API routes needed as we're using localStorage for storage
  
  // We're just using the Express server to serve the static files
  
  const httpServer = createServer(app);
  return httpServer;
}
