import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { historyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AsideNav from "../components/AsideNav";
import Navbar from "../components/Navbar";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await historyAPI.getHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const handleDownload = async () => {
    if (!confirm("Download stock history as Excel file?")) return;

    setDownloading(true);
    try {
      const blob = await historyAPI.downloadHistory();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `stock-history-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading history:", err);
      alert("Failed to download history file");
    } finally {
      setDownloading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="error-page">
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
        <Link to="/">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="history-page">
      <Navbar />

      <div className="app-layout history-layout">
        <AsideNav />
        <main className="content-main">
          <div className="page-header">
            <h2>📊 Stock History</h2>
          </div>

          <div className="history-container">
            <div className="history-header">
              <h3>Product Movement History</h3>
              <div className="header-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Hide Preview" : "👁️ Preview Data"}
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleDownload}
                  disabled={downloading || history.length === 0}
                >
                  {downloading ? "Downloading..." : "📥 Download as Excel"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading history...</div>
            ) : (
              <>
                {showPreview && (
                  <div className="preview-section">
                    <h3>Preview ({history.length} records)</h3>
                    {history.length > 0 ? (
                      <div className="table-wrapper">
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Action</th>
                              <th>Quantity</th>
                              <th>Added/Removed By</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((entry, idx) => (
                              <tr key={entry.id || idx}>
                                <td>
                                  {entry.productName ||
                                    entry.product?.name ||
                                    "N/A"}
                                </td>
                                <td>
                                  <span
                                    className={`action-badge ${entry.action.toLowerCase()}`}
                                  >
                                    {entry.action}
                                  </span>
                                </td>
                                <td>{entry.quantity || 0}</td>
                                <td>
                                  {entry.userName ||
                                    entry.user?.name ||
                                    "System"}
                                </td>
                                <td>
                                  {new Date(entry.date).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="empty">No history records found</p>
                    )}
                  </div>
                )}

                <div className="info-box">
                  <h3>Information</h3>
                  <ul>
                    <li>
                      Total records: <strong>{history.length}</strong>
                    </li>
                    <li>
                      This data can be exported as an Excel file for external
                      analysis
                    </li>
                    <li>
                      The file includes all product additions and removals with
                      timestamps
                    </li>
                    <li>
                      Only administrators can access and download this history
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
