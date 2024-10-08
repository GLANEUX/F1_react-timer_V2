import { Schema, model, Document } from 'mongoose';
import validator from 'validator';

interface IUser extends Document {
    email: string;
    password: string;
    role: boolean;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, 'L\'adresse email est requise'],
        unique: true,
        validate: {
            validator: (email: string) => validator.isEmail(email),
            message: 'L\'adresse email est invalide'
        }
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
    },
    role: {
        type: Boolean,
        required: [true, 'Le rôle est requis'], 
    }
});

export default model<IUser>('User', userSchema);
