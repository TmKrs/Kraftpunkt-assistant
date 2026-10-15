# Kraftpunkt Assistent

An AI chat assistant for **Der Kraftpunkt & Physio365**, a gym and physiotherapy studio in Neuötting, Germany. It answers visitors' questions (opening hours, prescriptions, courses, InBody, the Boost treadmill) **only from the studio's own website content**, and hands anything medical or unknown over to the team via WhatsApp, phone or the contact form.

Week 1 of my *one AI project a week* series.

## How it works

```
Browser (widget.js)  →  /api/chat (Vercel function)  →  Google Gemini
                          │
                          ├─ knowledge/regeln.md   the rulebook: tone, limits, "never invent facts"
                          └─ knowledge/wissen.md   the facts, collected from kraftpunkt.bayern
```

- **No hallucinations by design:** the model gets a fixed fact sheet, a strict "only answer from WISSEN" rule and a low temperature. Missing info (prices, course plan) is answered honestly with a pointer to the team.
- **No medical advice:** health questions are redirected to Physio365 or a doctor.
- **One-line embed:** `<script src="https://<deployment>/widget.js" defer></script>` adds the chat bubble to any site, including the studio's WordPress.

## What I learned

- Writing a rulebook (system prompt) and testing it against tricky questions: see `tests/testfragen.md`
- Grounding an AI in a fixed knowledge source instead of letting it guess
- Keeping API keys out of public code with environment variables

## Run it yourself

1. Get a free key at [Google AI Studio](https://aistudio.google.com).
2. Deploy to Vercel and add the environment variable `GEMINI_API_KEY` (optional: `GEMINI_MODEL`, default `gemini-3.5-flash-lite`).
3. Locally: `GEMINI_API_KEY=... npm run dev` and open http://localhost:3000. Tests: `npm test`.

> Demo project, not the studio's official website. The free Gemini tier is for testing only; a public launch in the EU needs Google's paid tier.
