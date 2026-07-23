jest.mock("../model/userModel", () => ({
  createUser: jest.fn(),
  existingUser: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
}));

jest.mock("../middleware/uploads", () => ({
    single:()=> (req, res, next) => {
        req.file = null;
        next();
    },
}));

const request = require("supertest");
const app= require("../server");
const bcrypt = require("bcrypt");
const { createUser, existingUser } = require("../model/userModel");


describe("POST /api/users/create", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("it should create a new user and return 201 status", async () => {
        const mockUser = {
            id:1,
            name: "miss",
            email: "miss@gmail.com",
            password: "password123",
            image: null,
        };

        existingUser.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("password123");
        createUser.mockResolvedValue(mockUser);

        const response = await request(app)
            .post("/api/users/create")
            .send({
                name: "miss",
                email: "miss@gmail.com",
                password: "password123"
            });

        expect(response.statusCode).toBe(201);


    });

    test("should return 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/users/create")
      .send({
        name:"John",
        password: "123456",
      });

    expect(res.statusCode).toBe(400);
  });

  
  test("should return 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/users/create")
      .send({
        name:  "John",
        email: "john@example.com",

      });

    expect(res.statusCode).toBe(400);
  });

  test("should return 409 if email is already registered", async () => {
    existingUser.mockResolvedValue({ id: 2, email: "john@example.com" });

    const res = await request(app)
      .post("/api/users/create")
      .send({
        name: "John",
        email: "john@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(409);
  });

  test("should return 500 if DB fails", async () => {
    existingUser.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed_password");

   
    createUser.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/users/create")
      .send({
        name:"John",
        email:"john@example.com",
        password:"123456",
      });

    expect(res.statusCode).toBe(500);
  });

  
  test("should return 500 if bcrypt fails", async () => {
    existingUser.mockResolvedValue(null);
    
    bcrypt.hash.mockRejectedValue(new Error("hash error"));

    const res = await request(app)
      .post("/api/users/create")
      .send({
        name:"John",
        email:"john@example.com",
        password:"123456",
      });

    expect(res.statusCode).toBe(500);
  });



});
