function getFallbackModels() {
  const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  return [
    defaultModel,
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ].filter((value, index, arr) => value && arr.indexOf(value) === index);
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY;
}

function buildBusinessContext(config) {
  return [
    `Shop: ${config.shopName}`,
    `Owner: ${config.ownerName}`,
    `Business Type: ${config.businessType}`,
    `Business Description: ${config.businessDescription || 'N/A'}`,
    `Goal: ${config.primaryGoal || 'Help customers and capture leads'}`,
    `Hours: ${config.openingHours}`,
    `Address: ${config.address || 'N/A'}`,
    `Service Area: ${config.serviceArea || 'N/A'}`,
    `Services: ${config.services?.join(', ') || 'N/A'}`,
    `FAQs: ${config.faq?.join(', ') || 'N/A'}`,
    `Pricing Notes: ${config.pricingNotes || 'N/A'}`,
    `Booking Link: ${config.bookingLink || 'N/A'}`,
    `Escalation Number: ${config.escalationNumber || 'N/A'}`,
    `Language: ${config.preferredLanguage || 'English'}`,
    `Tone: ${config.tone || 'Friendly'}`,
    `Fallback Message: ${config.fallbackMessage}`,
    `Lead Capture Fields: ${config.leadCaptureFields?.join(', ') || 'name,phone,requirement'}`,
  ].join('\n');
}

function buildPrompt({ config, question, customerName, rulesResult }) {
  const businessContext = buildBusinessContext(config);

  return [
    'You are a 24x7 WhatsApp receptionist for a local shop.',
    'Rules:',
    '- Reply in a friendly but concise way.',
    '- Do NOT invent facts, prices, policies, or services.',
    '- If data is missing, ask for details politely or use fallback style.',
    '- Prefer the configured language and tone.',
    '- Try to capture lead details when useful (name, phone, requirement).',
    '- Escalate complaints/urgent issues to owner if needed.',
    '',
    'Business Context:',
    businessContext,
    '',
    `Customer Name: ${customerName || 'Unknown'}`,
    `Customer Message: ${question}`,
    '',
    'Rule-Engine Suggestion (for grounding):',
    `Intent: ${rulesResult.intent}`,
    `Confidence: ${rulesResult.confidence}`,
    `Suggested Reply: ${rulesResult.reply}`,
    '',
    'Return ONLY the final customer-facing reply text.',
  ].join('\n');
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export function getGeminiRuntimeConfig() {
  return {
    configured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    fallbackModels: getFallbackModels(),
  };
}

export async function probeGeminiConnection() {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return {
      ok: false,
      status: 'missing-api-key',
      message: 'GEMINI_API_KEY is missing',
    };
  }

  const errors = [];

  for (const model of getFallbackModels()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Reply with only the word OK.' }] }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 8,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${model}: ${response.status}`);

        if (response.status === 400 || response.status === 404) {
          continue;
        }

        if (response.status === 429) {
          return {
            ok: false,
            status: 'quota-exceeded',
            model,
            message: errorText,
          };
        }

        return {
          ok: false,
          status: 'api-error',
          model,
          message: errorText,
        };
      }

      return {
        ok: true,
        status: 'connected',
        model,
      };
    } catch (error) {
      errors.push(`${model}: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    ok: false,
    status: 'unavailable',
    message: `Gemini models unavailable. Tried: ${errors.join(', ')}`,
  };
}

export async function generateGeminiReply({ config, question, customerName, rulesResult }) {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const prompt = buildPrompt({ config, question, customerName, rulesResult });
  const errors = [];

  for (const model of getFallbackModels()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 220,
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${model}: ${response.status}`);

        if (response.status === 404 || response.status === 400) {
          continue;
        }

        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const payload = await response.json();
      const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        errors.push(`${model}: empty response`);
        continue;
      }

      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(`Gemini models unavailable. Tried: ${errors.join(', ')}`);
}
