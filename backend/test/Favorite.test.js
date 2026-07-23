jest.mock("../model/favoriteModel", () => ({
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  getFavoritePlaceIds: jest.fn(),
  getFavoritePlaces: jest.fn(),
}));

jest.mock("../model/placeModel", () => ({
  getPlaceById: jest.fn(),
}));

jest.mock("../model/notificationModel", () => ({
  createNotification: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const {
  addFavorite,
  removeFavorite,
  getFavoritePlaceIds,
  getFavoritePlaces,
} = require("../model/favoriteModel");
const { getPlaceById } = require("../model/placeModel");
const { createNotification } = require("../model/notificationModel");

const tokenFor = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
const authHeader = () => `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`;

describe("Favorite routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/favorites/add", () => {
    test("should return 400 if placeId is missing", async () => {
      const res = await request(app)
        .post("/api/favorites/add")
        .set("Authorization", authHeader())
        .send({});

      expect(res.statusCode).toBe(400);
    });

    test("should return 201 and notify the place uploader when they differ from the saver", async () => {
      addFavorite.mockResolvedValue(true);
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 2, name: "Rara Lake" });

      const res = await request(app)
        .post("/api/favorites/add")
        .set("Authorization", authHeader())
        .send({ placeId: 1 });

      expect(res.statusCode).toBe(201);
      expect(createNotification).toHaveBeenCalledTimes(1);
    });

    test("should return 201 without notifying when already favorited", async () => {
      addFavorite.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/favorites/add")
        .set("Authorization", authHeader())
        .send({ placeId: 1 });

      expect(res.statusCode).toBe(201);
      expect(createNotification).not.toHaveBeenCalled();
    });

    test("should return 500 if saving fails", async () => {
      addFavorite.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/favorites/add")
        .set("Authorization", authHeader())
        .send({ placeId: 1 });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /api/favorites/remove/:placeId", () => {
    test("should return 200 on success", async () => {
      removeFavorite.mockResolvedValue();

      const res = await request(app)
        .delete("/api/favorites/remove/1")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
    });

    test("should return 500 if removal fails", async () => {
      removeFavorite.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .delete("/api/favorites/remove/1")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/favorites/mine", () => {
    test("should return 200 with favorite places", async () => {
      getFavoritePlaces.mockResolvedValue([{ id: 1, name: "Rara Lake" }]);

      const res = await request(app)
        .get("/api/favorites/mine")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body.places).toHaveLength(1);
    });
  });

  describe("GET /api/favorites/mine/ids", () => {
    test("should return 200 with favorite place ids", async () => {
      getFavoritePlaceIds.mockResolvedValue([1, 2]);

      const res = await request(app)
        .get("/api/favorites/mine/ids")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body.placeIds).toEqual([1, 2]);
    });
  });
});
