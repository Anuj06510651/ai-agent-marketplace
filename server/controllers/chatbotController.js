import ShopBotConfig from '../models/ShopBotConfig.js';
import mongoose from 'mongoose';
import { generateChatbotReply } from '../utils/chatbotBrain.js';
import {
  generateGeminiReply,
  getGeminiRuntimeConfig,
  isGeminiConfigured,
  probeGeminiConnection,
} from '../utils/geminiBrain.js';
import { getPrototypeOnboardingById } from '../store/prototypeStore.js';

export async function getBrainStatus(req, res) {
  try {
    const brainMode = (process.env.BRAIN_MODE || 'rules').toLowerCase();
    const probeRequested = ['1', 'true', 'yes'].includes((req.query?.probe || '').toString().toLowerCase());
    const geminiConfig = getGeminiRuntimeConfig();

    let geminiProbe = {
      ok: false,
      status: geminiConfig.configured ? 'not-probed' : 'missing-api-key',
      message: geminiConfig.configured
        ? 'Live probe skipped. Add ?probe=1 to run connectivity test.'
        : 'GEMINI_API_KEY is missing',
    };

    if (probeRequested) {
      geminiProbe = await probeGeminiConnection();
    }

    return res.json({
      success: true,
      data: {
        brainMode,
        mongoConnected: mongoose.connection.readyState === 1,
        gemini: {
          configured: geminiConfig.configured,
          model: geminiConfig.model,
          fallbackModels: geminiConfig.fallbackModels,
          probe: geminiProbe,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check brain status.',
    });
  }
}

export async function simulateChat(req, res) {
  try {
    const brainMode = (process.env.BRAIN_MODE || 'rules').toLowerCase();
    const { id } = req.params;
    const { customerPhone = 'unknown', customerName = '', question = '' } = req.body;

    if (!question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required.',
      });
    }

    const isMongoConnected = mongoose.connection.readyState === 1;
    const config = isMongoConnected
      ? await ShopBotConfig.findById(id).lean()
      : getPrototypeOnboardingById(id);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot setup not found.',
      });
    }

    const rulesResult = generateChatbotReply({
      config,
      customerPhone,
      customerName,
      question,
    });

    let result = {
      ...rulesResult,
      brainModeUsed: 'rules',
      brainError: null,
    };

    const modeAllowsGemini = brainMode === 'gemini' || brainMode === 'hybrid';
    if (modeAllowsGemini && isGeminiConfigured()) {
      try {
        const geminiReply = await generateGeminiReply({
          config,
          question,
          customerName,
          rulesResult,
        });

        result = {
          ...rulesResult,
          reply: geminiReply,
          intent: brainMode === 'hybrid' ? `${rulesResult.intent}+gemini` : 'gemini',
          confidence: Math.max(0.7, rulesResult.confidence),
          brainModeUsed: brainMode,
        };
      } catch (geminiError) {
        console.warn('Gemini failed, fallback to rules engine:', geminiError.message);
        result = {
          ...rulesResult,
          brainModeUsed: 'rules-fallback',
          brainError: geminiError.message,
        };
      }
    } else if (brainMode === 'gemini' && !isGeminiConfigured()) {
      result = {
        ...rulesResult,
        brainModeUsed: 'rules-fallback-no-api-key',
        brainError: 'GEMINI_API_KEY missing in environment',
      };
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('simulateChat error', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to simulate chatbot response.',
    });
  }
}
