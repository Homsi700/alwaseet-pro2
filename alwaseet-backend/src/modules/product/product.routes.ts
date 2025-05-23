// alwaseet-backend/src/modules/product/product.routes.ts
import { Router } from 'express';
import { getProductsController } from './product.controller';

const router = Router();

router.get('/products', getProductsController);

export default router;
