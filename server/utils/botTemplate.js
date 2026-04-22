function sanitizeList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateBotPayload(input) {
  const services = sanitizeList(input.services);
  const faq = sanitizeList(input.faq);
  const leadCaptureFields = sanitizeList(input.leadCaptureFields || 'name,phone,requirement');
  const receptionistName = `${input.shopName} Assistant`;

  const welcomeMessage = `Hi 👋 Welcome to ${input.shopName}. I am ${receptionistName}. I can help you with product details, pricing, availability and booking.`;
  const fallbackMessage = input.unavailableReply?.trim()
    || `Thanks for your message. I'll share this with ${input.ownerName} and get back to you soon.`;

  const quickReplies = [
    {
      trigger: 'shop timing',
      response: `${input.shopName} is open during: ${input.openingHours}`,
    },
    {
      trigger: 'services',
      response: services.length
        ? `We currently offer: ${services.join(', ')}`
        : 'Please ask the owner for currently available services.',
    },
    {
      trigger: 'location',
      response: input.address
        ? `You can find us at: ${input.address}`
        : 'Please share your location with us and we will guide you.',
    },
    {
      trigger: 'booking',
      response: input.bookingLink
        ? `You can book directly here: ${input.bookingLink}`
        : 'Please share your preferred time and we will help you with booking.',
    },
    {
      trigger: 'pricing',
      response: input.pricingNotes
        ? input.pricingNotes
        : 'Pricing depends on requirement. Please share your need and we will guide you.',
    },
  ];

  const generatedPrompt = [
    `You are ${receptionistName}, a 24x7 WhatsApp receptionist for ${input.shopName}.`,
    `Business type: ${input.businessType}.`,
    input.businessDescription ? `Business details: ${input.businessDescription}.` : '',
    input.primaryGoal ? `Primary business goal: ${input.primaryGoal}.` : '',
    `Speak in a ${input.tone.toLowerCase()} tone and respond in ${input.preferredLanguage}.`,
    `Business hours: ${input.openingHours}.`,
    input.serviceArea ? `Service area: ${input.serviceArea}.` : '',
    services.length ? `Core services: ${services.join(', ')}.` : 'Core services: Ask owner for latest details.',
    faq.length ? `Important FAQs: ${faq.join(' | ')}.` : '',
    `Always capture these lead fields before handoff: ${leadCaptureFields.join(', ')}.`,
    input.escalationNumber ? `For urgent issues, escalate to: ${input.escalationNumber}.` : '',
    'Goals: answer FAQs, capture lead name + phone + requirement, and politely escalate complex issues to owner.',
    `If uncertain, use this fallback: "${fallbackMessage}"`,
  ].filter(Boolean).join(' ');

  return {
    services,
    faq,
    leadCaptureFields,
    receptionistName,
    welcomeMessage,
    fallbackMessage,
    quickReplies,
    generatedPrompt,
  };
}
