import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";
dotenv.config();

const saltRounds = 10;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;

interface UserResult {
  message?: string;
  error?: string;
  status?: number;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<UserResult> => {
  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });

  if (!user) {
    return { message: "Utilisateur non trouvé", status: 404 };
  }

  // Vérifie le mot de passe

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { message: "Email ou mot de passe incorrect", status: 401 };
  }

  const userData = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(userData, process.env.JWT_KEY as string, {
    expiresIn: "10h",
  });

  return { message: `token: ${token}`, status: 200 };
};

export const RegisterUser = async (
  email: string,
  password: string,
  role: boolean
): Promise<UserResult> => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { message: "Cet email n'est pas disponible", status: 401 };
    }

    // Valider le mot de passe
    if (!passwordRegex.test(password)) {
      return {
        message:
          "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial.",
        status: 401,
      };
    }

    // Créer un nouvel utilisateur
    const newUser = new User({ email, password, role });

    if (!newUser.role) {
      newUser.role = true;
    }

    // Hachage du mot de passe
    newUser.password = await bcrypt.hash(newUser.password, saltRounds);
    const user = await newUser.save();

    return { message: `Utilisateur créé: ${user.email}`, status: 201 };
  } catch (error: any) {
    // Gérer l'erreur MongoDB de duplication
    if (error.code === 11000) {
      return { message: "Cet email est déjà utilisé.", status: 409 };
    }

    // Gérer toute autre erreur
    console.error(error);
    return {
      message: "Une erreur s'est produite lors de l'enregistrement",
      status: 500,
    };
  }
};

export const deleteUser = async (
    user_id: string
): Promise<UserResult> => {
  await User.findByIdAndDelete(user_id);
  return { message: "Utilisateur supprimé", status: 200 };
};

export const updateUser = async (
  email: string,
  password: string,
  role: boolean,
  user_id: string
): Promise<UserResult> => {
  if (password) {
    if (!passwordRegex.test(password)) {
      return {
        message:
          "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial.",
        status: 401,
      };
    }
    password = await bcrypt.hash(password, saltRounds);
  }

  const modify = { email, password, role };

  const user = await User.findByIdAndUpdate(user_id, modify, {
    new: true,
  });

  if (user) {
    return { message: `Utilisateur modifié: ${user.email}`, status: 201 };
  } else {
    return { message: "Utilisateur introuvable", status: 404 };
  }
};
