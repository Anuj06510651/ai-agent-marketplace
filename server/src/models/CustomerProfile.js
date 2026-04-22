import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true, unique: true },
    lastMessage: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: 'customer_profiles',
    versionKey: false,
  }
);

export default mongoose.model('CustomerProfile', customerProfileSchema);