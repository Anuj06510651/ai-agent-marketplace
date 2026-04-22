import mongoose from 'mongoose';

const botSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    services: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one service is required.',
      },
    },
    pricing: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    timings: { type: String, required: true, trim: true },
    customFAQs: {
      type: [
        {
          question: { type: String, required: true, trim: true },
          answer: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    // Backward compatibility for older records.
    faq: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'bots',
  }
);

export default mongoose.model('Bot', botSchema);
