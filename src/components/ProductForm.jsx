import { useState } from "react";
import { productAPI } from "../services/api";

export default function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    quantity: product?.quantity || 0,
    price: product?.price || 0,
    minStock: product?.minStock ?? product?.low_stock_threshold ?? 5,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (product?.id) {
        await productAPI.update(product.id, form);
      } else {
        await productAPI.create(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{product ? "Edit Product" : "Add Product"}</h3>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={form.name} onChange={set("name")} required />
          <input placeholder="SKU" value={form.sku} onChange={set("sku")} required />
          <input placeholder="Description" value={form.description} onChange={set("description")} />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={set("quantity")} required min="0" />
          <input type="number" placeholder="Price" value={form.price} onChange={set("price")} required min="0" step="0.01" />
          <input type="number" placeholder="Min Stock" value={form.minStock} onChange={set("minStock")} required min="0" />
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
