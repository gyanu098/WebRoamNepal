import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getAllUser,
  deleteUserById,
  getAllPlaces,
  deletePlaceById,
  getAllFeedback,
  getImageUrl,
} from "../service/Api";
import "./User.css";

const User = () => {
  const [users, setUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [tab, setTab] = useState("users");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await getAllUser();
      setUsers(response.data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        await fetchUsers();
        const [placesRes, feedbackRes] = await Promise.all([
          getAllPlaces(),
          getAllFeedback(),
        ]);
        setPlaces(placesRes.data.places || []);
        setFeedback(feedbackRes.data.feedback || []);
      } catch {
        // Stats/feedback are supplementary; the users table above already
        // reports its own errors.
      }
    };
    loadOnMount();
  }, []);

  const handleEdit = (id) => navigate(`/edit/${id}`);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await deleteUserById(id);
      toast.success(response.data.message);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete user");
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePlaceById(id);
      toast.success("Post deleted");
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="content-header">
        <h2>Admin Dashboard</h2>
        <p>Manage users, posts, and feedback.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{places.length}</span>
          <span className="stat-label">Places</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{feedback.length}</span>
          <span className="stat-label">Feedback</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={tab === "users" ? "active" : ""}
          onClick={() => setTab("users")}
        >
          Users
        </button>
        <button
          type="button"
          className={tab === "posts" ? "active" : ""}
          onClick={() => setTab("posts")}
        >
          Posts
        </button>
        <button
          type="button"
          className={tab === "feedback" ? "active" : ""}
          onClick={() => setTab("feedback")}
        >
          Feedback
        </button>
      </div>

      {tab === "users" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>
                  {u.image ? (
                    <img src={getImageUrl(u.image)} width="48" height="48" alt={u.name} />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(u.id)}>Edit</button>
                  <button type="button" onClick={() => deleteUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "posts" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Image</th>
              <th>Name</th>
              <th>Location</th>
              <th>Uploader</th>
              <th>Posted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {places.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.image ? (
                    <img src={getImageUrl(p.image)} width="48" height="48" alt={p.name} />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.location}</td>
                <td>{p.uploader_name}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                  <button type="button" onClick={() => navigate(`/places/${p.id}`)}>View</button>
                  <button type="button" onClick={() => deletePost(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "feedback" && (
        <div className="feedback-list">
          {feedback.length === 0 && <p className="no-results">No feedback submitted yet</p>}
          {feedback.map((f) => (
            <div key={f.id} className="feedback-item">
              <p>{f.message}</p>
              <span>
                {f.user_name || f.name || "Anonymous"}
                {f.user_email || f.email ? ` (${f.user_email || f.email})` : ""} —{" "}
                {new Date(f.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default User;
