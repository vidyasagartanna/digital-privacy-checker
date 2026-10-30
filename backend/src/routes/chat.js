const express = require("express");
const router = express.Router();

const SYSTEM_PROMPT = `You are Privacy Assistant, the friendly AI helper inside Digital Privacy Checker. Answer clearly and practically about digital privacy, website permissions, tracking cookies, browser fingerprinting, personal data collection/sharing/retention, passwords, phishing, account security, and how to interpret privacy scores. Use concise explanations and numbered steps when useful. Do not claim to have scanned a website unless scan data is provided. Be honest that automated checks are estimates, not a full security audit. Never ask users to share passwords, authentication codes, or sensitive personal data. This is general educational guidance, not legal advice.`;

function offlineReply(message) {
  const q = message.toLowerCase();
  if (/cookie|tracker|tracking|fingerprint/.test(q)) return "Cookies can remember sessions and preferences, while advertising/analytics trackers can follow activity across sites. To reduce tracking: block third-party cookies, review site permissions, use browser tracking protection, clear site data periodically, and reject optional cookies when you prefer. Some sites may need cookies to sign in or work correctly.";
  if (/password|passphrase|account|2fa|two.factor|authentication/.test(q)) return "Use a unique password for every account and store them in a reputable password manager. Turn on multi-factor authentication (an authenticator app or passkey is often preferable to SMS), keep recovery details current, and never share one-time codes. Secure your email account first because it can reset other passwords.";
  if (/phish|scam|suspicious link|fake email/.test(q)) return "Pause before clicking. Check the full sender address and domain, avoid links or attachments you weren't expecting, and visit the service by typing its address yourself. Never enter passwords or one-time codes from a link in a message. If you already entered credentials, change that password from the real site and enable MFA.";
  if (/permission|camera|microphone|location|contacts/.test(q)) return "Grant permissions only when a feature needs them. Prefer ‘while using the app’ or one-time access for location/camera/microphone, revoke unused permissions in your device or browser settings, and review permissions after installing updates. A permission being requested does not by itself prove misuse.";
  if (/score|risk|result|audit|checker/.test(q)) return "Your privacy score is a rule-based estimate based on the information entered or detected, such as permissions, data collection, tracking, sharing, and retention. A lower score means more privacy concerns under this model; it is not proof that a site is malicious. Check the individual categories and verify important claims against the site's privacy policy and browser permissions.";
  if (/share|sell|collect|personal data|privacy policy/.test(q)) return "Look for what data is collected, why it is needed, how long it is kept, and whether it is shared with affiliates or advertisers. Be cautious when a service requests data unrelated to its main purpose. Use privacy settings to limit ad personalization and delete data or accounts you no longer need.";
  return "Here are three useful privacy habits: (1) use unique passwords and enable multi-factor authentication, (2) limit camera, microphone, location, and contacts permissions to what an app truly needs, and (3) block unnecessary third-party tracking and keep your browser and devices updated. You can ask me about permissions, cookies, phishing, passwords, data sharing, or your privacy score. For AI-generated, tailored answers, configure OPENAI_API_KEY in the backend environment.";
}

router.post("/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Please enter a message." });
  if (message.length > 2000) return res.status(400).json({ error: "Message must be 2,000 characters or fewer." });
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10).filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string").map(m => ({ role: m.role, content: m.content.slice(0, 2000) })) : [];

  if (!process.env.OPENAI_API_KEY) return res.json({ reply: offlineReply(message), mode: "privacy-guide" });
  try {
    const upstream = await fetch(process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history], temperature: 0.4, max_tokens: 600 }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("AI provider request failed:", upstream.status, data?.error?.message || "unknown error");
      return res.status(502).json({ error: "The AI service could not answer right now. Check the API key and try again." });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) throw new Error("Empty AI response");
    return res.json({ reply: reply.trim(), mode: "ai" });
  } catch (error) {
    console.error("Chat assistant error:", error.message);
    return res.status(502).json({ error: "Could not reach the AI service. Please try again shortly." });
  }
});

module.exports = router;
