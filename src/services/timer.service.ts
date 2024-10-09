import Timer from "../models/timer.model";
import User from "../models/user.model";

interface TimerResult {
  message?: string;
  error?: string;
  status?: number;
}

export const TimerNew = async (
  user_id: string,
  duration: number,
  description: string
): Promise<TimerResult> => {
  try {
    const user = await User.findById(user_id);

    if (!user) {
      return { message: "Utilisateur introuvable", status: 404 };
    }

    const newTimer = new Timer({ duration, description, user_id: user_id });

    try {
      const timer = await newTimer.save();
      return { message: `${timer}`, status: 201 };
    } catch (error) {
      console.error(error);
      return { message: "Requête invalide", status: 400 };
    }
  } catch (error) {
    // console.error(error);
    return {
      message: "Une erreur s'est produite lors du traitement",
      status: 500,
    };
  }
};

export const AvgTime = async (user_id: string): Promise<TimerResult> => {
  try {
    const timers = await Timer.find({ user_id: user_id });

    if (timers.length === 0) {
      return {
        message: "Aucun timer trouvé pour cet utilisateur",
        status: 404,
      };
    }

    try {
      const totalTimerValue = timers.reduce(
        (acc, timer) => acc + (timer.timer || 0),
        0
      );
      const averageTimer = totalTimerValue / timers.length;

      return {
        message: `user_id: ${user_id}, average_timer: ${averageTimer}`,
        status: 200,
      };
    } catch (error) {
      // console.error(error);
      return { message: "Requête invalide", status: 400 };
    }
  } catch (error) {
    // console.error(error);
    return {
      message: "Une erreur s'est produite lors du traitement",
      status: 500,
    };
  }
};

export const TimerList = async (user_id: string): Promise<TimerResult> => {
  try {
    const timers = await Timer.find({ user_id: user_id });

    if (timers.length === 0) {
      return {
        message: "Aucun timer trouvé pour cet utilisateur",
        status: 404,
      };
    }

    try {
      return { message: `${timers}`, status: 200 };
    } catch (error) {
      // console.error(error);
      return { message: "Requête invalide", status: 400 };
    }
  } catch (error) {
    // console.error(error);
    return {
      message: "Une erreur s'est produite lors du traitement",
      status: 500,
    };
  }
};
