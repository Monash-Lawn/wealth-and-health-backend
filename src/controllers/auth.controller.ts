import brcyptjs from "bcryptjs";
import { InvalidDataError, NotAuthenticatedError } from "../lib/error-utils.ts";
import { generateToken } from "../lib/token-utils.ts";
import { getDb } from "../lib/db.ts";
import { COLLECTION_NAME as USER_COLLECTION_NAME } from "../models/user.model.ts";

const db = getDb();
const User = db.collection(USER_COLLECTION_NAME);

export const login = async (req: any, res: any, next: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new InvalidDataError("Username and password are required."));
    }

    const user = await User.findOne({ username });

    if (!user) {
        return next(new NotAuthenticatedError("Invalid credentials.", 401));
    }

    const isPasswordValid = await brcyptjs.compare(password, user!.password);

    if (!isPasswordValid) {
        return next(new NotAuthenticatedError("Invalid credentials.", 401));
    }

    const token = generateToken(user!._id as string, res);

    return res.status(200).json({ success: true, error: false, token });
}

export const register = async (req: any, res: any, next: any) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new InvalidDataError("Username and password are required."));
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return next(new InvalidDataError("Username already exists."));
    }

    const hashedPassword = await brcyptjs.hash(password, 10);

    const user = await User?.insertOne({ username, password: hashedPassword });

    const token = generateToken(user!.insertedId as string, res);

    return res.status(200).json({ success: true, error: false, token });
}
