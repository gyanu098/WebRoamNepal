jest.mock("../model/placeModel", () => ({
  createPlace: jest.fn(),
  getAllPlaces: jest.fn(),
  getPlaceById: jest.fn(),
  deletePlaceById: jest.fn(),
  updatePlaceById: jest.fn(),
}));

jest.mock("../middleware/uploads", () => ({
  single: () => (req, res, next) => {
    req.file = global.__mockUploadFile || null;
    next();
  },
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const {
  createPlace,
  getAllPlaces,
  getPlaceById,
  deletePlaceById,
  updatePlaceById,
} = require("../model/placeModel");

const tokenFor = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Place routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
    global.__mockUploadFile = null;
  });

  describe("POST /api/places/addPlace", () => {
    test("should return 400 if name or description is missing", async () => {
      global.__mockUploadFile = { filename: "photo.jpg" };

      const res = await request(app)
        .post("/api/places/addPlace")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ description: "a nice place" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 400 if no image is uploaded", async () => {
      global.__mockUploadFile = null;

      const res = await request(app)
        .post("/api/places/addPlace")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ name: "Rara Lake", description: "a nice place" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 201 on success", async () => {
      global.__mockUploadFile = { filename: "photo.jpg" };
      createPlace.mockResolvedValue({ id: 1, name: "Rara Lake" });

      const res = await request(app)
        .post("/api/places/addPlace")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ name: "Rara Lake", description: "a nice place" });

      expect(res.statusCode).toBe(201);
      expect(res.body.place.name).toBe("Rara Lake");
    });

    test("should return 500 if creation fails", async () => {
      global.__mockUploadFile = { filename: "photo.jpg" };
      createPlace.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/places/addPlace")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ name: "Rara Lake", description: "a nice place" });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/places/getAllPlaces", () => {
    test("should return 200 with all places", async () => {
      getAllPlaces.mockResolvedValue([{ id: 1, name: "Rara Lake" }]);

      const res = await request(app).get("/api/places/getAllPlaces");

      expect(res.statusCode).toBe(200);
      expect(res.body.places).toHaveLength(1);
    });

    test("should return 500 if fetching fails", async () => {
      getAllPlaces.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/places/getAllPlaces");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/places/getPlaceById/:id", () => {
    test("should return 404 if not found", async () => {
      getPlaceById.mockResolvedValue(undefined);

      const res = await request(app).get("/api/places/getPlaceById/1");

      expect(res.statusCode).toBe(404);
    });

    test("should return 200 if found", async () => {
      getPlaceById.mockResolvedValue({ id: 1, name: "Rara Lake" });

      const res = await request(app).get("/api/places/getPlaceById/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.place.id).toBe(1);
    });
  });

  describe("PUT /api/places/updatePlace/:id", () => {
    test("should return 404 if the place does not exist", async () => {
      getPlaceById.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/api/places/updatePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .field("name", "New name");

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller is not the owner or an admin", async () => {
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 2, name: "Rara Lake" });

      const res = await request(app)
        .put("/api/places/updatePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .field("name", "New name");

      expect(res.statusCode).toBe(403);
    });

    test("should return 200 when the owner updates their own place", async () => {
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 1, name: "Rara Lake", description: "old", location: "old" });
      updatePlaceById.mockResolvedValue({ id: 1, name: "New name" });

      const res = await request(app)
        .put("/api/places/updatePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ name: "New name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.place.name).toBe("New name");
    });

    test("should return 200 when an admin updates someone else's place", async () => {
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 2, name: "Rara Lake", description: "old", location: "old" });
      updatePlaceById.mockResolvedValue({ id: 1, name: "New name" });

      const res = await request(app)
        .put("/api/places/updatePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 99, role: "admin" })}`)
        .send({ name: "New name" });

      expect(res.statusCode).toBe(200);
    });
  });

  describe("DELETE /api/places/deletePlace/:id", () => {
    test("should return 404 if the place does not exist", async () => {
      getPlaceById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/api/places/deletePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller is not the owner or an admin", async () => {
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 2 });

      const res = await request(app)
        .delete("/api/places/deletePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

      expect(res.statusCode).toBe(403);
    });

    test("should return 200 when the owner deletes their own place", async () => {
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 1 });
      deletePlaceById.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete("/api/places/deletePlace/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
