// Vercel serverless function: POST /api/chat
// Receives the chat history, adds the rulebook + knowledge as instructions,
// and asks Google Gemini for the next answer.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const MAX_MESSAGES = 12; // only the last few turns are sent, keeps it fast and cheap
const MAX_CHARS = 600; // per user message

function readKnowledge(file) {
  const text = readFileSync(join(process.cwd(), "knowledge", file), "utf8");
  return text.replace(/<!--[\s\S]*?-->/g, "").trim(); // drop notes meant for humans
}

export function buildSystemPrompt() {
  return `${readKnowledge("regeln.md")}\n\n# WISSEN\n${readKnowledge("wissen.md")}`;
}

export function toGeminiContents(messages) {
  return messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text.slice(0, MAX_CHARS) }],
    }));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // lets the widget run on kraftpunkt.bayern later
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Nur POST erlaubt." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY fehlt in den Vercel-Einstellungen." });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const contents = toGeminiContents(Array.isArray(body.messages) ? body.messages : []);
  if (contents.length === 0 || contents.at(-1).role !== "user") {
    return res.status(400).json({ error: "Keine Frage erhalten." });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 400 }, // low temperature = fewer made-up answers
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini error", response.status, JSON.stringify(data));
      const busy = response.status === 429;
      return res.status(busy ? 429 : 502).json({
        error: busy
          ? "Gerade sind sehr viele Anfragen da. Versuch es in einer Minute nochmal."
          : "Der Assistent ist gerade nicht erreichbar.",
      });
    }
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    return res.status(200).json({
      reply: text || "Dazu kann ich gerade nichts sagen. Schreib dem Team am besten direkt per WhatsApp.",
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Der Assistent ist gerade nicht erreichbar." });
  }
}
