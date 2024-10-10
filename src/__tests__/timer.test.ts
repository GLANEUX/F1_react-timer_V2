import mongoose from "mongoose";
import request from "supertest";
import { app, server } from "../app";
import User from "../models/user.model";
import connectToDatabase from "../configs/database.config";

beforeAll(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  server.close();
});

describe("Timer Routes", () => {
  describe("POST /:user_id/submit-reaction-time", () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      // Enregistrement de l'utilisateur
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Password123!" });

      // Récupérer l'utilisateur pour obtenir son ID
      const user = await User.findOne({ email: "test@example.com" });
      if (user && user._id) {
        userId = user._id.toString();
      } else {
        throw new Error("Utilisateur introuvable");
      }

      // Connexion pour récupérer le token JWT
      const loginResponse = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "Password123!" });

      token = loginResponse.body.token;
    });

    it("should create a new timer for the user", async () => {
      const response = await request(app)
        .post(`/timers/${userId}/submit-reaction-time`)
        .set("Authorization", `${token}`)
        .send({ timer: 1500 });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain("Timer enregistré");
    });

    it("should return 400 if the timer value is invalid", async () => {
      const response = await request(app)
        .post(`/timers/${userId}/submit-reaction-time`)
        .set("Authorization", `${token}`)
        .send({ timer: -100 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Le temps doit être un nombre entier en millisecondes, supérieur à 0."
      );
    });
  });

  describe("GET /:user_id/get-reaction-times", () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      // Enregistrement de l'utilisateur
      await request(app)
        .post("/users/register")
        .send({ email: "testpu@example.com", password: "Password123!" });

      // Récupérer l'utilisateur pour obtenir son ID
      const user = await User.findOne({ email: "testpu@example.com" });
      if (user && user._id) {
        userId = user._id.toString();
      } else {
        throw new Error("Utilisateur introuvable");
      }

      // Connexion pour récupérer le token JWT
      const loginResponse = await request(app)
        .post("/users/login")
        .send({ email: "testpu@example.com", password: "Password123!" });

      token = loginResponse.body.token;

    });
    it("should return that user don't have timer", async () => {
        const response = await request(app)
          .get(`/timers/${userId}/get-reaction-times`)
          .set("Authorization", `${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Aucun timer trouvé pour cet utilisateur");
      });
    it("should return all timers for the user", async () => {

      await request(app)
      .post(`/timers/${userId}/submit-reaction-time`)
      .set("Authorization", `${token}`)
      .send({ timer: 1500 });

      const response = await request(app)
        .get(`/timers/${userId}/get-reaction-times`)
        .set("Authorization", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Timers récupérés avec succès");
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });


  });
});
