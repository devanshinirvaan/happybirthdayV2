// api/dream.js
// Vercel serverless function: proxies requests to the Generative API securely.
// Keeps the API key as an environment variable and includes a small in-memory rate limiter.

const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30s window
const MAX_REQUESTS_PER_WINDOW = 6; // change as needed
const rateMap = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic origin check (optional: change/remove as needed)
  // const origin = req.headers.origin || '';
  // if (process.env.NODE_ENV === 'production' && origin !== 'https://your-vercel-url.vercel.app') {
  //   return res.status(403).json({ error: 'Origin not allowed' });
  // }

  // Rate limiter (per IP)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  rateMap.set(ip, entry);
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many requests — try again later' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const key = process.env.GENERATIVE_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) {
    console.error('Missing GENERATIVE_API_KEY env var');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.5-flash-preview-09-2025';
  const base = 'https://generativelanguage.googleapis.com/v1beta/models';
  const url = `${base}/${MODEL_NAME}:generateContent?key=${encodeURIComponent(key)}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "You are a poetic and deeply romantic narrator writing a short, future memory about the couple's imagined life together. Use a warm, sentimental tone." }]},
    // Add model-specific fields if needed
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Upstream API error', data);
      return res.status(r.status || 502).json({ error: data.error?.message || 'Upstream API error', raw: data });
    }

    // Return the full response to the client (or extract needed fields)
    return res.status(200).json(data);
  } catch (err) {
    console.error('dream function error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
