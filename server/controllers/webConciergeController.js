import mongoose from 'mongoose';
import Bot from '../models/Bot.js';
import { generateReply } from '../utils/webConciergeBrain.js';

const requiredFields = ['shopName', 'services', 'pricing', 'location', 'timings'];
const prototypeBotsById = new Map();
const prototypeBotIdsBySlug = new Map();

function isMongoReady() {
  return mongoose.connection.readyState === 1;
}

function validateSetupPayload(payload = {}) {
  return requiredFields.filter((field) => !payload[field]?.toString().trim());
}

function parseServices(servicesRaw = '') {
  return servicesRaw
    .toString()
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCustomFAQs(rawFaqs = []) {
  if (!Array.isArray(rawFaqs)) {
    return [];
  }

  return rawFaqs
    .map((faq) => ({
      question: faq?.question?.toString().trim() || '',
      answer: faq?.answer?.toString().trim() || '',
    }))
    .filter((faq) => faq.question && faq.answer);
}

function slugifyShopName(shopName = '') {
  return shopName
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateUniqueSlug(shopName = '') {
  const baseSlug = slugifyShopName(shopName) || `shop-${Math.floor(1000 + Math.random() * 9000)}`;
  let candidate = baseSlug;
  let exists = isMongoReady() ? await Bot.exists({ slug: candidate }) : prototypeBotIdsBySlug.has(candidate);

  while (exists) {
    candidate = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    exists = isMongoReady() ? await Bot.exists({ slug: candidate }) : prototypeBotIdsBySlug.has(candidate);
  }

  return candidate;
}

function createPrototypeBot(payload = {}) {
  const id = `proto_bot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const bot = {
    _id: id,
    shopName: payload.shopName,
    slug: payload.slug,
    services: payload.services,
    pricing: payload.pricing,
    location: payload.location,
    timings: payload.timings,
    customFAQs: payload.customFAQs || [],
    createdAt: new Date(),
  };

  prototypeBotsById.set(id, bot);
  prototypeBotIdsBySlug.set(bot.slug, id);
  return bot;
}

function getPrototypeBotById(id = '') {
  return prototypeBotsById.get(id) || null;
}

function getPrototypeBotBySlug(slug = '') {
  const botId = prototypeBotIdsBySlug.get(slug);
  if (!botId) {
    return null;
  }

  return prototypeBotsById.get(botId) || null;
}

function getPublicBotData(bot) {
  if (!bot) {
    return null;
  }

  return {
    shopName: bot.shopName,
    slug: bot.slug,
    services: bot.services,
    pricing: bot.pricing,
    location: bot.location,
    timings: bot.timings,
    customFAQs: Array.isArray(bot.customFAQs)
      ? bot.customFAQs.map((faq) => ({ question: faq.question, answer: faq.answer }))
      : [],
  };
}

export async function setupBot(req, res) {
  try {
    const missing = validateSetupPayload(req.body);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const services = parseServices(req.body.services);
    if (services.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one service.',
      });
    }

    const customFAQs = parseCustomFAQs(req.body.customFAQs);

    const slug = await generateUniqueSlug(req.body.shopName);
    const normalizedPayload = {
      shopName: req.body.shopName.trim(),
      slug,
      services,
      pricing: req.body.pricing.trim(),
      location: req.body.location.trim(),
      timings: req.body.timings.trim(),
      customFAQs,
    };

    const bot = isMongoReady()
      ? await Bot.create(normalizedPayload)
      : createPrototypeBot(normalizedPayload);

    return res.status(201).json({
      success: true,
      data: {
        botId: bot._id,
        slug: bot.slug,
      },
    });
  } catch (error) {
    console.error('setupBot error', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to setup bot right now.',
    });
  }
}

export async function getPublicBotBySlug(req, res) {
  try {
    const slug = req.params?.slug?.toString().trim().toLowerCase() || '';
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'slug is required.',
      });
    }

    const bot = isMongoReady() ? await Bot.findOne({ slug }).lean() : getPrototypeBotBySlug(slug);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'Bot not found.',
      });
    }

    return res.json({
      success: true,
      data: getPublicBotData(bot),
    });
  } catch (error) {
    console.error('getPublicBotBySlug error', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch public bot right now.',
    });
  }
}

export async function chatWithPublicBot(req, res) {
  try {
    const message = req.body?.message?.toString().trim() || '';
    const slug = req.body?.slug?.toString().trim().toLowerCase() || '';
    if (!message || !slug) {
      return res.status(400).json({
        success: false,
        message: 'message and slug are required.',
      });
    }

    const bot = isMongoReady() ? await Bot.findOne({ slug }).lean() : getPrototypeBotBySlug(slug);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'Bot not found.',
      });
    }

    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history = rawHistory
      .filter((item) => item && (item.sender === 'user' || item.sender === 'bot') && typeof item.text === 'string')
      .slice(-5)
      .map((item) => ({
        sender: item.sender,
        text: item.text.toString().trim(),
      }));

    const result = generateReply(message, bot, history);
    return res.json({
      reply: result.reply,
    });
  } catch (error) {
    console.error('chatWithPublicBot error', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process public chat right now.',
    });
  }
}

export async function chatWithBot(req, res) {
  try {
    const message = req.body?.message?.toString().trim() || '';
    const botId = req.body?.botId?.toString().trim() || '';
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history = rawHistory
      .filter((item) => item && (item.sender === 'user' || item.sender === 'bot') && typeof item.text === 'string')
      .slice(-5)
      .map((item) => ({
        sender: item.sender,
        text: item.text.toString().trim(),
      }));

    if (!message || !botId) {
      return res.status(400).json({
        success: false,
        message: 'message and botId are required.',
      });
    }

    const bot = isMongoReady() ? await Bot.findById(botId).lean() : getPrototypeBotById(botId);
    if (!bot) {
      return res.status(404).json({
        success: false,
        message: 'Bot not found. Please setup bot first.',
      });
    }

    const result = generateReply(message, bot, history);

    return res.json(result);
  } catch (error) {
    console.error('chatWithBot error', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process chat right now.',
    });
  }
}
