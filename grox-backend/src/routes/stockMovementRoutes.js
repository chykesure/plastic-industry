// src/routes/stockMovementRoutes.js
import express from 'express';
const router = express.Router();

import {
  getStockMovements,
  recordStockMovement,
} from '../controllers/stockMovementController.js';

router.route('/:productId/movements')
  .get(getStockMovements)
  .post(recordStockMovement);

export default router;