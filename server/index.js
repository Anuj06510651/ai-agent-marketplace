import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import onboardingRoutes from './routes/onboardingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import webConciergeRoutes from './routes/webConciergeRoutes.js';
import { connectDB } from './config/db.js';

dotenv.config();

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
  console.error(error.message);
});
