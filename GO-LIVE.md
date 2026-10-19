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

## 3. Embed on WordPress (5 minutes, needs a WordPress admin login)
Who: the owner, or whoever has an admin login for kraftpunkt.bayern (he can create an editor account for you).

1. Open `https://kraftpunkt.bayern/wp-admin` and log in.
2. Left menu → **Plugins → Add New** → search **WPCode** → **Install** → **Activate**.
3. Left menu → **Code Snippets → Header & Footer**.
4. Paste this line into the **Footer** box and click **Save Changes**:

```html
<script src="https://kraftpunkt-assistant.vercel.app/widget.js" defer></script>
```

5. Open kraftpunkt.bayern in a new tab: the blue chat bubble is now bottom right on every page.

To remove the chat again: delete the line and save.

## 4. Privacy policy
Add a paragraph that chat messages are processed by Google (Gemini API). The owner's privacy contact should word it. Not legal advice.

## 5. Test
Run `tests/testfragen.md` on the live site, on desktop and phone.

## Optional
- Own address, e.g. `chat.kraftpunkt.bayern` (Vercel → Domains)
- Transfer the Vercel project to the owner's account, or run it as a paid monthly service
