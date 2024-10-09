import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtKey = process.env.JWT_KEY as string;

interface CustomRequest extends Request {
    user?: JwtPayload | string;
}

export const verifyToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.headers && req.headers['authorization']) { // Vérification explicite de req.headers
            const token = req.headers['authorization'];

            const payload = await new Promise<JwtPayload | string>((resolve, reject) => {
                jwt.verify(token, jwtKey, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded as JwtPayload | string);
                    }
                });
            });

            req.user = payload;
            next();
        } else {
            res.status(403).json({ message: "Accès interdit : token manquant" });
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: "Accès interdit : token invalide" });
    }
};


export const verifyUserToken = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (req.headers && req.headers['authorization']) { // Vérification explicite de req.headers
            const token = req.headers['authorization'];

            const payload = await new Promise<JwtPayload | string>((resolve, reject) => {
                jwt.verify(token, jwtKey, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded as JwtPayload | string);
                    }
                });
            });

            req.user = payload;

            if (typeof payload === 'object' && 'id' in payload && payload.id === req.params.user_id) {
                next();
            } else {
                res.status(403).json({ message: "Vous n'avez pas le bon token" });
            }
        } else {
            res.status(403).json({ message: "Accès interdit : token manquant" });
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: "Accès interdit : token invalide" });
    }
};
