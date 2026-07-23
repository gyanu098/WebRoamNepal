jest.mock("../model/userModel", () => ({
  existingUser: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
const { existingUser } = require("../model/userModel");

describe("POST /api/users/login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ password: "password123" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "miss@gmail.com" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 401 if email is not registered", async () => {
    existingUser.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "miss@gmail.com", password: "password123" });

    expect(res.statusCode).toBe(401);
  });

  test("should return 401 if password does not match", async () => {
    existingUser.mockResolvedValue({
      id: 1,
      email: "miss@gmail.com",
      password: "hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "miss@gmail.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
  });

  test("should return 200 with a token and safe user on success", async () => {
    existingUser.mockResolvedValue({
      id: 1,
      email: "miss@gmail.com",
      password: "hashedPassword",
      role: "user",
    });
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "miss@gmail.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBe("miss@gmail.com");
  });
});
