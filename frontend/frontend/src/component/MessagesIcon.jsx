import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConversations } from "../service/Api";
import { useAuth } from "../context/AuthContext";
import "./NotificationBell.css";

const POLL_INTERVAL_MS = 30000;

// Icon-only navbar link to /messages, with an unread-count badge — the
// only other way in is via a place's "Message" button, which doesn't help
// someone who wants to check their message history without messaging
// someone new first.
const MessagesIcon = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await getConversations();
        const total = (res.data.conversations || []).reduce(
          (sum, c) => sum + Number(c.unread_count || 0),
          0
        );
        setUnreadCount(total);
      } catch {
        // Non-critical: skip a failed poll silently.
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell">
      <Link to="/messages" aria-label="Messages">
        ✉️
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </Link>
    </div>
  );
};

export default MessagesIcon;
