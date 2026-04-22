import ShopBotConfig from '../models/ShopBotConfig.js';
import CustomerProfile from '../models/CustomerProfile.js';
import mongoose from 'mongoose';
import { generateBotPayload } from '../utils/botTemplate.js';
import {
  generatePrototypeId,
  getPrototypeOnboardingById,
  savePrototypeOnboarding,
} from '../store/prototypeStore.js';

const requiredFields = [
  'shopName',
  'ownerName',
  'whatsappNumber',
  'businessType',
  'openingHours',
];

function validateBody(body) {
  const missing = requiredFields.filter((field) => !body[field]?.trim?.());
  return missing;
}

function buildOnboardingPayload(body, generated) {
  return {
    shopName: body.shopName.trim(),
    ownerName: body.ownerName.trim(),
    whatsappNumber: body.whatsappNumber.trim(),
    businessType: body.businessType.trim(),
    businessDescription: body.businessDescription?.trim() || '',
    primaryGoal: body.primaryGoal?.trim() || '',
    address: body.address?.trim() || '',
    serviceArea: body.serviceArea?.trim() || '',
    openingHours: body.openingHours.trim(),
    services: generated.services,
    faq: generated.faq,
    leadCaptureFields: generated.leadCaptureFields,
    escalationNumber: body.escalationNumber?.trim() || '',
    bookingLink: body.bookingLink?.trim() || '',
    pricingNotes: body.pricingNotes?.trim() || '',
    unavailableReply: generated.fallbackMessage,
    preferredLanguage: body.preferredLanguage?.trim() || 'English',
    tone: body.tone?.trim() || 'Friendly',
    receptionistName: generated.receptionistName,
    chatbotStatus: 'ready',
    paymentStatus: 'pending',
    welcomeMessage: generated.welcomeMessage,
    fallbackMessage: generated.fallbackMessage,
    quickReplies: generated.quickReplies,
    generatedPrompt: generated.generatedPrompt,
  };
}

function buildCustomerProfilePayload(payload, onboardingConfigId) {
  return {
    onboardingConfigId,
    shopName: payload.shopName,
    ownerName: payload.ownerName,
    whatsappNumber: payload.whatsappNumber,
    businessType: payload.businessType,
    businessDescription: payload.businessDescription,
    primaryGoal: payload.primaryGoal,
    address: payload.address,
    serviceArea: payload.serviceArea,
    openingHours: payload.openingHours,
    services: payload.services,
    faq: payload.faq,
    leadCaptureFields: payload.leadCaptureFields,
    escalationNumber: payload.escalationNumber,
    bookingLink: payload.bookingLink,
    pricingNotes: payload.pricingNotes,
    unavailableReply: payload.unavailableReply,
    preferredLanguage: payload.preferredLanguage,
    tone: payload.tone,
    receptionistName: payload.receptionistName,
    chatbotStatus: payload.chatbotStatus,
    paymentStatus: payload.paymentStatus,
  };
}

export async function createOnboarding(req, res) {
  try {
    const missing = validateBody(req.body);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const generated = generateBotPayload(req.body);

    const payload = buildOnboardingPayload(req.body, generated);
    const isMongoConnected = mongoose.connection.readyState === 1;

    const saved = isMongoConnected
      ? await ShopBotConfig.create(payload)
      : savePrototypeOnboarding({
        _id: generatePrototypeId(),
        ...payload,
        createdAt: new Date().toISOString(),
      });

    if (isMongoConnected) {
      const customerProfilePayload = buildCustomerProfilePayload(payload, saved._id);
      await CustomerProfile.findOneAndUpdate(
        { whatsappNumber: payload.whatsappNumber },
        customerProfilePayload,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: isMongoConnected
        ? 'WhatsApp chatbot prototype is ready.'
        : 'WhatsApp chatbot prototype is ready (temporary memory mode: MongoDB unavailable).',
      data: {
        id: saved._id,
        chatbotStatus: saved.chatbotStatus,
        paymentStatus: saved.paymentStatus,
        receptionistName: saved.receptionistName,
        welcomeMessage: saved.welcomeMessage,
        quickReplies: saved.quickReplies,
        generatedPrompt: saved.generatedPrompt,
      },
    });
  } catch (error) {
    console.error('createOnboarding error', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating chatbot setup.',
    });
  }
}

export async function getOnboardingById(req, res) {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const record = isMongoConnected
      ? await ShopBotConfig.findById(req.params.id).lean()
      : getPrototypeOnboardingById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Setup not found.' });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch setup.' });
  }
}
