import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI;

const connectToDatabase = async () => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the environment variables');
  }

  if (mongoose.connection.readyState === 1) {
    // Si une connexion est déjà active, n'essayez pas de vous reconnecter
    return mongoose.connection;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

export default connectToDatabase;
