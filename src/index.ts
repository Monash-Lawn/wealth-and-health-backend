import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./lib/db.js";
import spendingRoutes from "./routes/spending.route.ts";

import authRouter from "./routes/auth.route.ts";
import errorHandler from "./middlewares/error-handler.middleware.ts";

// Collections init
import "./models/index.ts";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

// Spending routes
app.use('/api/spendings', spendingRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectToDatabase();
});