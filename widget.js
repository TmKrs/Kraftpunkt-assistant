// Kraftpunkt chat widget. Embed anywhere with one line:
// <script src="https://<your-vercel-link>/widget.js" defer></script>
(function () {
  const script = document.currentScript;
  const API = (script && script.dataset.api) || new URL("/api/chat", script ? script.src : location.href).href;
  const ACCENT = (script && script.dataset.accent) || "#3e94ef"; // Kraftpunkt blue
  const LOGO = "https://kraftpunkt.bayern/wp-content/uploads/2024/10/fav-new-300x300.png";

  const SUGGESTIONS = [
    "Wann habt ihr geöffnet?",
    "Wie reiche ich ein Rezept ein?",
    "Was kostet eine Mitgliedschaft?",
    "Was ist das Boost-Laufband?",
  ];
  const GREETING =
    "Hi! Ich bin der digitale Assistent vom Kraftpunkt. Frag mich zu Training, Kursen, Physio365 oder Öffnungszeiten.";

  const css = `
  .kp-btn{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:62px;height:62px;border-radius:50%;border:0;
    background:${ACCENT};color:#fff;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);display:grid;place-items:center;transition:transform .15s}
  .kp-btn:hover{transform:scale(1.06)}
  .kp-btn svg{width:28px;height:28px}
  .kp-win{position:fixed;right:20px;bottom:94px;z-index:2147483000;width:440px;height:min(640px,calc(100vh - 120px));max-width:calc(100vw - 32px);
    background:#111;color:#f5f5f5;border:1px solid #2a2a2a;border-radius:6px;box-shadow:0 18px 50px rgba(0,0,0,.6);display:none;flex-direction:column;
    overflow:hidden;font:14px/1.5 Montserrat,system-ui,-apple-system,"Segoe UI",sans-serif}
  .kp-win.open{display:flex}
  .kp-head{background:#000;color:#fff;padding:10px 12px;display:flex;align-items:center;gap:10px;border-bottom:3px solid ${ACCENT}}
  .kp-logo{width:34px;height:34px;border-radius:50%;background:#fff;object-fit:cover}
  .kp-title{flex:1;font:26px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.02em}
  .kp-title span{color:${ACCENT}}
  .kp-title small{display:block;font:500 11px/1.4 Montserrat,sans-serif;letter-spacing:0;color:#9a9a9a;margin-top:2px}
  .kp-x{background:none;border:0;color:#fff;font-size:24px;cursor:pointer;line-height:1}
  .kp-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#111}
  .kp-msg{max-width:85%;padding:8px 11px;border-radius:4px;white-space:pre-wrap;word-wrap:break-word}
  .kp-bot{background:#1e1e1e;border:1px solid #2c2c2c;align-self:flex-start}
  .kp-user{background:${ACCENT};color:#fff;align-self:flex-end}
  .kp-bot a{color:${ACCENT};font-weight:600}
  .kp-bot strong{color:#fff}
  .kp-chips{display:flex;flex-wrap:wrap;gap:6px}
  .kp-chip{border:1px solid #fff;color:#fff;background:transparent;border-radius:2px;padding:5px 10px;font:600 12px Montserrat,sans-serif;cursor:pointer}
  .kp-chip:hover{border-color:${ACCENT};color:${ACCENT}}
  .kp-typing{opacity:.6;font-style:italic}
  .kp-form{display:flex;gap:8px;padding:10px;border-top:1px solid #2a2a2a;background:#000}
  .kp-in{flex:1;border:1px solid #333;background:#151515;color:#fff;border-radius:3px;padding:8px 10px;font:inherit;min-width:0}
  .kp-in:focus{outline:2px solid ${ACCENT};outline-offset:-1px}
  .kp-send{border:0;background:#f6c344;color:#000;border-radius:3px;padding:0 14px;font:20px/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.03em;cursor:pointer}
  .kp-send:disabled{opacity:.5}
  .kp-note{font-size:10.5px;color:#777;text-align:center;padding:0 10px 8px;background:#000}
  @media (max-width:480px){.kp-win{right:12px;left:12px;bottom:88px;width:auto;height:calc(100vh - 110px)}}`;

  if (!document.querySelector('link[data-kp-fonts]')) {
    const fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.dataset.kpFonts = "";
    fonts.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700&display=swap";
    document.head.appendChild(fonts);
  }

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
    <div class="kp-head"><img class="kp-logo" src="${LOGO}" alt="">
      <div class="kp-title">Kraftpunkt <span>Assistent</span><small>Antwortet sofort, rund um die Uhr</small></div>
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
  function start(withChips) {
    if (started) return;
    started = true;
    add("bot", GREETING);
    if (withChips) showSuggestions();
  }
  btn.onclick = () => {
    win.classList.toggle("open");
    start(true);
    if (win.classList.contains("open")) input.focus();
  };
  // Lets the page open the chat with a ready-made question, e.g. from a "Mehr erfahren" button.
  window.kpAsk = (question) => {
    win.classList.add("open");
    start(false);
    if (!send.disabled) ask(question);
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
