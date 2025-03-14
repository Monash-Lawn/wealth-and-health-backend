import { User } from "../models/index.ts";
import jwt from "jsonwebtoken";
import brcyptjs from "bcryptjs";
import { InvalidDataError, NotAuthenticatedError } from "../lib/error-utils.ts";
import { generateToken } from "../lib/token-utils.ts";

export const login = async (req: any, res: any, next: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new InvalidDataError("Username and password are required.");
    }

    const user = await User?.findOne({ username });

    if (!user) {
        throw new NotAuthenticatedError("Invalid credentials.", 401);
    }

    const isPasswordValid = await brcyptjs.compare(password, user.password);

    if (!isPasswordValid) {
        throw new NotAuthenticatedError("Invalid credentials.", 401);
    }

    const token = generateToken(user._id as string, res);

    return res.status(200).json({ success: true, error: false, token });
}

export const register = async (req: any, res: any, next: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new InvalidDataError("Username and password are required.");
    }

    const existingUser = await User?.findOne({ username });

    if (existingUser) {
        throw new InvalidDataError("Username already exists.");
    }

    const hashedPassword = await brcyptjs.hash(password, 10);

    const user = await User?.insertOne({ username, password: hashedPassword });

    const token = generateToken(user?.insertedId as string, res);

    return res.status(200).json({ success: true, error: false, token });
}
