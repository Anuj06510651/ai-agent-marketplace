import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthHeaders } from '../utils/auth';
import { buildApiUrl } from '../utils/api';

const predefinedFaqs = [
  {
    key: 'delivery',
    question: 'Do you offer home delivery?',
    type: 'yesno',
  },
  {
    key: 'booking',
    question: 'Do you take advance booking?',
    type: 'yesno',
  },
  {
    key: 'payment',
    question: 'What payment methods do you accept?',
    type: 'text',
    placeholder: 'UPI, card, cash',
  },
  {
    key: 'turnaround',
    question: 'What is the average service time?',
    type: 'text',
    placeholder: 'Usually 30-45 mins',
  },
  {
    key: 'contact',
    question: 'What is the best contact number/channel?',
    type: 'text',
    placeholder: 'Phone number, WhatsApp or email',
  },
];

const initialForm = {
  shopName: '',
  services: '',
  pricing: '',
  location: '',
  timings: '',
  faqAnswers: predefinedFaqs.reduce((acc, item) => {
    acc[item.key] = '';
    return acc;
  }, {}),
};

export default function WebConcierge() {
  const location = useLocation();
  const source = location.state?.source || 'direct';
  const [form, setForm] = useState(initialForm);
  const [botId, setBotId] = useState('');
  const [botSlug, setBotSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  const showChat = Boolean(botId);
  const shareLink = botSlug ? `${window.location.origin}/bot/${botSlug}` : '';

  const welcomeMessage = useMemo(() => {
    if (!form.shopName.trim()) {
      return 'Hi 👋 I am your Web Concierge AI. Ask me about services, pricing, and location.';
    }

    return `Hi 👋 I am ${form.shopName} Web Concierge. Ask me anything about our services.`;
  }, [form.shopName]);

  useEffect(() => {
    if (showChat && messages.length === 0) {
      setMessages([{ role: 'bot', text: welcomeMessage }]);
    }
  }, [showChat, messages.length, welcomeMessage]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateFaqAnswer = (key, value) => {
    setForm((prev) => ({
      ...prev,
      faqAnswers: {
        ...prev.faqAnswers,
        [key]: value,
      },
    }));
  };

  const buildCustomFaqs = () => {
    return predefinedFaqs
      .map((item) => ({
        question: item.question,
        answer: (form.faqAnswers[item.key] || '').trim(),
      }))
      .filter((faq) => faq.answer.length > 0);
  };

  const setupBot = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const customFAQs = buildCustomFaqs();
      const response = await fetch(buildApiUrl('/api/setup-bot'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          shopName: form.shopName,
          services: form.services,
          pricing: form.pricing,
          location: form.location,
          timings: form.timings,
          customFAQs,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to save bot setup.');
      }

      setBotId(payload.data.botId);
  setBotSlug(payload.data.slug || '');
  setCopied(false);
      setMessages([]);
    } catch (error) {
      setFormError(error.message || 'Unable to save bot setup.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setChatError('Unable to copy link. Please copy it manually.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !botId) {
      return;
    }

    const question = chatInput.trim();
    const history = messages
      .slice(-5)
      .map((item) => ({
        sender: item.role === 'user' ? 'user' : 'bot',
        text: item.text,
      }));

    setChatInput('');
    setChatError('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          message: question,
          botId,
          history,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to get bot reply.');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: payload.reply, mode: payload.brainModeUsed },
      ]);
    } catch (error) {
      setChatError(error.message || 'Unable to reach bot right now.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">Web Concierge AI Agent</h1>
        <p className="text-sm text-slate-500 mt-1">
          {source === 'marketplace-card'
            ? 'Configure your business bot and start chatting instantly.'
            : 'Set up your business bot details to enable dynamic rule-based chat.'}
        </p>
      </section>

      {!showChat && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Bot Configuration</h2>
          <form onSubmit={setupBot} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Shop Name" value={form.shopName} onChange={(v) => updateField('shopName', v)} required />
            <Input
              label="Services (comma-separated)"
              value={form.services}
              onChange={(v) => updateField('services', v)}
              required
              placeholder="Haircut, Facial, Hair spa"
            />
            <Input label="Pricing" value={form.pricing} onChange={(v) => updateField('pricing', v)} required />
            <Input label="Location" value={form.location} onChange={(v) => updateField('location', v)} required />
            <Input
              label="Timings (fixed format)"
              value={form.timings}
              onChange={(v) => updateField('timings', v)}
              required
              placeholder="Mon-Sat: 10:00 AM - 8:00 PM"
            />

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Custom FAQs (Training Q&A)</h3>
              <p className="text-xs text-slate-500">These answers are matched first using similarity, then intent rules are used.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedFaqs.map((item) => (
                  <label key={item.key} className="block text-sm font-semibold text-slate-700">
                    {item.question}
                    {item.type === 'yesno' ? (
                      <select
                        value={form.faqAnswers[item.key]}
                        onChange={(e) => updateFaqAnswer(item.key, e.target.value)}
                        required
                        className="mt-1.5 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                      >
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <input
                        value={form.faqAnswers[item.key]}
                        onChange={(e) => updateFaqAnswer(item.key, e.target.value)}
                        required
                        placeholder={item.placeholder}
                        className="mt-1.5 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-70"
              >
                {formSubmitting ? 'Saving bot...' : 'Save & Start Chat'}
              </button>
              {formError && <span className="text-sm text-red-600">{formError}</span>}
            </div>
          </form>
        </section>
      )}

      {showChat && (
        <section className="bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden h-[70vh] flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">{form.shopName || 'Web Concierge Chat'}</h3>
            <span className="text-xs text-slate-500">botId: {botId}</span>
          </div>

          <div className="px-5 py-3 border-b border-slate-200 bg-white">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Share your bot</p>
                <p className="text-sm text-slate-700 break-all">{shareLink || 'Public link will appear after setup.'}</p>
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                disabled={!shareLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white rounded-br-sm'
                    : 'mr-auto bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                }`}
              >
                <p>{message.text}</p>
                {message.mode && (
                  <span className="text-[11px] text-slate-500 block mt-1">mode: {message.mode}</span>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="max-w-[70%] mr-auto bg-white border border-slate-200 rounded-xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-500">
                Bot is typing...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 flex gap-3 bg-white">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about services, pricing, location, booking..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl disabled:opacity-70"
            >
              Send
            </button>
          </form>

          {chatError && <p className="px-4 pb-3 text-sm text-red-600">{chatError}</p>}
        </section>
      )}
    </div>
  );
}

function Input({ label, value, onChange, required = false, placeholder = '' }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-smooth"
      />
    </label>
  );
}
