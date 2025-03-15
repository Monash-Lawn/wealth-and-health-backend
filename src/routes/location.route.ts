import express from 'express';
import { createLocation, getLocation } from '../controllers/location.controller.ts';
import { protectRoute } from '../middlewares/auth.middleware.ts';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:id', getLocation);

// Protected routes (authentication required)
// TODO: ENABLE AUTHENTICATION
router.post('/', createLocation);

export default router;