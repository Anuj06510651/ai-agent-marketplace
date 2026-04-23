import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildApiUrl } from '../utils/api';

export default function PublicBot() {
  const { slug = '' } = useParams();
  const [bot, setBot] = useState(null);
  const [loadingBot, setLoadingBot] = useState(true);
  const [botError, setBotError] = useState('');

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    let active = true;

    const loadBot = async () => {
      setLoadingBot(true);
      setBotError('');

      try {
        const response = await fetch(buildApiUrl(`/api/bot/${encodeURIComponent(slug)}`));
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Unable to load bot.');
        }

        if (!active) {
          return;
        }

        setBot(payload.data);
        setMessages([
          {
            role: 'bot',
            text: payload?.data?.shopName
              ? `Hi 👋 Welcome to ${payload.data.shopName}. Ask me anything about our services.`
              : 'Hi 👋 Ask me anything about services, pricing, or location.',
          },
        ]);
      } catch (error) {
        if (!active) {
          return;
        }

        setBotError(error.message || 'Unable to load public bot.');
      } finally {
        if (active) {
          setLoadingBot(false);
        }
      }
    };

    loadBot();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !bot?.slug) {
      return;
    }

    const question = chatInput.trim();
    const history = messages.slice(-5).map((item) => ({
      sender: item.role === 'user' ? 'user' : 'bot',
      text: item.text,
    }));

    setChatInput('');
    setChatError('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setChatLoading(true);

    try {
      const response = await fetch(buildApiUrl('/api/chat/public'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          slug: bot.slug,
          history,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to get bot reply.');
      }

      setMessages((prev) => [...prev, { role: 'bot', text: payload.reply }]);
    } catch (error) {
      setChatError(error.message || 'Unable to reach bot right now.');
    } finally {
      setChatLoading(false);
    }
  };

  if (loadingBot) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-slate-700 shadow-sm">Loading your chatbot...</div>
      </div>
    );
  }

  if (botError || !bot) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-bold text-red-700">Bot not available</h1>
          <p className="text-sm text-red-600 mt-2">{botError || 'This public bot link is invalid.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-bold">Public Concierge</p>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">Chat with {bot.shopName}</h1>
          <p className="text-sm text-slate-500 mt-2">Ask about pricing, services, timings, location, and FAQs.</p>
        </header>

        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden h-[72vh] flex flex-col shadow-sm">
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white rounded-br-sm'
                    : 'mr-auto bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                }`}
              >
                {message.text}
              </div>
            ))}

            {chatLoading && (
              <div className="max-w-[70%] mr-auto bg-white border border-slate-200 rounded-xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-500">
                Bot is typing...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-3 md:p-4 border-t border-slate-200 flex gap-2 md:gap-3 bg-white">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-4 md:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl disabled:opacity-70"
            >
              Send
            </button>
          </form>
          {chatError && <p className="px-4 pb-3 text-sm text-red-600">{chatError}</p>}
        </section>

        <footer className="text-center text-xs text-slate-500 pb-2">Powered by YourApp</footer>
      </div>
    </div>
  );
 }
