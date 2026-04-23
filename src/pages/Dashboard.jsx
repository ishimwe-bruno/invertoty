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
    Promise.all([productAPI.getAll(), productAPI.getLowStock()])
      .then(([allRes, lowRes]) => {
        setStats({ total: allRes.data.length, lowStock: lowRes.data.length });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      <div className="dashboard-container" style={{ display: "flex", gap: "1.5rem", padding: "1.5rem" }}>
        <AsideNav />
        <main style={{ flex: 1 }}>
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
