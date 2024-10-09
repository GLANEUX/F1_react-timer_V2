import Timer from "../models/timer.model";
import User from "../models/user.model";

interface TimerResult {
  message?: string;
  error?: string;
  status?: number;
  data?: any;
}
export const TimerNew = async (
    user_id: string,
    timer: string | number,
  ): Promise<TimerResult> => {
    try {
      // Vérification que l'utilisateur existe
      const user = await User.findById(user_id);

      if (!user) {
        return { message: "Utilisateur introuvable", status: 404 };
      }

      // Convertir la valeur du timer en nombre
      const timerString = String(timer).replace(',', '.'); // Remplacer les virgules par des points
      const timerValue = parseFloat(timerString); // Convertir en nombre flottant


      // Vérification que le timer est bien un nombre entier valide et supérieur à 0
      if (isNaN(timerValue) || timerValue <= 0 || !Number.isInteger(timerValue)) {
        return { message: "Le temps doit être un nombre entier en millisecondes, supérieur à 0.", status: 400 };
      }

      const newTimer = new Timer({ timer: timerValue, user_id });

      try {
        // Sauvegarder le nouveau timer
        const savedTimer = await newTimer.save();
        return { message: `Timer enregistré: ${savedTimer.timer}`, status: 201 };
      } catch (error) {
        console.error(error);
        return { message: "Requête invalide", status: 400 };
      }
    } catch (error) {
      console.error(error);
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
        return { message: "Timers récupérés avec succès", status: 200, data: timers };
      } catch (error) {
        return { message: "Requête invalide", status: 400 };
      }
    } catch (error) {
      return {
        message: "Une erreur s'est produite lors du traitement",
        status: 500,
      };
    }
  };
