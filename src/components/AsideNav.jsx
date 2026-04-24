import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { notificationAPI, historyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AsideNav() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [showHistory, setShowHistory] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [notifyRes, historyRes] = await Promise.all([
        notificationAPI.getNotifications(),
        user?.role === "admin" ? historyAPI.getHistory() : Promise.resolve({ data: [] }),
      ]);
      setNotifications(notifyRes.data || []);
      if (user?.role === "admin") {
        setHistory(historyRes.data?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Menu</h3>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-link">
            🏠 Home
          </Link>
          <Link to="/products" className="nav-link">
            📦 Products
          </Link>
          {user?.role === "admin" && (
            <>
              <Link to="/users" className="nav-link">
                👥 Manage Users
              </Link>
              <Link to="/history" className="nav-link">
                📊 Stock History
              </Link>
            </>
          )}
        </nav>
      </div>

      {showNotifications && (
        <div className="sidebar-section notifications">
          <h3 className="sidebar-heading">
            <span>Notifications ({notifications.length})</span>
            <button className="btn-small" onClick={() => setShowNotifications(false)}>
              Hide
            </button>
          </h3>
          {notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="notification-item">
                  <p>{notif.message}</p>
                  <small>{new Date(notif.createdAt).toLocaleString()}</small>
                  <button
                    className="btn-small"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    ?
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No notifications</p>
          )}
        </div>
      )}

      {showHistory && user?.role === "admin" && (
        <div className="sidebar-section history">
          <h3 className="sidebar-heading">
            <span>Recent History</span>
            <button className="btn-small" onClick={() => setShowHistory(false)}>
              Hide
            </button>
          </h3>
          {history.length > 0 ? (
            <div className="history-list">
              {history.map((entry) => (
                <div key={entry.id} className="history-item">
                  <p>
                    <strong>{entry.productName || entry.product?.name}</strong>
                  </p>
                  <small>{entry.action}</small>
                  <small className="timestamp">
                    {new Date(entry.date).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">No history</p>
          )}
        </div>
      )}
    </aside>
  );
}
