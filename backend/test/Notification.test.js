jest.mock("../model/notificationModel", () => ({
  getNotificationsForUser: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const {
  getNotificationsForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../model/notificationModel");

const authHeader = () =>
  `Bearer ${jwt.sign({ id: 1, role: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" })}`;

describe("Notification routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notifications/mine", () => {
    test("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/notifications/mine");
      expect(res.statusCode).toBe(401);
    });

    test("should return 200 with notifications and unread count", async () => {
      getNotificationsForUser.mockResolvedValue([{ id: 1, message: "hi" }]);
      getUnreadCount.mockResolvedValue(3);

      const res = await request(app)
        .get("/api/notifications/mine")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body.notifications).toHaveLength(1);
      expect(res.body.unreadCount).toBe(3);
    });

    test("should return 500 if fetching fails", async () => {
      getNotificationsForUser.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .get("/api/notifications/mine")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/notifications/mine/:id/read", () => {
    test("should return 200 on success", async () => {
      markAsRead.mockResolvedValue();

      const res = await request(app)
        .put("/api/notifications/mine/1/read")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(markAsRead).toHaveBeenCalledWith("1", 1);
    });

    test("should return 500 if updating fails", async () => {
      markAsRead.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .put("/api/notifications/mine/1/read")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/notifications/mine/read-all", () => {
    test("should return 200 on success", async () => {
      markAllAsRead.mockResolvedValue();

      const res = await request(app)
        .put("/api/notifications/mine/read-all")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
    });

    test("should return 500 if updating fails", async () => {
      markAllAsRead.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .put("/api/notifications/mine/read-all")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(500);
    });
  });
});
