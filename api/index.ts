import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }

  // Handle the request
  app(req, res);
}