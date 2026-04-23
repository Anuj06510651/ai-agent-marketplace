import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboardingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import webConciergeRoutes from './routes/webConciergeRoutes.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rootEnvPath = path.join(projectRoot, '.env');
const serverEnvPath = path.join(__dirname, '.env');

let envLoadedFrom = null;
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  envLoadedFrom = rootEnvPath;
} else if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
  envLoadedFrom = serverEnvPath;
} else {
  dotenv.config();
}

const mongoUriPresent = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
if (!mongoUriPresent) {
  throw new Error(
    `MONGODB_URI is missing. Checked dotenv path(s): ${rootEnvPath}, ${serverEnvPath}. Add MONGODB_URI to your .env file.`
  );
}

const app = express();
const PORT = Number(process.env.PORT || 5001);
const HOST = process.env.HOST || '0.0.0.0';

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.CLIENT_URL || '';
  const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return new Set(
    configuredOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .concat(defaults)
  );
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || allowedOrigins.has('*')) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'API healthy',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api', onboardingRoutes);
app.use('/api', chatbotRoutes);
app.use('/api', customerRoutes);
app.use('/api', authRoutes);
app.use('/api', webConciergeRoutes);

app.use((error, _req, res, next) => {
  if (error?.message?.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
});

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🧪 ENV debug: loadedFrom=${envLoadedFrom || 'default dotenv resolution'}`);
    console.log(`🧪 CORS allowed origins: ${Array.from(allowedOrigins).join(', ')}`);
  }
});

server.on('error', (error) => {
  console.error(`❌ Failed to start server on ${HOST}:${PORT}`);
  console.error(error.message);
  process.exit(1);
});

const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

connectDB().catch((error) => {
  console.error('⚠️ Mongo connection failed. API is running, but database features will fail until MongoDB is available.');
  if (process.env.NODE_ENV !== 'production') {
    console.error(`🧪 ENV debug: loadedFrom=${envLoadedFrom || 'default dotenv resolution'}`);
    console.error(`🧪 ENV debug: cwd=${process.cwd()}`);
  }
  console.error(error.message);
});
