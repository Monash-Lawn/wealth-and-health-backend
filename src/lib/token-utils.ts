import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export interface JwtPayload extends DefaultJwtPayload {
    userId: string;
}

export const generateToken = (userId: string, res: any) => {
    const payload: JwtPayload = { userId };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '2d'
    });

    return token;
}