import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI, notificationAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AsideNav from "../components/AsideNav";
import Navbar from "../components/Navbar";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    notifications: [],
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        notifications: notifications,
      });
      setNotificationCount(notifications.length);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user?.role]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-page">
      <Navbar />

      <div className="home-container">
        {/* Aside Navigation */}
        <AsideNav />

        {/* Main Content */}
        <main className="main-content">
          <div className="page-header">
            <h2>🏠 Dashboard</h2>
          </div>

          <div className="dashboard-cards">
            <div className="card">
              <h3>📦 Total Products</h3>
              <p className="stat">{stats.totalProducts}</p>
              <Link to="/products">View All Products →</Link>
            </div>
            <div className="card warn">
              <h3>⚠️ Low Stock Items</h3>
              <p className="stat">{stats.lowStock}</p>
              <Link to="/products?filter=low">View Low Stock →</Link>
            </div>
            {user?.role === "admin" && (
              <div className="card admin">
                <h3>👑 Admin Panel</h3>
                <p>Manage system & download history</p>
                <Link to="/history">Go to History →</Link>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <section className="quick-stats">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <h4>Active Products</h4>
                <p className="big-number">{stats.totalProducts}</p>
              </div>
              <div className="stat-box warning">
                <h4>Critical Stock</h4>
                <p className="big-number">{stats.lowStock}</p>
              </div>
              {user?.role === "admin" && (
                <div className="stat-box info">
                  <h4>Notifications</h4>
                  <p className="big-number">{notificationCount}</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
