import { useEffect, useRef, useState } from 'react';

const starterMessage = {
  id: 'welcome',
  sender: 'bot',
  text: 'Hi 👋 I am your Web Concierge. Ask me about pricing or booking.',
};

export default function App() {
  const [phone, setPhone] = useState('+919999999999');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([starterMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const message = input.trim();

    if (!message || !phone.trim() || loading) {
      return;
    }

    setError('');
    const userMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          phone: phone.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to fetch chatbot reply');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: payload.reply,
          meta: payload.brainModeUsed,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Backend is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="chat-card">
        <header className="chat-header">
          <div>
            <h1>AI Web Concierge</h1>
            <p>Rule-based AI assistant • Localhost MVP</p>
          </div>
          <span className="status-dot" title="Online" />
        </header>

        <div className="phone-row">
          <label htmlFor="phone">Customer Phone</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
          />
        </div>

        <div ref={listRef} className="chat-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
              <p>{msg.text}</p>
              {msg.meta && <span className="meta">mode: {msg.meta}</span>}
            </div>
          ))}

          {loading && (
            <div className="bubble bot typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <small>Bot is typing...</small>
            </div>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={sendMessage} className="input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}