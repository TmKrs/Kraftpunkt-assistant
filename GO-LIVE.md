# Going live on kraftpunkt.bayern

## 1. Paid Gemini key (owner)
- Owner creates an API key in Google AI Studio on his own Google account and clicks "Set up billing" (paid tier is required for a public chat in the EU).
- Set a monthly budget alert in Google Cloud (e.g. 10 €).
- The key is never sent by chat or e-mail.

## 2. Vercel settings
Vercel → kraftpunkt-assistant → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | the owner's key |
| `ALLOWED_ORIGINS` | `https://kraftpunkt.bayern` |

Then Deployments → latest → "Redeploy".

## 3. Embed on WordPress
Install the free plugin **WPCode** (or Elementor Pro → Custom Code) and add this to the **footer** of all pages:

```html
<script src="https://kraftpunkt-assistant.vercel.app/widget.js" defer></script>
```

## 4. Privacy policy
Add a paragraph that chat messages are processed by Google (Gemini API). The owner's privacy contact should word it. Not legal advice.

## 5. Test
Run `tests/testfragen.md` on the live site, on desktop and phone.

## Optional
- Own address, e.g. `chat.kraftpunkt.bayern` (Vercel → Domains)
- Transfer the Vercel project to the owner's account, or run it as a paid monthly service
