const tokenKey = 'invertory_token';
const userKey = 'invertory_user';
const token = localStorage.getItem(tokenKey);
const user = JSON.parse(localStorage.getItem(userKey) || 'null');

const message = document.getElementById('products-message');
const grid = document.getElementById('products-grid');
const totalProducts = document.getElementById('total-products');
const lowStockCount = document.getElementById('low-stock-count');
const welcomeText = document.getElementById('welcome-text');

if (!token) {
  window.location.href = '/';
}

if (user) {
  welcomeText.textContent = `${user.name} signed in as ${user.role}.`;
}

const renderProducts = (products) => {
  totalProducts.textContent = String(products.length);
  lowStockCount.textContent = String(products.filter((product) => product.quantity <= product.minStock).length);

  if (!products.length) {
    grid.innerHTML = '<article class="product-card"><h2>No products found</h2><p class="product-description">The API is connected, but there are no products in the database yet.</p></article>';
    return;
  }

  grid.innerHTML = products.map((product) => {
    const lowStock = product.quantity <= product.minStock;
    return `
      <article class="product-card">
        <p class="eyebrow">${product.sku}</p>
        <h2>${product.name}</h2>
        <p class="product-description">${product.description || 'No description provided.'}</p>
        <div class="badge-row">
          <span class="badge">Price: ${Number(product.price).toLocaleString()}</span>
          <span class="badge">Qty: ${product.quantity}</span>
          <span class="badge">Min: ${product.minStock}</span>
          <span class="badge ${lowStock ? 'low' : 'ok'}">${lowStock ? 'Low stock' : 'In stock'}</span>
        </div>
      </article>
    `;
  }).join('');
};

const loadProducts = async () => {
  message.textContent = 'Loading products...';

  try {
    const response = await fetch('/api/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load products');
    }

    renderProducts(data);
    message.textContent = '';
  } catch (error) {
    message.textContent = error.message;
    if (/token|unauthorized|no token/i.test(error.message)) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      window.location.href = '/';
    }
  }
};

document.getElementById('refresh-btn').addEventListener('click', loadProducts);
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  window.location.href = '/';
});

loadProducts();
