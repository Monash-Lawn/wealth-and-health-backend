import { ObjectId } from '@datastax/astra-db-ts';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (userId: string, res: any) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET as string, {
        expiresIn: '2d'
    });

    return token;
}