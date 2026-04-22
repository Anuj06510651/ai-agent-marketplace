const intentData = {
  pricing: ['price', 'pricing', 'cost', 'kitna', 'daam', 'kitna lagega', 'charges', 'rate', 'price batao', 'pricing details'],
  location: ['where', 'location', 'address', 'kahan', 'kahaan ho', 'shop kaha hai'],
  services: ['services', 'offer', 'products', 'kya milta hai', 'service kya kya hai', 'what do you provide'],
  greeting: ['hi', 'hello', 'hey', 'namaste'],
  booking: ['book', 'appointment', 'order', 'reserve', 'advance booking'],
  timings: ['timing', 'timings', 'hours', 'open', 'close', 'mon sat', 'shop timings'],
  delivery: ['delivery', 'home delivery', 'ghar pe', 'doorstep', 'deliver'],
  payment: ['payment', 'upi', 'card', 'cash', 'payment method', 'pay'],
  service_time: ['service time', 'average time', 'kitna time', 'how long', 'duration', 'lagta hai'],
  contact: ['contact', 'phone', 'number', 'call', 'whatsapp', 'email', 'channel'],
};

const intentThreshold = 0.4;
const faqThreshold = 0.5;
const hindiTokens = ['kya', 'hai', 'kitna', 'kahan', 'kaise', 'aur', 'batao', 'lagega', 'haan', 'nahi'];
const followUpHints = ['aur', 'details', 'more', 'discount', 'also', 'phir', 'thoda', 'any'];
const intentPriority = ['service_time', 'services', 'pricing', 'location', 'timings', 'delivery', 'booking', 'payment', 'contact', 'greeting'];
const keywordRules = {
  services: ['service', 'services', 'offer', 'provide', 'kya kya', 'kya milta'],
  pricing: ['price', 'pricing', 'cost', 'kitna', 'daam', 'charges', 'rate', 'lagega'],
  location: ['where', 'located', 'location', 'address', 'kahan', 'kahaan', 'shop kaha'],
  timings: ['timing', 'timings', 'hours', 'open', 'close', 'mon sat'],
  delivery: ['delivery', 'home delivery', 'ghar', 'doorstep', 'deliver'],
  booking: ['book', 'booking', 'appointment', 'reserve', 'advance'],
  payment: ['payment', 'upi', 'card', 'cash', 'pay'],
  service_time: ['service time', 'average time', 'kitna time', 'how long', 'duration', 'time lagta'],
  contact: ['contact', 'number', 'phone', 'call', 'whatsapp', 'email', 'channel'],
  greeting: ['hi', 'hello', 'hey', 'namaste'],
};

export function normalizeMessage(text = '') {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text = '') {
  return normalizeMessage(text).split(' ').filter(Boolean);
}

function unique(arr) {
  return [...new Set(arr)];
}

function buildNgrams(text, size = 3) {
  const compact = text.replace(/\s+/g, '');
  if (compact.length < size) {
    return compact ? [compact] : [];
  }

  const grams = [];
  for (let i = 0; i <= compact.length - size; i += 1) {
    grams.push(compact.slice(i, i + size));
  }

  return unique(grams);
}

// String similarity based on token overlap + character n-gram overlap.
export function similarity(a = '', b = '') {
  const left = normalizeMessage(a);
  const right = normalizeMessage(b);
  if (!left || !right) {
    return 0;
  }

  const leftTokens = unique(tokenize(left));
  const rightTokens = unique(tokenize(right));

  const tokenIntersection = leftTokens.filter((token) =>
    rightTokens.some((other) => other.startsWith(token) || token.startsWith(other))
  ).length;
  const tokenUnion = unique([...leftTokens, ...rightTokens]).length || 1;
  const tokenScore = tokenIntersection / tokenUnion;

  const leftNgrams = buildNgrams(left, 3);
  const rightNgrams = buildNgrams(right, 3);
  const ngramIntersection = leftNgrams.filter((gram) => rightNgrams.includes(gram)).length;
  const ngramUnion = unique([...leftNgrams, ...rightNgrams]).length || 1;
  const ngramScore = ngramIntersection / ngramUnion;

  return Number((tokenScore * 0.65 + ngramScore * 0.35).toFixed(3));
}

function getLastDetectedIntent(history = []) {
  const recentUserMessages = history
    .filter((item) => item?.sender === 'user' && typeof item.text === 'string')
    .slice(-5)
    .reverse();

  for (const item of recentUserMessages) {
    const { intent } = detectIntent(item.text, []);
    if (intent) {
      return intent;
    }
  }

  return null;
}

function getLastBotReply(history = []) {
  const lastBot = [...history].reverse().find((item) => item?.sender === 'bot' && item?.text);
  return lastBot?.text || '';
}

function selectVariation(candidates, lastBotReply = '') {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return '';
  }

  const filtered = candidates.filter((item) => item !== lastBotReply);
  const pool = filtered.length > 0 ? filtered : candidates;
  return pool[Math.floor(Math.random() * pool.length)];
}

function parseFaqList(botData = {}) {
  if (Array.isArray(botData.customFAQs) && botData.customFAQs.length > 0) {
    return botData.customFAQs
      .filter((faq) => faq?.question && faq?.answer)
      .map((faq) => ({
        question: normalizeMessage(faq.question),
        answer: faq.answer,
      }));
  }

  if (typeof botData.faq === 'string' && botData.faq.trim()) {
    return [{ question: normalizeMessage(botData.faq), answer: botData.faq.trim() }];
  }

  return [];
}

function findBestFaqMatch(message, botData) {
  const normalized = normalizeMessage(message);
  const faqList = parseFaqList(botData);
  if (!normalized || faqList.length === 0) {
    return null;
  }

  let best = null;
  for (const faq of faqList) {
    const score = similarity(normalized, faq.question);
    if (!best || score > best.score) {
      best = { ...faq, score };
    }
  }

  return best && best.score >= faqThreshold ? best : null;
}

export function detectLanguage(message = '') {
  const normalized = normalizeMessage(message);
  return hindiTokens.some((token) => normalized.includes(token)) ? 'hi' : 'en';
}

export function detectIntent(message = '', history = []) {
  const normalized = normalizeMessage(message);
  if (!normalized) {
    return { intent: null, score: 0 };
  }

  const keywordMatched = Object.entries(keywordRules)
    .filter(([, words]) => words.some((word) => normalized.includes(word)))
    .map(([intent]) => intent)
    .sort((a, b) => intentPriority.indexOf(a) - intentPriority.indexOf(b));

  if (keywordMatched.length > 0) {
    return { intent: keywordMatched[0], score: 1 };
  }

  const scoreBoard = Object.entries(intentData).map(([intent, phrases]) => {
    const score = phrases.reduce((best, phrase) => {
      const phraseScore = similarity(normalized, phrase);
      return phraseScore > best ? phraseScore : best;
    }, 0);

    return {
      intent,
      score,
    };
  });

  const maxScore = Math.max(...scoreBoard.map((entry) => entry.score));
  if (maxScore < intentThreshold) {
    return { intent: null, score: maxScore };
  }

  const winners = scoreBoard.filter((entry) => entry.score === maxScore).map((entry) => entry.intent);
  if (winners.length === 1) {
    return { intent: winners[0], score: maxScore };
  }

  const previousIntent = getLastDetectedIntent(history);
  if (previousIntent && winners.includes(previousIntent)) {
    return { intent: previousIntent, score: maxScore };
  }

  return { intent: winners[0], score: maxScore };
}

function asServiceText(botData = {}) {
  if (Array.isArray(botData.services) && botData.services.length > 0) {
    return botData.services.join(', ');
  }

  if (typeof botData.services === 'string') {
    return botData.services;
  }

  return 'N/A';
}

function addTimings(reply, botData) {
  if (!botData.timings) {
    return reply;
  }

  return `${reply} Timings: ${botData.timings}`;
}

function buildFallback(language) {
  return language === 'hi'
    ? 'Samajh gaya 👍 Main pricing, services, location, timings, booking, payment aur contact details mein help kar sakta hoon. Aap kya jaan-na chahenge?'
    : 'Got it 👍 I can help with pricing, services, location, timings, booking, payment, and contact details. What would you like to know?';
}

function findFaqAnswerByKeywords(botData = {}, keywords = []) {
  if (!Array.isArray(botData.customFAQs) || botData.customFAQs.length === 0 || keywords.length === 0) {
    return '';
  }

  const normalizedKeywords = keywords.map((word) => normalizeMessage(word));
  const found = botData.customFAQs.find((faq) => {
    const question = normalizeMessage(faq?.question || '');
    return normalizedKeywords.some((word) => question.includes(word));
  });

  return found?.answer?.trim() || '';
}

function buildIntentReply(intent, botData, language, lastBotReply) {
  const isHindi = language === 'hi';

  switch (intent) {
    case 'greeting': {
      const variants = isHindi
        ? [
          `Namaste 👋 ${botData.shopName} mein welcome hai. Aap kya poochna chahte hain?`,
          `Hello ji! ${botData.shopName} assistant yahan hai 😊 Pricing ya services pooch sakte hain.`,
          `Hi! Main ${botData.shopName} se hoon 👍 Kaise help karun?`,
        ]
        : [
          `Hello 👋 Welcome to ${botData.shopName}. What would you like to know?`,
          `Hi there! You're chatting with ${botData.shopName} 😊 Need pricing, services, or location?`,
          `Hey! ${botData.shopName} assistant here 👍 How can I help today?`,
        ];
      return selectVariation(variants, lastBotReply);
    }

    case 'pricing': {
      const variants = isHindi
        ? [
          `Hamari pricing ${botData.pricing} se start hoti hai 😊 Kya estimate chahiye?`,
          `Price around ${botData.pricing} rehta hai 👍 Kya package details bheju?`,
          `Pricing ${botData.pricing} hai. Kya discount options dekhna chahenge?`,
        ]
        : [
          `Our pricing starts from ${botData.pricing} 😊 Would you like an estimate?`,
          `It usually costs around ${botData.pricing} 👍 Want package details?`,
          `Pricing is ${botData.pricing}. Would you like discount options?`,
        ];
      return selectVariation(variants, lastBotReply);
    }

    case 'services': {
      const serviceText = asServiceText(botData);
      const variants = isHindi
        ? [
          `Hum ye services dete hain: ${serviceText} ✨ Kya kisi ek ki detail chahiye?`,
          `Available services: ${serviceText} 😊 Aapko kaunsi service chahiye?`,
        ]
        : [
          `We offer: ${serviceText} ✨ Want details on any specific one?`,
          `Available services are ${serviceText} 😊 Which one interests you?`,
        ];
      return selectVariation(variants, lastBotReply);
    }

    case 'location': {
      const variants = isHindi
        ? [
          `Hamari shop ${botData.location} mein hai 📍 Kya directions bheju?`,
          `Location: ${botData.location} 👍 Kya visit timing bhi share karun?`,
        ]
        : [
          `We are located at ${botData.location} 📍 Would you like directions?`,
          `Our shop is in ${botData.location} 👍 Want visiting timings too?`,
        ];
      return addTimings(selectVariation(variants, lastBotReply), botData);
    }

    case 'booking': {
      const variants = isHindi
        ? [
          'Bilkul! Date aur time share kariye, main booking note kar leta hoon 😊',
          'Advance booking available hai 👍 Preferred date/time bhej dijiye.',
        ]
        : [
          'Sure! Share your preferred date and time, and I will help with booking 😊',
          'Yes, we can do advance booking 👍 Please send your preferred slot.',
        ];
      return selectVariation(variants, lastBotReply);
    }

    case 'timings': {
      const timingText = botData.timings || 'Mon-Sat: 10:00 AM - 8:00 PM';
      const variants = isHindi
        ? [
          `Hamare shop timings ${timingText} hain 🕒`,
          `Timing ye hai: ${timingText} 👍`,
        ]
        : [
          `Our shop timings are ${timingText} 🕒`,
          `We are open during ${timingText} 👍`,
        ];
      return selectVariation(variants, lastBotReply);
    }

    case 'delivery': {
      const faqAnswer = findFaqAnswerByKeywords(botData, ['home delivery', 'delivery']);
      if (faqAnswer) {
        return isHindi ? `${faqAnswer} 🚚` : `${faqAnswer} 🚚`;
      }

      return isHindi
        ? 'Home delivery ka option availability area par depend karta hai. Aap apna location share karein, main confirm karta hoon 🚚'
        : 'Home delivery depends on your area. Share your location and I can confirm availability 🚚';
    }

    case 'payment': {
      const faqAnswer = findFaqAnswerByKeywords(botData, ['payment', 'payment methods', 'upi', 'card', 'cash']);
      if (faqAnswer) {
        return faqAnswer;
      }

      return isHindi
        ? 'Hum generally UPI, card, aur cash accept karte hain 💳'
        : 'We generally accept UPI, card, and cash 💳';
    }

    case 'service_time': {
      const faqAnswer = findFaqAnswerByKeywords(botData, ['average service time', 'service time', 'time']);
      if (faqAnswer) {
        return faqAnswer;
      }

      return isHindi
        ? 'Average service time usually 30-60 minutes hota hai, service type par depend karta hai ⏱️'
        : 'Average service time is usually around 30-60 minutes depending on the service type ⏱️';
    }

    case 'contact': {
      const faqAnswer = findFaqAnswerByKeywords(botData, ['contact number', 'contact', 'channel', 'phone']);
      if (faqAnswer) {
        return faqAnswer;
      }

      return isHindi
        ? `Aap humein ${botData.location || 'shop desk'} par visit kar sakte hain ya phone/WhatsApp par contact kar sakte hain 📞`
        : `You can visit us at ${botData.location || 'our shop desk'} or contact us via phone/WhatsApp 📞`;
    }

    default:
      return buildFallback(language);
  }
}

export function generateReply(message, botData, history = []) {
  const normalized = normalizeMessage(message);
  const compactHistory = Array.isArray(history) ? history.slice(-5) : [];
  const language = detectLanguage(normalized);
  const lastIntent = getLastDetectedIntent(compactHistory);
  const lastBotReply = getLastBotReply(compactHistory);

  if (!normalized) {
    return {
      reply: language === 'hi'
        ? `Aap apna sawal bhejiye 😊 Main ${botData.shopName} ke pricing, services aur location mein help kar sakta hoon.`
        : `Please share your question 😊 I can help with ${botData.shopName}'s pricing, services, and location.`,
      brainModeUsed: 'rules',
    };
  }

  const bestFaq = findBestFaqMatch(normalized, botData);
  if (bestFaq) {
    const faqReply = language === 'hi'
      ? `${bestFaq.answer} 😊 Kya aapko aur details chahiye?`
      : `${bestFaq.answer} 👍 Would you like more details?`;

    return {
      reply: faqReply,
      brainModeUsed: 'rules',
    };
  }

  const intentResult = detectIntent(normalized, compactHistory);
  let intent = intentResult.intent;

  const followUpDetected = followUpHints.some((word) => normalized.includes(word));
  if ((!intent || intentResult.score < intentThreshold) && (followUpDetected || compactHistory.length > 0) && lastIntent) {
    intent = lastIntent;
  }

  const reply = buildIntentReply(intent, botData, language, lastBotReply);
  return {
    reply,
    brainModeUsed: 'rules',
  };
}
