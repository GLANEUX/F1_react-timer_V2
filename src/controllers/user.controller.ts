import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/user.model';

dotenv.config();

const saltRounds = 10;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;

interface UserRequestBody {
    email: string;
    password: string;
    role?: boolean;
}

export const userRegister = async (req: Request<{}, {}, UserRequestBody>, res: Response): Promise<void> => {
    try {
        const newUser = new User(req.body);
        const passwordUser = newUser.password;

        if (!passwordRegex.test(passwordUser)) {
            res.status(401).json({
                message: "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial."
            });
            return;
        }

        if (!newUser.role) {
            newUser.role = true;
        }

        newUser.password = await bcrypt.hash(newUser.password, saltRounds);
        const user = await newUser.save();
        res.status(201).json({ message: `Utilisateur créé: ${user.email}` });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Requête invalide" });
    }
};

export const userLogin = async (req: Request<{}, {}, { email: string; password: string }>, res: Response): Promise<void> => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            res.status(404).json({ message: "Utilisateur non trouvé" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (user.email === req.body.email && isPasswordValid) {
            const userData = {
                id: user._id,
                email: user.email,
                role: user.role,
            };
            const token = jwt.sign(userData, process.env.JWT_KEY as string, { expiresIn: "10h" });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

export const userDelete = async (req: Request<{ user_id: string }>, res: Response): Promise<void> => {
    try {
        await User.findByIdAndDelete(req.params.user_id);
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

export const userPut = async (req: Request<{ user_id: string }, {}, UserRequestBody>, res: Response): Promise<void> => {
    try {
        if (req.body.password) {
            if (!passwordRegex.test(req.body.password)) {
                res.status(401).json({
                    message: "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial."
                });
                return;
            }
            req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        const user = await User.findByIdAndUpdate(req.params.user_id, req.body, { new: true });

        if (user) {
            res.status(201).json({ message: `Utilisateur modifié: ${user.email}` });
        } else {
            res.status(404).json({ message: 'Utilisateur introuvable' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};
