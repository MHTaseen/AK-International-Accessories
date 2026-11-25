import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import { connectDB } from './config/db.js';
import { applySecurityMiddleware, noSqlSanitizer } from './middleware/security.js';
import categoriesRouter from './routes/categories.js';
import featureBoxesRouter from './routes/featureBoxes.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security headers, CORS, rate-limiting, HPP
applySecurityMiddleware(app);

// Fast response compression
app.use(compression());

// Strict payload size limits to prevent DoS
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// Sanitize inputs against NoSQL injection & prototype pollution
app.use(noSqlSanitizer);

// Minimal health endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Category navigation routes
app.use('/api/categories', categoriesRouter);

// Editable feature highlight boxes routes
app.use('/api/feature-boxes', featureBoxesRouter);

// 404 handler (no stack trace or internal path leakage)
app.use((_req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Centralized error handler (never expose internals in production)
app.use((err, _req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || 500;
  res.status(status).json({
    error: isProd ? 'Internal server error' : err.message,
  });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.info(`[Server] Running securely on port ${PORT}`);
  });
}

start();
