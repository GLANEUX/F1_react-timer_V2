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

describe("User Routes", () => {
  describe("POST /users/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Password123!" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Utilisateur créé: test@example.com");

      const user = await User.findOne({ email: "test@example.com" });
      expect(user).not.toBeNull();
    });

    it("should return 401 if email is already used", async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Password123!" });

      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Password123!" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Cet email n'est pas disponible");
    });

    it("should return 401 if password does not meet the criteria", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "pass" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial."
      );
    });

    it("should return 401 if email is invalid", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({ email: "invalidemail", password: "Password123!" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("L'adresse email est invalide");
    });
    it("should return 401 if role is invalid", async () => {
      const response = await request(app)
        .post("/users/register")
        .send({
          email: "test@example.com",
          password: "Password123!",
          role: "8",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Le role doit être à false|true ou 0|1"
      );
    });
  });

  describe("POST /users/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/users/register")
        .send({ email: "test@example.com", password: "Password123!" });
    });

    it("should login an existing user successfully", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "Password123!" });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined(); // Vérifie si le token est défini
    });

    it("should return 401 if the password is incorrect", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ email: "test@example.com", password: "WrongPassword123!" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Email ou mot de passe incorrect");
    });

    it("should return 404 if the user is not found", async () => {
      const response = await request(app)
        .post("/users/login")
        .send({ email: "nonexistent@example.com", password: "Password123!" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Utilisateur non trouvé");
    });
  });

  describe("PUT /users/:user_id", () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      // Enregistrement de l'utilisateur
      await request(app)
        .post("/users/register")
        .send({ email: "testpu@example.com", password: "Password123!" });

      await request(app)
        .post("/users/register")
        .send({ email: "double@example.com", password: "Password123!" });

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

    it("should update the user successfully", async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `${token}`)
        .send({
          email: "updated@example.com",
          password: "UpdatedPassword123!",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        "Utilisateur modifié: updated@example.com"
      );

      const updatedUser = await User.findById(userId);
      expect(updatedUser?.email).toBe("updated@example.com");
    });

    it("should return 401 if email is already used", async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `${token}`)
        .send({
          email: "double@example.com",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Cet email n'est pas disponible");
    });

    it("should return 401 if password does not meet the criteria", async () => {
      const response = await request(app)
        .put(`/users/${userId}`)
        .set("Authorization", `${token}`)
        .send({ password: "pass" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Le mot de passe doit faire au moins 5 caractères et contenir au moins une majuscule, une minuscule, un chiffre, et un caractère spécial."
      );
    });


    it("should return 401 if role is invalid", async () => {
      const response = await request(app)
      .put(`/users/${userId}`)
      .set("Authorization", `${token}`)
      .send({
          role: "8",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe(
        "Le role doit être à false|true ou 0|1"
      );
    });

  });

  describe('DELETE /users/:user_id', () => {
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

    it('should delete the user successfully', async () => {
      const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Utilisateur supprimé');

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

  });
});
