import mongoose from 'mongoose';
import request from 'supertest';
import { app, server } from '../app';
import User from '../models/user.model';
import connectToDatabase from '../configs/database.config';

let userId: string;
let token: string;

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});

  // Créer un utilisateur avant les tests
  const registerResponse = await request(app)
    .post('/users/register')
    .send({ email: 'test-timer@example.com', password: 'Password123!' });

  console.log('Register Response Body:', registerResponse.body);

  // Vérifier la création de l'utilisateur
  const user = await User.findOne({ email: 'test-timer@example.com' });
  if (user && user._id) {
    userId = user._id.toString();
  } else {
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }

  // Connexion pour obtenir le token JWT
  const loginResponse = await request(app)
    .post('/users/login')
    .send({ email: 'test-timer@example.com', password: 'Password123!' });

  token = loginResponse.body.token;  // Sauvegarder le token pour l'utiliser dans les requêtes

  console.log('Login Response Token:', token);
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe('Timer Routes', () => {
  describe('POST /:user_id/submit-reaction-time', () => {
    it('should create a new timer for the user', async () => {
      const response = await request(app)
        .post(`/timers/${userId}/submit-reaction-time`)
        .set('Authorization', `Bearer ${token}`)
        .send({ timer: 1500 });

      console.log('POST Timer Response:', response.body);
      expect(response.status).toBe(201);
      expect(response.body.message).toContain('Timer enregistré');
    });

    it('should return 400 if the timer value is invalid', async () => {
      const response = await request(app)
        .post(`/timers/${userId}/submit-reaction-time`)
        .set('Authorization', `Bearer ${token}`)
        .send({ timer: -100 });

      console.log('POST Invalid Timer Response:', response.body);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Le temps doit être un nombre entier en millisecondes, supérieur à 0.'
      );
    });

    it('should return 404 if the user is not found', async () => {
      const response = await request(app)
        .post(`/timers/invalidUserId/submit-reaction-time`)
        .set('Authorization', `Bearer ${token}`)
        .send({ timer: 1500 });

      console.log('POST Invalid User Timer Response:', response.body);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Utilisateur introuvable');
    });
  });

  describe('GET /:user_id/get-reaction-times', () => {
    it('should return all timers for the user', async () => {
      const response = await request(app)
        .get(`/timers/${userId}/get-reaction-times`)
        .set('Authorization', `Bearer ${token}`);

      console.log('GET Timers Response:', response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Timers récupérés avec succès');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 if no timers are found for the user', async () => {
      const response = await request(app)
        .get(`/timers/invalidUserId/get-reaction-times`)
        .set('Authorization', `Bearer ${token}`);

      console.log('GET No Timers Response:', response.body);
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Utilisateur introuvable');
    });
  });
});
