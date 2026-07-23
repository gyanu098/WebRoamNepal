jest.mock("../model/feedbackModel", () => ({
  createFeedback: jest.fn(),
  getAllFeedback: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const { createFeedback, getAllFeedback } = require("../model/feedbackModel");

const tokenFor = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("POST /api/feedback/add", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if message is missing or blank", async () => {
    const res = await request(app)
      .post("/api/feedback/add")
      .send({ name: "miss", email: "miss@gmail.com", message: "   " });

    expect(res.statusCode).toBe(400);
  });

  test("should attach no user id for an anonymous submission", async () => {
    createFeedback.mockResolvedValue({ id: 1, message: "great app" });

    const res = await request(app)
      .post("/api/feedback/add")
      .send({ message: "great app" });

    expect(res.statusCode).toBe(201);
    expect(createFeedback).toHaveBeenCalledWith(null, null, null, "great app");
  });

  test("should attach the user id when a valid token is provided", async () => {
    createFeedback.mockResolvedValue({ id: 1, message: "great app" });

    const res = await request(app)
      .post("/api/feedback/add")
      .set("Authorization", `Bearer ${tokenFor({ id: 5, role: "user" })}`)
      .send({ message: "great app" });

    expect(res.statusCode).toBe(201);
    expect(createFeedback).toHaveBeenCalledWith(5, null, null, "great app");
  });

  test("should treat an invalid token as anonymous rather than rejecting", async () => {
    createFeedback.mockResolvedValue({ id: 1, message: "great app" });

    const res = await request(app)
      .post("/api/feedback/add")
      .set("Authorization", "Bearer not-a-real-token")
      .send({ message: "great app" });

    expect(res.statusCode).toBe(201);
    expect(createFeedback).toHaveBeenCalledWith(null, null, null, "great app");
  });

  test("should return 500 if saving fails", async () => {
    createFeedback.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/feedback/add")
      .send({ message: "great app" });

    expect(res.statusCode).toBe(500);
  });
});

describe("GET /api/feedback/all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/api/feedback/all");
    expect(res.statusCode).toBe(401);
  });

  test("should return 403 if the caller is not an admin", async () => {
    const res = await request(app)
      .get("/api/feedback/all")
      .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

    expect(res.statusCode).toBe(403);
  });

  test("should return 200 with all feedback for an admin", async () => {
    getAllFeedback.mockResolvedValue([{ id: 1, message: "great app" }]);

    const res = await request(app)
      .get("/api/feedback/all")
      .set("Authorization", `Bearer ${tokenFor({ id: 99, role: "admin" })}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.feedback).toHaveLength(1);
  });
});
