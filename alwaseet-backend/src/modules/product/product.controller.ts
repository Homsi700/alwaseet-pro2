// alwaseet-backend/src/modules/product/product.controller.ts
import { Request, Response } from 'express';
import { getProductsService } from './product.service';

export const getProductsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getProductsService();
    res.status(200).json(products);
  } catch (error) {
    // Log the error for server-side inspection
    console.error('Error in getProductsController:', error);
    // Send a generic error message to the client
    res.status(500).json({ message: 'Failed to fetch products. Please try again later.' });
  }
};
