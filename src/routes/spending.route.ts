import express from 'express';
import { createSpending, getUserSpendings, getSpendingById, updateSpending, deleteSpending } from '../controllers/spending.controller.ts';
import { protectRoute } from '../middlewares/auth.middleware.ts';

const router = express.Router();

// Create a new spending entry
router.post('/', createSpending);

// Get all spendings for a specific user
router.get('/', protectRoute, getUserSpendings);

// Get a specific spending by ID
router.get('/:id', getSpendingById);

// Update a spending entry
router.put('/', updateSpending);

// Delete a spending entry
router.delete('/:id', deleteSpending);

export default router;