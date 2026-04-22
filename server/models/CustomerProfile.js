import mongoose from 'mongoose';

const customerProfileSchema = new mongoose.Schema(
  {
    onboardingConfigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShopBotConfig',
      default: null,
    },
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true, unique: true },
    businessType: { type: String, required: true, trim: true },
    businessDescription: { type: String, default: '' },
    primaryGoal: { type: String, default: '' },
    address: { type: String, default: '' },
    serviceArea: { type: String, default: '' },
    openingHours: { type: String, required: true, trim: true },
    services: [{ type: String }],
    faq: [{ type: String }],
    leadCaptureFields: [{ type: String }],
    escalationNumber: { type: String, default: '' },
    bookingLink: { type: String, default: '' },
    pricingNotes: { type: String, default: '' },
    unavailableReply: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    tone: { type: String, default: 'Friendly' },
    receptionistName: { type: String, default: 'Shop Assistant' },
    chatbotStatus: {
      type: String,
      enum: ['draft', 'ready', 'live'],
      default: 'ready',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'mock-complete'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'customer_profiles',
  }
);

export default mongoose.model('CustomerProfile', customerProfileSchema);