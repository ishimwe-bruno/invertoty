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
      const canSeeLowStock = user?.role === "admin" || user?.role === "staff";

      try {
        const [allRes, lowRes, notifyRes] = await Promise.allSettled([
          productAPI.getAll(),
          canSeeLowStock ? productAPI.getLowStock() : Promise.resolve({ data: [] }),
          canSeeLowStock ? notificationAPI.getNotifications() : Promise.resolve({ data: [] }),
        ]);

        const allProducts =
          allRes.status === "fulfilled" ? allRes.value.data || [] : [];
        const lowStockProducts =
          lowRes.status === "fulfilled" ? lowRes.value.data || [] : [];
        const derivedLowStockProducts = allProducts.filter(
          (product) =>
            Number(product?.quantity ?? 0) <=
            Number(product?.minStock ?? product?.low_stock_threshold ?? 0)
        );
        const notifications =
          notifyRes.status === "fulfilled" ? notifyRes.value.data || [] : [];

        setStats({
          totalProducts: allProducts.length,
          lowStock: canSeeLowStock ? lowStockProducts.length : derivedLowStockProducts.length,
        });
        setNotificationCount(notifications.length);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [user?.role]);

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
