import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatbot_mvp';

  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');
}