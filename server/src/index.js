import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import chatRoutes from './routes/chatRoutes.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API healthy' });
});

app.use('/api', chatRoutes);

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();