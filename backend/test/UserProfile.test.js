jest.mock("../dataBase/db", () => ({
  query: jest.fn(),
}));

jest.mock("../model/userModel", () => ({
  existingUser: jest.fn(),
  updatePasswordByEmail: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../middleware/uploads", () => ({
  single: () => (req, res, next) => {
    req.file = null;
    next();
  },
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../dataBase/db");
const { existingUser, updatePasswordByEmail } = require("../model/userModel");

const authToken = () =>
  jwt.sign({ id: 1, email: "miss@gmail.com", role: "user" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

describe("Authenticated profile routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/profile", () => {
    test("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/users/profile");
      expect(res.statusCode).toBe(401);
    });

    test("should return 200 with the current user", async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, name: "miss" }] });

      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${authToken()}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(1);
    });

    test("should return 500 if the query fails", async () => {
      pool.query.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${authToken()}`);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/users/profile", () => {
    test("should return 200 with the updated user", async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 1, name: "new name", bio: "hi" }],
      });

      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ name: "new name", email: "miss@gmail.com", bio: "hi" });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe("new name");
    });

    test("should return 500 if the update fails", async () => {
      pool.query.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ name: "new name" });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/users/change-password", () => {
    test("should return 400 if current or new password is missing", async () => {
      const res = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ currentPassword: "oldpassword" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 400 if the new password is too short", async () => {
      const res = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ currentPassword: "oldpassword", newPassword: "short" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 401 if the current password is incorrect", async () => {
      existingUser.mockResolvedValue({ email: "miss@gmail.com", password: "hashedOld" });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ currentPassword: "wrongpassword", newPassword: "newpassword123" });

      expect(res.statusCode).toBe(401);
    });

    test("should return 200 when the password is changed successfully", async () => {
      existingUser.mockResolvedValue({ email: "miss@gmail.com", password: "hashedOld" });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("hashedNew");
      updatePasswordByEmail.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken()}`)
        .send({ currentPassword: "oldpassword", newPassword: "newpassword123" });

      expect(res.statusCode).toBe(200);
      expect(updatePasswordByEmail).toHaveBeenCalledWith("miss@gmail.com", "hashedNew");
    });
  });
});
