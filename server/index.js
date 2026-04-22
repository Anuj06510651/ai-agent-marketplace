import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const localEnvPath = path.join(projectRoot, '.env');
const parentEnvPath = path.resolve(projectRoot, '..', '.env');

let envLoadedFrom = null;
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
  envLoadedFrom = localEnvPath;
} else if (fs.existsSync(parentEnvPath)) {
  dotenv.config({ path: parentEnvPath });
  envLoadedFrom = parentEnvPath;
} else {
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboardingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import webConciergeRoutes from './routes/webConciergeRoutes.js';
import { connectDB } from './config/db.js';

const mongoUriPresent = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
if (process.env.NODE_ENV !== 'production') {
  console.log(`🧪 ENV debug: cwd=${process.cwd()}`);
  console.log(`🧪 ENV debug: loadedFrom=${envLoadedFrom || 'default dotenv resolution'}`);
  console.log(`🧪 ENV debug: MONGODB_URI=${mongoUriPresent ? 'present' : 'missing'}`);
}

if (!mongoUriPresent) {
  throw new Error(
    `MONGODB_URI is missing. Checked dotenv path(s): ${localEnvPath}, ${parentEnvPath}. Add MONGODB_URI to your .env file.`
  );
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API healthy' });
});

app.use('/api', onboardingRoutes);
app.use('/api', chatbotRoutes);
app.use('/api', customerRoutes);
app.use('/api', authRoutes);
app.use('/api', webConciergeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

connectDB().catch((error) => {
  console.error('⚠️ Mongo connection failed. API is running, but database features will fail until MongoDB is available.');
  if (process.env.NODE_ENV !== 'production') {
    console.error(`🧪 ENV debug: loadedFrom=${envLoadedFrom || 'default dotenv resolution'}`);
    console.error(`🧪 ENV debug: cwd=${process.cwd()}`);
  }
  console.error(error.message);
});
