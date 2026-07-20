import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../service/Api";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      try {
        const res = await getMyNotifications();
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // Non-critical: skip a failed poll silently.
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleOpen = () => setIsOpen((prev) => !prev);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Non-critical: leave it unread if the request fails.
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Non-critical.
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell">
      <button type="button" onClick={handleOpen} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`notification-item${n.is_read ? "" : " unread"}`}
                onClick={() => handleNotificationClick(n)}
              >
                <p>{n.message}</p>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
          <Link to="/notifications" className="notification-view-all" onClick={() => setIsOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
