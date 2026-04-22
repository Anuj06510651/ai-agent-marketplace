import CustomerProfile from '../models/CustomerProfile.js';
import { generateReply } from '../services/ruleEngine.js';

export async function chatWithBot(req, res) {
  try {
    const { message = '', phone = '' } = req.body || {};

    if (!message.trim() || !phone.trim()) {
      return res.status(400).json({
        message: 'Both message and phone are required.',
      });
    }

    await CustomerProfile.findOneAndUpdate(
      { phone: phone.trim() },
      {
        phone: phone.trim(),
        lastMessage: message.trim(),
        timestamp: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const result = generateReply(message);
    return res.json(result);
  } catch (error) {
    console.error('chatWithBot error:', error.message);
    return res.status(500).json({
      message: 'Internal server error.',
    });
  }
}