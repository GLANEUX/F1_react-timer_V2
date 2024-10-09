import { Schema, model, Document } from 'mongoose';

interface Timer extends Document {
    user_id: string;
    timer: number;
}

const timerSchema = new Schema<Timer>({
    user_id: {
        type: String,
        required: true,
    },
    timer: {
        type: Number,
        required: true,
    }
});

export default model<Timer>('Timer', timerSchema);
