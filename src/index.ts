import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./lib/db.js";

// Collections init
import "./models/index.ts";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectToDatabase();
});