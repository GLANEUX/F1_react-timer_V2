import mongoose from 'mongoose';
import request from 'supertest';
import { app, server } from '../app';  // Importer l'instance du serveur
import User from '../models/user.model';
import connectToDatabase from '../configs/database.config';  // Importer la fonction de connexion

beforeAll(async () => {
  // Utilisez la connexion centrale à MongoDB
  await connectToDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();  // Fermer le serveur après les tests
});
describe('User Routes', () => {
  describe('POST /users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Utilisateur créé: test@example.com');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).not.toBeNull();
    });

    it('should return 401 if email is already used', async () => {
      await request(app)
        .post('/users/register')
        .send({ email: 'test@example.com', password: 'Password123!' });

      const response = await request(app)
        .post('/users/register')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Cet email n'est pas disponible");
    });

    it('should return 401 if password does not meet the criteria', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial."
      );
    });

    it('should return 401 if email is invalid', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ email: 'invalidemail', password: 'Password123!' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("L'adresse email est invalide");
    });
  });
});
