import axios from "axios";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

const api = axios.create({ baseURL: "/api" });

const createMockResponse = (data) => ({ data });

const normalizeProduct = (product) => ({
  ...product,
  low_stock_threshold: product?.minStock ?? product?.low_stock_threshold ?? 0,
});

const normalizeHistoryEntry = (entry) => ({
  ...entry,
  action:
    entry?.action === "create"
      ? "added"
      : entry?.action === "delete"
        ? "removed"
        : entry?.action === "update"
          ? "updated"
          : entry?.action,
  date: entry?.date || entry?.createdAt,
  quantity:
    entry?.quantity ??
    entry?.newQuantity ??
    entry?.previousQuantity ??
    0,
  userName: entry?.userName || entry?.user?.name || "System",
});

const buildLowStockNotifications = async () => {
  const res = await api.get("/products/low-stock");
  const products = (res.data || []).map(normalizeProduct);

  return {
    data: products.map((product) => ({
      id: product.id,
      message: `Low stock alert: ${product.name} (${product.quantity} remaining)`,
      createdAt: product.updatedAt || product.createdAt || new Date().toISOString(),
    })),
  };
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const mockProducts = [
  { id: 1, name: "Laptop", sku: "LAPTOP-001", quantity: 15, price: 999.99, minStock: 10 },
  { id: 2, name: "Mouse", sku: "MOUSE-001", quantity: 3, price: 25.99, minStock: 5 },
  { id: 3, name: "Keyboard", sku: "KEYBOARD-001", quantity: 8, price: 75.5, minStock: 10 },
  { id: 4, name: "Monitor", sku: "MONITOR-001", quantity: 12, price: 299.99, minStock: 5 },
  { id: 5, name: "Chair", sku: "CHAIR-001", quantity: 2, price: 149.99, minStock: 3 },
].map(normalizeProduct);

const mockHistory = [
  { id: 1, productName: "Laptop", action: "create", date: new Date().toISOString(), quantity: 5, userName: "Admin User", product: { name: "Laptop" } },
  { id: 2, productName: "Mouse", action: "update", date: new Date(Date.now() - 86400000).toISOString(), quantity: 3, userName: "Admin User", product: { name: "Mouse" } },
];

const mockNotifications = [
  { id: 1, message: "Low stock alert: Mouse (3 remaining)", createdAt: new Date().toISOString() },
  { id: 2, message: "Low stock alert: Chair (2 remaining)", createdAt: new Date(Date.now() - 3600000).toISOString() },
];

const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@example.com", role: "admin" },
  { id: 2, name: "Regular User", email: "user@example.com", role: "staff" },
];

export const authAPI = {
  login: (data) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ token: "mock-token", user: { id: 1, name: "Admin User", role: "admin" } }))
      : api.post("/auth/login", data),
  register: (data) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ token: "mock-token", user: { id: 1, name: "New User", role: "staff" } }))
      : api.post("/auth/register", data),
  getUsers: () =>
    USE_MOCK_DATA ? Promise.resolve(createMockResponse(mockUsers)) : api.get("/auth/users"),
  deleteUser: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ message: "User deleted" }))
      : api.delete(`/auth/users/${id}`),
};

export const productAPI = {
  getAll: () =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse(mockProducts))
      : api.get("/products").then((res) => ({
          ...res,
          data: (res.data || []).map(normalizeProduct),
        })),
  getOne: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse(mockProducts.find((p) => p.id === parseInt(id, 10))))
      : api.get(`/products/${id}`).then((res) => ({
          ...res,
          data: normalizeProduct(res.data),
        })),
  getLowStock: () =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse(mockProducts.filter((p) => p.quantity <= p.low_stock_threshold)))
      : api.get("/products/low-stock").then((res) => ({
          ...res,
          data: (res.data || []).map(normalizeProduct),
        })),
  create: (data) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ ...data, id: Date.now() }))
      : api.post("/admin/products", data).then((res) => ({
          ...res,
          data: normalizeProduct(res.data),
        })),
  update: (id, data) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ ...data, id: parseInt(id, 10) }))
      : api.put(`/admin/products/${id}`, data).then((res) => ({
          ...res,
          data: normalizeProduct(res.data),
        })),
  remove: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ message: "Product deleted" }))
      : api.delete(`/admin/products/${id}`),
};

export const historyAPI = {
  getHistory: () =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse(mockHistory))
      : api.get("/history").then((res) => ({
          ...res,
          data: (res.data?.data || []).map(normalizeHistoryEntry),
        })),
  getHistoryById: (id) =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse(mockHistory.find((h) => h.id === parseInt(id, 10))))
      : api.get("/history", { params: { limit: 500 } }).then((res) => ({
          ...res,
          data: (res.data?.data || [])
            .map(normalizeHistoryEntry)
            .find((entry) => entry.id === parseInt(id, 10)),
        })),
  downloadHistory: () =>
    USE_MOCK_DATA
      ? Promise.resolve(
          new Blob(['Product,Action,Date\nLaptop,"create",2024-01-01\nMouse,"update",2024-01-02'], { type: "text/csv" })
        )
      : api.get("/history/export", { responseType: "blob" }).then((res) => res.data),
};

export const notificationAPI = {
  getNotifications: () =>
    USE_MOCK_DATA ? Promise.resolve(createMockResponse(mockNotifications)) : buildLowStockNotifications(),
  markAsRead: () =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ message: "Notification marked as read" }))
      : Promise.resolve(createMockResponse({ message: "Notification acknowledged" })),
  deleteNotification: () =>
    USE_MOCK_DATA
      ? Promise.resolve(createMockResponse({ message: "Notification deleted" }))
      : Promise.resolve(createMockResponse({ message: "Notification dismissed" })),
};

export default api;
