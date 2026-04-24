const tokenKey = 'invertory_token';
const userKey = 'invertory_user';
const form = document.getElementById('login-form');
const message = document.getElementById('message');

const existingToken = localStorage.getItem(tokenKey);
if (existingToken) {
  window.location.href = '/products';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = 'Signing you in...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    window.location.href = '/products';
  } catch (error) {
    message.textContent = error.message;
  }
});
