export function generateReply(message = '') {
  const normalized = message.toLowerCase();

  const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening'];
  const pricingWords = ['price', 'pricing', 'cost', 'charges', 'plan', 'package'];
  const bookingWords = ['book', 'booking', 'appointment', 'schedule', 'reserve', 'slot'];

  if (greetingWords.some((word) => normalized.includes(word))) {
    return {
      reply: 'Hello! How can I help you?',
      brainModeUsed: 'rules',
    };
  }

  if (pricingWords.some((word) => normalized.includes(word))) {
    return {
      reply: 'Our pricing starts from ₹999/month.',
      brainModeUsed: 'rules',
    };
  }

  if (bookingWords.some((word) => normalized.includes(word))) {
    return {
      reply: 'Sure! Please share your preferred date and time for booking.',
      brainModeUsed: 'rules',
    };
  }

  return {
    reply: 'We will contact you shortly',
    brainModeUsed: 'rules',
  };
}