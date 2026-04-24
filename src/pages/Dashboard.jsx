import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AsideNav from "../components/AsideNav";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canSeeLowStock = user?.role === "admin" || user?.role === "staff";

    Promise.allSettled([
      productAPI.getAll(),
      canSeeLowStock ? productAPI.getLowStock() : Promise.resolve({ data: [] }),
    ])
      .then(([allRes, lowRes]) => {
        const allProducts =
          allRes.status === "fulfilled" ? allRes.value.data || [] : [];
        const lowStockProducts =
          lowRes.status === "fulfilled" ? lowRes.value.data || [] : [];
        const derivedLowStockProducts = allProducts.filter(
          (product) =>
            Number(product?.quantity ?? 0) <=
            Number(product?.minStock ?? product?.low_stock_threshold ?? 0)
        );

        setStats({
          total: allProducts.length,
          lowStock: canSeeLowStock ? lowStockProducts.length : derivedLowStockProducts.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <h1>Dashboard</h1>
        <div className="nav-right">
          <Link to="/" className="btn">Home</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="app-layout dashboard-container">
        <AsideNav />
        <main className="content-main">
          {loading ? (
            <div className="loading">Loading dashboard...</div>
          ) : (
            <>
              <h2>Welcome, {user?.name}!</h2>
              <div className="dashboard-cards">
                <div className="card">
                  <h3>Total Products</h3>
                  <p className="stat">{stats.total}</p>
                  <Link to="/products">View All</Link>
                </div>
                <div className="card warn">
                  <h3>Low Stock Alerts</h3>
                  <p className="stat">{stats.lowStock}</p>
                  <Link to="/products?filter=low">View Low Stock</Link>
                </div>
                {user?.role === "admin" && (
                  <div className="card admin">
                    <h3>Admin Tools</h3>
                    <p>Manage users &amp; view history</p>
                    <Link to="/users">Manage Users</Link>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
