import { Request, Response } from 'express';
import Timer from '../models/timer.model';
import User from '../models/user.model';


interface TimerRequestBody {
    duration: number;
    description?: string;
}

export const NewTimer = async (req: Request<{ user_id: string }, {}, TimerRequestBody>, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.user_id);

        if (!user) {
            res.status(404).json({ message: 'Utilisateur introuvable' });
            return;
        }

        const newTimer = new Timer({ ...req.body, user_id: req.params.user_id });

        try {
            const timer = await newTimer.save();
            res.status(201).json(timer);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "Requête invalide" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

export const avgTime = async (req: Request<{ user_id: string }>, res: Response): Promise<void> => {
    try {
        const timers = await Timer.find({ user_id: req.params.user_id });

        if (timers.length === 0) {
            res.status(404).json({ message: "Aucun timer trouvé pour cet utilisateur" });
            return;
        }

        try {
            const userId = req.params.user_id;
            const totalTimerValue = timers.reduce((acc, timer) => acc + (timer.timer || 0), 0); // Assurez-vous que `timer.timer` est défini et de type number
            const averageTimer = totalTimerValue / timers.length;

            res.status(200).json({ user_id: userId, average_timer: averageTimer });
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "Requête invalide" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};

export const listTimer = async (req: Request<{ user_id: string }>, res: Response): Promise<void> => {
    try {
        const timers = await Timer.find({ user_id: req.params.user_id });

        if (timers.length === 0) {
            res.status(404).json({ message: "Aucun timer trouvé pour cet utilisateur" });
            return;
        }

        try {
            res.status(200).json(timers);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: "Requête invalide" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur s'est produite lors du traitement" });
    }
};
