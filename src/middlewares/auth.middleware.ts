import jwt from "jsonwebtoken";
import { NotAuthenticatedError } from "../lib/error-utils.ts";
import { JwtPayload } from "../lib/token-utils.ts";
import { getDb } from "../lib/db.ts";
import { COLLECTION_NAME as USER_COLLECTION_NAME } from "../models/user.model.ts";

const User = getDb().collection(USER_COLLECTION_NAME);

export const protectRoute = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return next(new NotAuthenticatedError("Not authenticated", 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        if (decoded.exp && (decoded.exp - Date.now()) > 10000) {
            return next(new NotAuthenticatedError("Token expired", 401));
        }

        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            return next(new NotAuthenticatedError("Not authorized", 403));
        }

        req.user = {
            username: user.username,
            _id: user._id
        };

        next();

    } catch (error) {
        console.log("Error in protectRoute middleware: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}