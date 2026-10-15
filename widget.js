// Kraftpunkt chat widget. Embed anywhere with one line:
// <script src="https://<your-vercel-link>/widget.js" defer></script>
(function () {
  const script = document.currentScript;
  const API = (script && script.dataset.api) || new URL("/api/chat", script ? script.src : location.href).href;
  const ACCENT = (script && script.dataset.accent) || "#e4572e";

  const SUGGESTIONS = [
    "Wann habt ihr geöffnet?",
    "Wie reiche ich ein Rezept ein?",
    "Was kostet eine Mitgliedschaft?",
    "Was ist das Boost-Laufband?",
  ];
  const GREETING =
    "Hi! Ich bin der digitale Assistent vom Kraftpunkt. Frag mich zu Training, Kursen, Physio365 oder Öffnungszeiten.";

  const css = `
  .kp-btn{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:60px;height:60px;border-radius:16px;border:0;
    background:${ACCENT};color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25);display:grid;place-items:center}
  .kp-btn svg{width:28px;height:28px}
  .kp-win{position:fixed;right:20px;bottom:92px;z-index:2147483000;width:380px;height:380px;max-width:calc(100vw - 32px);
    background:#fff;color:#1b1b1b;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.28);display:none;flex-direction:column;
    overflow:hidden;font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .kp-win.open{display:flex}
  .kp-head{background:#151515;color:#fff;padding:12px 14px;display:flex;align-items:center;gap:10px}
  .kp-dot{width:10px;height:10px;border-radius:50%;background:#3ecf6e}
  .kp-title{font-weight:700;flex:1}.kp-title small{display:block;font-weight:400;opacity:.7;font-size:12px}
  .kp-x{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
  .kp-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f6f6f4}
  .kp-msg{max-width:85%;padding:8px 11px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}
  .kp-bot{background:#fff;border:1px solid #e6e6e2;align-self:flex-start;border-bottom-left-radius:4px}
  .kp-user{background:${ACCENT};color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  .kp-bot a{color:${ACCENT};font-weight:600}
  .kp-chips{display:flex;flex-wrap:wrap;gap:6px}
  .kp-chip{border:1px solid ${ACCENT};color:${ACCENT};background:#fff;border-radius:999px;padding:4px 10px;font-size:13px;cursor:pointer}
  .kp-typing{opacity:.6;font-style:italic}
  .kp-form{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}
  .kp-in{flex:1;border:1px solid #ddd;border-radius:10px;padding:8px 10px;font:inherit;min-width:0}
  .kp-send{border:0;background:${ACCENT};color:#fff;border-radius:10px;padding:0 14px;font-weight:600;cursor:pointer}
  .kp-send:disabled{opacity:.5}
  .kp-note{font-size:11px;color:#888;text-align:center;padding:0 10px 8px;background:#fff}
  @media (max-width:480px){.kp-win{right:16px;left:16px;width:auto;height:min(70vh,460px)}}`;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "kp-btn";
  btn.setAttribute("aria-label", "Chat öffnen");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

  const win = document.createElement("div");
  win.className = "kp-win";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", "Kraftpunkt Assistent");
  win.innerHTML = `
    <div class="kp-head"><span class="kp-dot"></span>
      <div class="kp-title">Kraftpunkt Assistent<small>Antwortet sofort, rund um die Uhr</small></div>
      <button class="kp-x" aria-label="Schließen">×</button></div>
    <div class="kp-log" aria-live="polite"></div>
    <form class="kp-form"><input class="kp-in" maxlength="600" placeholder="Deine Frage ..." aria-label="Deine Frage">
      <button class="kp-send" type="submit">Senden</button></form>
    <div class="kp-note">KI-Assistent, kann sich irren. Keine medizinische Beratung.</div>`;

  document.body.append(btn, win);
  const log = win.querySelector(".kp-log");
  const form = win.querySelector(".kp-form");
  const input = win.querySelector(".kp-in");
  const send = win.querySelector(".kp-send");
  const history = [];

  function escape(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  // Turn the AI's plain text into safe HTML: bold, links, phone numbers, emails.
  function format(text) {
    let html = escape(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(https?:\/\/[^\s<)]+[^\s<).,!?])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/([\w.+-]+@[\w-]+\.[\w.]+[\w])/g, '<a href="mailto:$1">$1</a>');
    return html;
  }

  function add(role, text) {
    const el = document.createElement("div");
    el.className = "kp-msg " + (role === "user" ? "kp-user" : "kp-bot");
    el.innerHTML = role === "user" ? escape(text) : format(text);
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function showSuggestions() {
    const wrap = document.createElement("div");
    wrap.className = "kp-chips";
    SUGGESTIONS.forEach((q) => {
      const chip = document.createElement("button");
      chip.className = "kp-chip";
      chip.type = "button";
      chip.textContent = q;
      chip.onclick = () => { wrap.remove(); ask(q); };
      wrap.appendChild(chip);
    });
    log.appendChild(wrap);
  }

  async function ask(question) {
    add("user", question);
    history.push({ role: "user", text: question });
    send.disabled = true;
    const typing = add("bot", "schreibt ...");
    typing.classList.add("kp-typing");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      const answer = data.reply || data.error || "Da ist etwas schiefgelaufen.";
      typing.remove();
      add("bot", answer);
      if (data.reply) history.push({ role: "assistant", text: data.reply });
      else history.pop();
    } catch {
      typing.remove();
      add("bot", "Ich bin gerade nicht erreichbar. Schreib dem Team gern per WhatsApp: https://wa.me/491715333398");
      history.pop();
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  let started = false;
  btn.onclick = () => {
    win.classList.toggle("open");
    if (!started) { started = true; add("bot", GREETING); showSuggestions(); }
    if (win.classList.contains("open")) input.focus();
  };
  win.querySelector(".kp-x").onclick = () => win.classList.remove("open");
  form.onsubmit = (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || send.disabled) return;
    input.value = "";
    ask(q);
  };
})();
