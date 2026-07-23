jest.mock("../model/reviewModel", () => ({
  addReview: jest.fn(),
  getReviewsByPlace: jest.fn(),
  getReviewById: jest.fn(),
  updateReviewById: jest.fn(),
  deleteReviewById: jest.fn(),
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
  addReview,
  getReviewsByPlace,
  getReviewById,
  updateReviewById,
  deleteReviewById,
} = require("../model/reviewModel");
const { getPlaceById } = require("../model/placeModel");
const { createNotification } = require("../model/notificationModel");

const tokenFor = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Review routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reviews/addReview", () => {
    test("should return 400 if placeId or rating is missing", async () => {
      const res = await request(app)
        .post("/api/reviews/addReview")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`)
        .send({ comment: "nice" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 400 if rating is not a whole number between 1 and 5", async () => {
      const res = await request(app)
        .post("/api/reviews/addReview")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`)
        .send({ placeId: 1, rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    test("should return 201 and notify the place uploader when they differ from the reviewer", async () => {
      addReview.mockResolvedValue({ id: 1, rating: 5 });
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 2, name: "Rara Lake" });

      const res = await request(app)
        .post("/api/reviews/addReview")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`)
        .send({ placeId: 1, rating: 5, comment: "great" });

      expect(res.statusCode).toBe(201);
      expect(createNotification).toHaveBeenCalledTimes(1);
    });

    test("should not notify when the reviewer is the place uploader", async () => {
      addReview.mockResolvedValue({ id: 1, rating: 5 });
      getPlaceById.mockResolvedValue({ id: 1, uploader_id: 1, name: "Rara Lake" });

      const res = await request(app)
        .post("/api/reviews/addReview")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`)
        .send({ placeId: 1, rating: 5 });

      expect(res.statusCode).toBe(201);
      expect(createNotification).not.toHaveBeenCalled();
    });

    test("should return 500 if adding the review fails", async () => {
      addReview.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/reviews/addReview")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`)
        .send({ placeId: 1, rating: 5 });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/reviews/getReviews/:placeId", () => {
    test("should return 200 with reviews", async () => {
      getReviewsByPlace.mockResolvedValue([{ id: 1, rating: 5 }]);

      const res = await request(app).get("/api/reviews/getReviews/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.reviews).toHaveLength(1);
    });

    test("should return 500 if fetching fails", async () => {
      getReviewsByPlace.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/api/reviews/getReviews/1");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/reviews/updateReview/:id", () => {
    test("should return 404 if the review does not exist", async () => {
      getReviewById.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/api/reviews/updateReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller does not own the review", async () => {
      getReviewById.mockResolvedValue({ id: 1, user_id: 2, comment: "old" });

      const res = await request(app)
        .put("/api/reviews/updateReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(403);
    });

    test("should return 400 for an invalid rating", async () => {
      getReviewById.mockResolvedValue({ id: 1, user_id: 1, comment: "old" });

      const res = await request(app)
        .put("/api/reviews/updateReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
    });

    test("should return 200 when the owner updates their review", async () => {
      getReviewById.mockResolvedValue({ id: 1, user_id: 1, comment: "old" });
      updateReviewById.mockResolvedValue({ id: 1, rating: 4, comment: "updated" });

      const res = await request(app)
        .put("/api/reviews/updateReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`)
        .send({ rating: 4, comment: "updated" });

      expect(res.statusCode).toBe(200);
      expect(res.body.review.rating).toBe(4);
    });
  });

  describe("DELETE /api/reviews/deleteReview/:id", () => {
    test("should return 404 if the review does not exist", async () => {
      getReviewById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/api/reviews/deleteReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller does not own the review", async () => {
      getReviewById.mockResolvedValue({ id: 1, user_id: 2 });

      const res = await request(app)
        .delete("/api/reviews/deleteReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 1, role: "user" })}`);

      expect(res.statusCode).toBe(403);
    });

    test("should return 200 when an admin deletes someone else's review", async () => {
      getReviewById.mockResolvedValue({ id: 1, user_id: 2 });
      deleteReviewById.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete("/api/reviews/deleteReview/1")
        .set("Authorization", `Bearer ${tokenFor({ id: 99, role: "admin" })}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
