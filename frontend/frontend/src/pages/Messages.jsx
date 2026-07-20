import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteMessage,
  getConversation,
  getConversations,
  getImageUrl,
  sendMessage,
  updateMessage,
} from "../service/Api";
import { useAuth } from "../context/AuthContext";
import "./Messages.css";

const THREAD_POLL_MS = 5000;
const LIST_POLL_MS = 15000;

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    if (userId) return;
    const fetchConversations = async () => {
      try {
        const res = await getConversations();
        setConversations(res.data.conversations || []);
      } catch {
        // Non-critical: skip a failed poll silently.
      }
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, LIST_POLL_MS);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchThread = async () => {
      try {
        const res = await getConversation(userId);
        setThread(res.data.messages || []);
      } catch {
        toast.error("Failed to load conversation");
      }
    };
    fetchThread();
    const interval = setInterval(fetchThread, THREAD_POLL_MS);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      await sendMessage(userId, draft.trim());
      setDraft("");
      const res = await getConversation(userId);
      setThread(res.data.messages || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditDraft(m.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    if (!editDraft.trim()) return;
    try {
      await updateMessage(id, editDraft.trim());
      setThread((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: editDraft.trim(), is_edited: true } : m))
      );
      cancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update message");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
      setThread((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  if (userId) {
    const otherName = thread.find((m) => m.sender_id === Number(userId))?.sender_name || "User";
    return (
      <div className="messages-container">
        <Link to="/messages" className="back-link">← All conversations</Link>
        <h2>{otherName}</h2>

        <div className="message-thread">
          {thread.map((m) => {
            const isMine = m.sender_id === user?.id;

            if (editingId === m.id) {
              return (
                <form
                  key={m.id}
                  className="message-edit-form"
                  onSubmit={(e) => handleEditSubmit(e, m.id)}
                >
                  <input
                    type="text"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>Cancel</button>
                </form>
              );
            }

            return (
              <div key={m.id} className={`message-bubble${isMine ? " mine" : ""}`}>
                <p>
                  {m.content}
                  {m.is_edited && <span className="message-edited-tag"> (edited)</span>}
                </p>
                <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                {isMine && (
                  <div className="message-bubble-actions">
                    <button type="button" onClick={() => startEdit(m)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(m.id)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
          {thread.length === 0 && <p className="no-results">Say hello 👋</p>}
        </div>

        <form className="message-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <Link to="/" className="back-link">← Back to home</Link>
      <div className="content-header">
        <h2>Messages</h2>
        <p>Conversations with travelers about their hidden gems.</p>
      </div>

      {conversations.length === 0 && (
        <p className="no-results">No conversations yet — message someone from a place card.</p>
      )}

      <div className="conversation-list">
        {conversations.map((c) => (
          <button
            key={c.user_id}
            type="button"
            className="conversation-item"
            onClick={() => navigate(`/messages/${c.user_id}`)}
          >
            {c.user_image ? (
              <img src={getImageUrl(c.user_image)} alt={c.user_name} className="conversation-avatar" />
            ) : (
              <div className="conversation-avatar-placeholder">{c.user_name?.[0]}</div>
            )}
            <div className="conversation-preview">
              <strong>{c.user_name}</strong>
              <p>{c.last_message}</p>
            </div>
            {Number(c.unread_count) > 0 && (
              <span className="conversation-unread">{c.unread_count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Messages;
