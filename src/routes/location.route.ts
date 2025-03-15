import express from 'express';
import { createLocation, getLocation } from '../controllers/location.controller.ts';
import { protectRoute } from '../middlewares/auth.middleware.ts';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:id', getLocation);

// Protected routes (authentication required)
router.post('/', protectRoute, createLocation);

export default router;