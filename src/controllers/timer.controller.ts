import { Request, Response } from "express";
import { TimerNew, AvgTime, TimerList } from "../services/timer.service";

interface TimerRequestBody {
  duration: number;
  description: string;
}

export const NewTimer = async (
  req: Request<{ user_id: string }, {}, TimerRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { duration, description } = req.body;
    const result = await TimerNew(user_id, duration, description);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

export const avgTime = async (
  req: Request<{ user_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const result = await AvgTime(user_id);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};

export const listTimer = async (
  req: Request<{ user_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const result = await TimerList(user_id);
    res.status(result.status!).json({ message: result.message });
  } catch (error) {
    // console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors du traitement" });
  }
};
