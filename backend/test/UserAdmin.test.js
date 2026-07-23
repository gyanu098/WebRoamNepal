jest.mock("../model/userModel", () => ({
  getAllusers: jest.fn(),
  getUserById: jest.fn(),
  deleteUserById: jest.fn(),
  updateUserById: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
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
const {
  getAllusers,
  getUserById,
  deleteUserById,
  updateUserById,
} = require("../model/userModel");

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

const adminToken = () => signToken({ id: 99, role: "admin" });
const userToken = () => signToken({ id: 1, role: "user" });

describe("Admin-only user routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/getAll", () => {
    test("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/users/getAll");
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 if the caller is not an admin", async () => {
      const res = await request(app)
        .get("/api/users/getAll")
        .set("Authorization", `Bearer ${userToken()}`);

      expect(res.statusCode).toBe(403);
    });

    test("should return 400 if no users are found", async () => {
      getAllusers.mockResolvedValue([]);

      const res = await request(app)
        .get("/api/users/getAll")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(400);
    });

    test("should return 200 with the list of users", async () => {
      getAllusers.mockResolvedValue([{ id: 1, name: "miss" }]);

      const res = await request(app)
        .get("/api/users/getAll")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toHaveLength(1);
    });
  });

  describe("GET /api/users/getUserById/:id", () => {
    test("should return 404 if user not found", async () => {
      getUserById.mockResolvedValue(undefined);

      const res = await request(app)
        .get("/api/users/getUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(404);
    });

    test("should return 200 with the user", async () => {
      getUserById.mockResolvedValue({ id: 1, name: "miss" });

      const res = await request(app)
        .get("/api/users/getUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.id).toBe(1);
    });
  });

  describe("DELETE /api/users/deleteUserById/:id", () => {
    test("should return 404 if user not found", async () => {
      deleteUserById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/api/users/deleteUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(404);
    });

    test("should return 200 when the user is deleted", async () => {
      deleteUserById.mockResolvedValue({ id: 1, name: "miss" });

      const res = await request(app)
        .delete("/api/users/deleteUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("PUT /api/users/updateUserById/:id", () => {
    test("should return 400 for an invalid role value", async () => {
      const res = await request(app)
        .put("/api/users/updateUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ role: "superadmin" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 400 if an admin tries to demote themselves", async () => {
      const res = await request(app)
        .put("/api/users/updateUserById/99")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ role: "user" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 404 if the user to update is not found", async () => {
      updateUserById.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/api/users/updateUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "new name" });

      expect(res.statusCode).toBe(404);
    });

    test("should return 200 and the updated user", async () => {
      updateUserById.mockResolvedValue({ id: 1, name: "new name" });

      const res = await request(app)
        .put("/api/users/updateUserById/1")
        .set("Authorization", `Bearer ${adminToken()}`)
        .send({ name: "new name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe("new name");
    });
  });
});
