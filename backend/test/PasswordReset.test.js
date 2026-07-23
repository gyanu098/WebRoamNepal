jest.mock("../model/userModel", () => ({
  existingUser: jest.fn(),
  updatePasswordByEmail: jest.fn(),
}));

jest.mock("../utils/mailer", () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedNewPassword"),
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const { existingUser, updatePasswordByEmail } = require("../model/userModel");
const { sendPasswordResetEmail } = require("../utils/mailer");

describe("POST /api/users/forgot-password", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if email is missing", async () => {
    const res = await request(app).post("/api/users/forgot-password").send({});
    expect(res.statusCode).toBe(400);
  });

  test("should return 200 without sending an email if the account does not exist", async () => {
    existingUser.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "unknown@gmail.com" });

    expect(res.statusCode).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test("should return 200 and send a reset email if the account exists", async () => {
    existingUser.mockResolvedValue({ email: "miss@gmail.com" });

    const res = await request(app)
      .post("/api/users/forgot-password")
      .send({ email: "miss@gmail.com" });

    expect(res.statusCode).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "miss@gmail.com",
      expect.stringContaining("/reset-password/")
    );
  });
});

describe("POST /api/users/reset-password/:token", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validToken = () =>
    jwt.sign(
      { email: "miss@gmail.com", purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

  test("should return 400 if password is missing or too short", async () => {
    const res = await request(app)
      .post(`/api/users/reset-password/${validToken()}`)
      .send({ password: "short" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 400 if the token is invalid or expired", async () => {
    const res = await request(app)
      .post("/api/users/reset-password/not-a-real-token")
      .send({ password: "newpassword123" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 400 if the token was not issued for password reset", async () => {
    const wrongPurposeToken = jwt.sign(
      { email: "miss@gmail.com", purpose: "something-else" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const res = await request(app)
      .post(`/api/users/reset-password/${wrongPurposeToken}`)
      .send({ password: "newpassword123" });

    expect(res.statusCode).toBe(400);
  });

  test("should return 200 and update the password on success", async () => {
    updatePasswordByEmail.mockResolvedValue({ id: 1, email: "miss@gmail.com" });

    const res = await request(app)
      .post(`/api/users/reset-password/${validToken()}`)
      .send({ password: "newpassword123" });

    expect(res.statusCode).toBe(200);
    expect(updatePasswordByEmail).toHaveBeenCalledWith(
      "miss@gmail.com",
      "hashedNewPassword"
    );
  });
});
