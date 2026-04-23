import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductForm from "../components/ProductForm";
import AsideNav from "../components/AsideNav";
import Navbar from "../components/Navbar";

export default function Products() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const isAdmin = user?.role === "admin";
  const filterLow = searchParams.get("filter") === "low";

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = filterLow ? await productAPI.getLowStock() : await productAPI.getAll();
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filterLow]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productAPI.remove(id);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchProducts();
  };

  return (
    <div className="products-page">
      <Navbar />

      <div className="products-container" style={{ display: "flex", gap: "1.5rem", padding: "1.5rem" }}>
        <AsideNav />
        <main style={{ flex: 1 }}>
          <div className="page-header">
            <h2>{filterLow ? "Low Stock Products" : "All Products"}</h2>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                + Add Product
              </button>
            )}
          </div>

          {showForm && (
            <ProductForm
              product={editing}
              onSaved={handleSaved}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          )}

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Min Stock</th>
                    <th>Price</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className={p.quantity <= p.minStock ? "low-stock-row" : ""}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>
                        {p.quantity}{" "}
                        {p.quantity <= p.minStock && <span className="badge">Low</span>}
                      </td>
                      <td>{p.minStock}</td>
                      <td>${p.price?.toFixed(2) || "0.00"}</td>
                      {isAdmin && (
                        <td>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setEditing(p);
                              setShowForm(true);
                            }}
                          >
                            Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: "center", padding: "2rem" }}>
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
