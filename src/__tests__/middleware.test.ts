import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../app';
import User from '../models/user.model';
import connectToDatabase from '../configs/database.config';

let token: string;
let userId: string;

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});

  // Créer un utilisateur
  const userResponse = await request(app)
    .post('/users/register')
    .send({ email: 'test-middleware@example.com', password: 'Password123!' });

    const user = await User.findOne({ email: 'test-middleware@example.com' });

    if (user && user._id) {
      userId = user._id.toString();
    } else {
      throw new Error('Utilisateur non trouvé ou sans identifiant après l\'enregistrement');
    }

  // Générer un token valide pour cet utilisateur
  token = jwt.sign({ id: userId, email: 'test-middleware@example.com' }, process.env.JWT_KEY as string, {
    expiresIn: '1h',
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe('Middleware - verifyToken', () => {
  it('should return 403 if token is missing', async () => {
    const response = await request(app)
      .get(`/timers/${userId}/get-reaction-times`); // Route protégée sans token

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Accès interdit : token manquant');
  });

  it('should return 403 if token is invalid', async () => {
    const response = await request(app)
      .get(`/timers/${userId}/get-reaction-times`)
      .set('Authorization', 'Bearer invalidToken'); // Route protégée avec un token invalide

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Accès interdit : token invalide');
  });

  it('should call next if token is valid', async () => {
    const response = await request(app)
      .get(`/timers/${userId}/get-reaction-times`)
      .set('Authorization', `Bearer ${token}`); // Route protégée avec un token valide

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Timers récupérés avec succès');
  });
});

describe('Middleware - verifyUserToken', () => {
  it('should return 403 if token does not match user_id', async () => {
    const anotherUserId = new mongoose.Types.ObjectId().toString(); // ID d'un autre utilisateur

    const response = await request(app)
      .get(`/timers/${anotherUserId}/get-reaction-times`)
      .set('Authorization', `Bearer ${token}`); // Token valide, mais ne correspond pas à user_id

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Vous n'avez pas le bon token");
  });

  it('should call next if token matches user_id', async () => {
    const response = await request(app)
      .get(`/timers/${userId}/get-reaction-times`)
      .set('Authorization', `Bearer ${token}`); // Token valide et correspond à user_id

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Timers récupérés avec succès');
  });
});
