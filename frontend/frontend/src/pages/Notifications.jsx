import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../service/Api";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    const res = await getMyNotifications();
    setNotifications(res.data.notifications || []);
  };

  useEffect(() => {
    const loadOnMount = async () => {
      try {
        await fetchNotifications();
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };
    loadOnMount();
  }, []);

  const handleClick = async (notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Non-critical: leave it unread if the request fails.
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) return <p>Loading notifications...</p>;

  return (
    <div className="notifications-page">
      <button type="button" className="back-link notifications-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="content-header">
        <h2>Notifications</h2>
        <p>Reviews, favorites, and messages people leave on your posts.</p>
      </div>

      {unreadCount > 0 && (
        <button type="button" className="btn btn-secondary mark-all-btn" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
      )}

      {notifications.length === 0 && <p className="no-results">No notifications yet</p>}

      <div className="notifications-list">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-row${n.is_read ? "" : " unread"}`}
            onClick={() => handleClick(n)}
          >
            <p>{n.message}</p>
            <div className="notification-row-footer">
              <span>{new Date(n.created_at).toLocaleString()}</span>
              {n.place_id && (
                <Link to={`/places/${n.place_id}`} onClick={(e) => e.stopPropagation()}>
                  View place →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
