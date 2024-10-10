import mongoose from 'mongoose';
import connectToDatabase from '../configs/database.config';
import dotenv from 'dotenv';

dotenv.config();

describe('Database Connection', () => {
  beforeAll(() => {
    // Désactive les logs de la console pendant les tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(async () => {
    jest.clearAllMocks();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  it('should connect to the database successfully', async () => {
    await connectToDatabase();
    expect(mongoose.connection.readyState).toBe(1); // readyState 1 signifie connecté
  });

  it('should return the existing connection if already connected', async () => {
    await connectToDatabase();
    const connectionSpy = jest.spyOn(mongoose, 'connect');

    await connectToDatabase();
    expect(connectionSpy).not.toHaveBeenCalled(); // Ne doit pas rappeler mongoose.connect
  });

  it('should throw an error if MONGO_URI is not defined', async () => {
    const originalMongoUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;

    await expect(connectToDatabase()).rejects.toThrow('MONGO_URI is not defined in the environment variables');

    // Remettre MONGO_URI pour les autres tests
    process.env.MONGO_URI = originalMongoUri;
  });

  it('should log an error if the connection fails', async () => {
    const originalMongoUri = process.env.MONGO_URI;
    process.env.MONGO_URI = 'invalid_mongo_uri'; // URI Mongo invalide

    const consoleErrorSpy = jest.spyOn(console, 'error');

    await connectToDatabase();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error connecting to MongoDB:'));

    process.env.MONGO_URI = originalMongoUri; // Restaurer la valeur correcte
  });
});
