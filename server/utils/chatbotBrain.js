const sessionMemory = new Map();

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function makeSessionKey(botId, customerPhone = 'unknown') {
  return `${botId}:${customerPhone}`;
}

function getMemory(botId, customerPhone) {
  const key = makeSessionKey(botId, customerPhone);
  if (!sessionMemory.has(key)) {
    sessionMemory.set(key, {
      turns: [],
      capturedLead: {},
      lastIntent: null,
    });
  }
  return sessionMemory.get(key);
}

function scoreMatch(questionTokens, knowledgeText) {
  const knowledgeTokens = new Set(tokenize(knowledgeText));
  if (knowledgeTokens.size === 0 || questionTokens.length === 0) {
    return 0;
  }

  const hitCount = questionTokens.filter((token) => knowledgeTokens.has(token)).length;
  const base = hitCount / Math.max(4, Math.min(questionTokens.length, 8));
  const boost = hitCount >= 2 ? 0.2 : 0;
  return Math.min(1, base + boost);
}

function normalizeLeadFields(fields = []) {
  return fields.map((field) => String(field).trim().toLowerCase()).filter(Boolean);
}

function isGreeting(text = '') {
  return /\b(hi|hello|hey|namaste|namaskar|hola|hii)\b/i.test(text.trim());
}

function buildKnowledgeEntries(config) {
  return [
    {
      intent: 'hours',
      text: `timing timings time open hours opening closing kab khula band ${config.openingHours}`,
      response: `${config.shopName} is open during: ${config.openingHours}.`,
    },
    {
      intent: 'location',
      text: `address location map where kaha kahaan kidhar ${config.address || ''} ${config.serviceArea || ''}`,
      response: config.address
        ? `You can find us at ${config.address}${config.serviceArea ? ` (${config.serviceArea})` : ''}.`
        : `We serve ${config.serviceArea || 'our local area'}. Share your location and we can guide you better.`,
    },
    {
      intent: 'services',
      text: `services service offer available provide karte ho milta hai kya ${config.services.join(' ')}`,
      response: config.services.length
        ? `We currently offer: ${config.services.join(', ')}.`
        : 'Please tell me what you need and I will connect you to the owner for service details.',
    },
    {
      intent: 'pricing',
      text: `price pricing cost charges quote rate kitna daam fees ${config.pricingNotes || ''}`,
      response: config.pricingNotes
        ? config.pricingNotes
        : 'Pricing depends on your requirement. Please share details and I will get you an exact quote.',
    },
    {
      intent: 'booking',
      text: `book booking appointment slot reserve schedule order order karna ${config.bookingLink || ''}`,
      response: config.bookingLink
        ? `You can book directly here: ${config.bookingLink}`
        : 'Please share your preferred date/time and I will help with booking.',
    },
    {
      intent: 'faq',
      text: `faq question help support ${config.faq.join(' ')}`,
      response: config.faq.length
        ? `Here are common things customers ask: ${config.faq.join(', ')}.`
        : config.fallbackMessage,
    },
  ];
}

function captureLeadFields(question, memory, leadFields = []) {
  const lowered = question.toLowerCase();
  const normalizedLeadFields = normalizeLeadFields(leadFields);

  if (normalizedLeadFields.includes('name')) {
    const nameMatch = question.match(/(?:my name is|my name|i am|i'm|mera naam|name)\s+([a-z][a-z\s]{1,30})/i);
    if (nameMatch) {
      const cleanedName = nameMatch[1]
        .replace(/\b(aur|and|phone|number|mera|my)\b.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedName) {
        memory.capturedLead.name = cleanedName;
      }
    }
  }

  if (normalizedLeadFields.includes('phone')) {
    const phoneMatch = question.match(/(\+?\d[\d\s-]{7,}\d)/);
    if (phoneMatch) {
      memory.capturedLead.phone = phoneMatch[1].trim();
    }
  }

  if (normalizedLeadFields.includes('requirement')) {
    const requirementSignals = ['need', 'want', 'chahiye', 'lena', 'book', 'order', 'price', 'charges', 'service'];
    if (requirementSignals.some((signal) => lowered.includes(signal))) {
      memory.capturedLead.requirement = question;
    }
  }
}

export function generateChatbotReply({ config, customerPhone, customerName, question }) {
  const memory = getMemory(config._id.toString(), customerPhone);
  const questionTokens = tokenize(question);
  const entries = buildKnowledgeEntries(config);

  const scored = entries
    .map((entry) => ({ ...entry, score: scoreMatch(questionTokens, entry.text) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const confidence = best?.score || 0;
  const leadFields = normalizeLeadFields(config.leadCaptureFields || []);

  captureLeadFields(question, memory, leadFields);

  let reply;
  let usedIntent = 'fallback';

  if (isGreeting(question)) {
    usedIntent = 'greeting';
    reply = config.welcomeMessage || `Welcome to ${config.shopName}. How can I help you today?`;
  }

  if (usedIntent !== 'greeting' && confidence >= 0.12) {
    usedIntent = best.intent;
    reply = best.response;
  } else if (usedIntent !== 'greeting') {
    const needsEscalation =
      question.toLowerCase().includes('complaint')
      || question.toLowerCase().includes('urgent')
      || question.toLowerCase().includes('problem')
      || question.toLowerCase().includes('not happy')
      || question.toLowerCase().includes('issue')
      || question.toLowerCase().includes('shikayat');

    if (needsEscalation && config.escalationNumber) {
      usedIntent = 'escalation';
      reply = `I understand. I am escalating this to our team right away. You can also call ${config.escalationNumber}.`;
    } else {
      reply = config.fallbackMessage;
    }
  }

  const missingLeadFields = leadFields.filter((field) => !memory.capturedLead[field]);
  if (missingLeadFields.length > 0 && usedIntent !== 'escalation') {
    if (usedIntent === 'greeting') {
      if (missingLeadFields.includes('requirement')) {
        reply = `${reply} Please tell me what you need today, and I’ll help right away.`;
      }
    } else {
      reply = `${reply} Also, to assist you better, please share: ${missingLeadFields.join(', ')}.`;
    }
  }

  const greeting = customerName ? `Hi ${customerName}, ` : 'Hi, ';
  const finalReply = `${greeting}${reply}`;

  memory.lastIntent = usedIntent;
  memory.turns.push({
    role: 'customer',
    message: question,
    at: new Date().toISOString(),
  });
  memory.turns.push({
    role: 'bot',
    message: finalReply,
    at: new Date().toISOString(),
  });

  if (memory.turns.length > 20) {
    memory.turns = memory.turns.slice(-20);
  }

  return {
    reply: finalReply,
    confidence: Number(confidence.toFixed(2)),
    intent: usedIntent,
    leadSnapshot: memory.capturedLead,
    turns: memory.turns,
  };
}
