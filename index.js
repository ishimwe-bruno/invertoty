import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './database/index.js';

import authRoutes         from './routes/authRoutes.js';
import staffProductRoutes from './routes/staffProductRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import adminRoutes        from './routes/adminRoutes.js';
import historyRoutes      from './routes/historyRoutes.js';
import dashboardRoutes    from './routes/dashboardRoutes.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;
const DB_SYNC_FORCE = process.env.DB_SYNC_FORCE === 'true';
const DB_SYNC_ON_START = process.env.DB_SYNC_ON_START === 'true';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(publicDir, 'products.html'));
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

// Public authentication routes
app.use('/api/auth',     authRoutes);

// Staff-level product access (read operations for all authenticated users)
app.use('/api/products', staffProductRoutes);

// Dashboard for all authenticated users (role-based data)
app.use('/api/dashboard', dashboardRoutes);

// Admin-only product management
app.use('/api/admin/products', adminProductRoutes);

// Admin-only user management and history
app.use('/api/admin',   adminRoutes);
app.use('/api/history', historyRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connected...');

    if (DB_SYNC_ON_START) {
      await sequelize.sync({ force: DB_SYNC_FORCE, alter: false, logging: false });
      console.log(` Database schema synced (force=${DB_SYNC_FORCE})`);
    } else {
      console.log(' Database schema sync skipped on startup (set DB_SYNC_ON_START=true to enable).');
    }

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(' Unable to start database session.');
    console.error(` Reason: ${err?.name || 'Error'} - ${err?.message || 'Unknown error'}`);
    if (err?.original?.code) {
      console.error(` DB code: ${err.original.code}`);
    }
    if (err?.original?.sqlMessage) {
      console.error(` SQL message: ${err.original.sqlMessage}`);
    }
    console.error(' Check that MySQL is running and listening on the host/port from your .env file.');
    process.exit(1);
  }
};

startServer();
