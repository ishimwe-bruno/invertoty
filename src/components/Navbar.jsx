import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productAPI, notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
  });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allRes, lowRes, notifyRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getLowStock(),
          notificationAPI.getNotifications(),
        ]);

        const notifications = notifyRes.data || [];
        setStats({
          totalProducts: allRes.data.length,
          lowStock: lowRes.data.length,
        });
        setNotificationCount(notifications.length);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="system-name">
          📦 Inventory System
        </Link>
      </div>

      <div className="nav-center">
        <div className="performance-cards">
          <div className="mini-card">
            <span className="card-icon">📊</span>
            <div className="card-info">
              <span className="card-label">Total Products</span>
              <span className="card-value">{stats.totalProducts}</span>
            </div>
          </div>
          <div className="mini-card warn">
            <span className="card-icon">⚠️</span>
            <div className="card-info">
              <span className="card-label">Low Stock</span>
              <span className="card-value">{stats.lowStock}</span>
            </div>
          </div>
          <div className="mini-card">
            <span className="card-icon">🔔</span>
            <div className="card-info">
              <span className="card-label">Notifications</span>
              <span className="card-value">{notificationCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="nav-right">
        <span className="user-info">
          Welcome, {user?.name} ({user?.role})
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}