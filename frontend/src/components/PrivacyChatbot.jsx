import React, { useEffect, useRef, useState } from "react";
import { Bot, X, Send, ShieldCheck, Sparkles, RotateCcw } from "lucide-react";
import { API_URL } from "../api";

const starters = [
  "How can I protect my privacy online?",
  "What do cookies and trackers do?",
  "How do I secure my social media accounts?",
];

export default function PrivacyChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m your Privacy Assistant. Ask me about website permissions, tracking, data sharing, passwords, or safer browsing. I can explain your Digital Privacy Checker results, too." },
  ]);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function sendMessage(text = input) {
    const question = text.trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user", content: question }];
    setMessages(next); setInput(""); setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: next.slice(-9).map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant is temporarily unavailable.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: `${error.message} Check that the backend is running and try again.` }]);
    } finally { setBusy(false); }
  }

  function resetChat() {
    setMessages([{ role: "assistant", content: "Chat cleared. What would you like to know about digital privacy?" }]);
  }

  return <>
    {open && <section className="privacy-chat" role="dialog" aria-label="Privacy Assistant">
      <header className="privacy-chat__header">
        <div className="privacy-chat__avatar"><ShieldCheck size={20} /></div>
        <div className="privacy-chat__identity"><strong>Privacy Assistant</strong><span><span className="privacy-chat__online" /> Digital privacy help</span></div>
        <button className="privacy-chat__icon-btn" onClick={resetChat} aria-label="Clear chat" title="Clear chat"><RotateCcw size={16} /></button>
        <button className="privacy-chat__icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><X size={19} /></button>
      </header>
      <div className="privacy-chat__messages" aria-live="polite">
        {messages.map((message, index) => <div className={`privacy-chat__message privacy-chat__message--${message.role}`} key={index}>
          {message.role === "assistant" && <span className="privacy-chat__message-icon"><Bot size={15} /></span>}
          <div className="privacy-chat__bubble">{message.content}</div>
        </div>)}
        {messages.length === 1 && <div className="privacy-chat__suggestions">{starters.map((s) => <button key={s} onClick={() => sendMessage(s)}>{s}</button>)}</div>}
        {busy && <div className="privacy-chat__typing"><span /><span /><span /> Thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <form className="privacy-chat__composer" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your privacy…" aria-label="Message Privacy Assistant" maxLength={2000} disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Send size={17} /></button>
      </form>
      <div className="privacy-chat__footnote"><Sparkles size={12} /> Privacy guidance, not legal advice</div>
    </section>}
    <button className={`privacy-chat-launcher ${open ? "is-open" : ""}`} onClick={() => setOpen((v) => !v)} aria-label={open ? "Close Privacy Assistant" : "Open Privacy Assistant"}>
      {open ? <X size={23} /> : <><Bot size={23} /><span className="privacy-chat-launcher__label">Ask AI</span></>}
      {!open && <span className="privacy-chat-launcher__dot" />}
    </button>
  </>;
}
