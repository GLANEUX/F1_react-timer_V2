import { Request, Response } from "express";
import {
  loginUser,
  RegisterUser,
  deleteUser,
  updateUser,
} from "../services/user.service";

interface UserRequestBody {
  email: string;
  password: string;
  role: boolean;
}

export const userRegister = async (
  req: Request<UserRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const result = await RegisterUser(email, password, role);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

export const userLogin = async (
  req: Request<UserRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

export const userDelete = async (
  req: Request<{ user_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const result = await deleteUser(user_id);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

export const userPut = async (
  req: Request<{ user_id: string }, {}, UserRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { email, password, role } = req.body;
    const result = await updateUser(email, password, role, user_id);

    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};
