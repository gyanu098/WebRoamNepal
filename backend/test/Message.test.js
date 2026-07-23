jest.mock("../model/messageModel", () => ({
  sendMessage: jest.fn(),
  getConversation: jest.fn(),
  getConversationList: jest.fn(),
  markConversationRead: jest.fn(),
  getMessageById: jest.fn(),
  updateMessageById: jest.fn(),
  deleteMessageById: jest.fn(),
}));

jest.mock("../model/notificationModel", () => ({
  createNotification: jest.fn(),
}));

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const {
  sendMessage,
  getConversation,
  getConversationList,
  markConversationRead,
  getMessageById,
  updateMessageById,
  deleteMessageById,
} = require("../model/messageModel");
const { createNotification } = require("../model/notificationModel");

const tokenFor = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
const authHeader = () => `Bearer ${tokenFor({ id: 1, email: "a@a.com", role: "user" })}`;

describe("Message routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/messages/send", () => {
    test("should return 400 if receiverId or content is missing", async () => {
      const res = await request(app)
        .post("/api/messages/send")
        .set("Authorization", authHeader())
        .send({ receiverId: 2 });

      expect(res.statusCode).toBe(400);
    });

    test("should return 400 if messaging yourself", async () => {
      const res = await request(app)
        .post("/api/messages/send")
        .set("Authorization", authHeader())
        .send({ receiverId: 1, content: "hi" });

      expect(res.statusCode).toBe(400);
    });

    test("should return 201 on success", async () => {
      sendMessage.mockResolvedValue({ id: 1, content: "hi" });
      createNotification.mockResolvedValue();

      const res = await request(app)
        .post("/api/messages/send")
        .set("Authorization", authHeader())
        .send({ receiverId: 2, content: "hi" });

      expect(res.statusCode).toBe(201);
      expect(createNotification).toHaveBeenCalledTimes(1);
    });

    test("should return 500 if sending fails", async () => {
      sendMessage.mockRejectedValue(new Error("DB error"));

      const res = await request(app)
        .post("/api/messages/send")
        .set("Authorization", authHeader())
        .send({ receiverId: 2, content: "hi" });

      expect(res.statusCode).toBe(500);
    });
  });

  describe("GET /api/messages/conversations", () => {
    test("should return 200 with the conversation list", async () => {
      getConversationList.mockResolvedValue([{ userId: 2 }]);

      const res = await request(app)
        .get("/api/messages/conversations")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body.conversations).toHaveLength(1);
    });
  });

  describe("GET /api/messages/conversation/:otherUserId", () => {
    test("should return 200 with messages and mark the conversation read", async () => {
      getConversation.mockResolvedValue([{ id: 1, content: "hi" }]);
      markConversationRead.mockResolvedValue();

      const res = await request(app)
        .get("/api/messages/conversation/2")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
      expect(res.body.messages).toHaveLength(1);
      expect(markConversationRead).toHaveBeenCalledWith(1, "2");
    });
  });

  describe("PUT /api/messages/update/:id", () => {
    test("should return 400 if content is missing", async () => {
      const res = await request(app)
        .put("/api/messages/update/1")
        .set("Authorization", authHeader())
        .send({});

      expect(res.statusCode).toBe(400);
    });

    test("should return 404 if the message does not exist", async () => {
      getMessageById.mockResolvedValue(undefined);

      const res = await request(app)
        .put("/api/messages/update/1")
        .set("Authorization", authHeader())
        .send({ content: "updated" });

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller is not the sender", async () => {
      getMessageById.mockResolvedValue({ id: 1, sender_id: 2 });

      const res = await request(app)
        .put("/api/messages/update/1")
        .set("Authorization", authHeader())
        .send({ content: "updated" });

      expect(res.statusCode).toBe(403);
    });

    test("should return 200 when the sender updates their message", async () => {
      getMessageById.mockResolvedValue({ id: 1, sender_id: 1 });
      updateMessageById.mockResolvedValue({ id: 1, content: "updated" });

      const res = await request(app)
        .put("/api/messages/update/1")
        .set("Authorization", authHeader())
        .send({ content: "updated" });

      expect(res.statusCode).toBe(200);
    });
  });

  describe("DELETE /api/messages/delete/:id", () => {
    test("should return 404 if the message does not exist", async () => {
      getMessageById.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/api/messages/delete/1")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(404);
    });

    test("should return 403 if the caller is not the sender", async () => {
      getMessageById.mockResolvedValue({ id: 1, sender_id: 2 });

      const res = await request(app)
        .delete("/api/messages/delete/1")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(403);
    });

    test("should return 200 when the sender deletes their message", async () => {
      getMessageById.mockResolvedValue({ id: 1, sender_id: 1 });
      deleteMessageById.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .delete("/api/messages/delete/1")
        .set("Authorization", authHeader());

      expect(res.statusCode).toBe(200);
    });
  });
});
