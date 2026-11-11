/* widget.js
   The chat bubble for the website. It draws the button and the chat window,
   sends the visitor's messages to /api/chat, and shows the answers.
   Add it to the site with:  <script src="widget.js" defer></script>  */
(function () {
  "use strict";
  if (window.__hzChatLoaded) return;
  window.__hzChatLoaded = true;

  /* ---------- SETTINGS: easy things to change ---------- */
  var CONFIG = {
    apiUrl: "/api/chat",
    title: "Business Assistant",
    subtitle: "Ask about our services and pricing",
    welcome: "Hi there! \ud83d\udc4b How can I help you today?",
    suggestions: [
      "What services do you offer?",
      "How much does it cost?",
      "How can I book a consultation?"
    ],
    errorText: "Sorry, I'm having trouble right now. Please try again in a moment.",
    maxChars: 500,
    colors: {
      accent: "#4f46e5", // button, header and your messages
      accentText: "#ffffff", // text on the accent color
      background: "#ffffff", // chat window
      text: "#1f2937", // main text
      botBubble: "#f1f3f5", // assistant message background
      border: "#e5e7eb" // thin lines
    }
  };

  /* ---------- STYLES (all classes start with hz- so they never clash with the site) ---------- */
  var c = CONFIG.colors;
  var css = `
.hz-chat, .hz-chat * { box-sizing: border-box; }
.hz-chat {
  --hz-accent: ${c.accent}; --hz-accent-text: ${c.accentText}; --hz-bg: ${c.background};
  --hz-text: ${c.text}; --hz-bot: ${c.botBubble}; --hz-border: ${c.border};
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  font-size: 15px; line-height: 1.45; color: var(--hz-text);
}
.hz-launcher {
  position: fixed; right: 16px; bottom: 16px; z-index: 2147483000;
  width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--hz-accent); color: var(--hz-accent-text);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 20px rgba(0,0,0,.25); transition: transform .15s ease;
}
.hz-launcher:hover { transform: scale(1.06); }
.hz-launcher:focus-visible, .hz-send:focus-visible, .hz-chip:focus-visible, .hz-close:focus-visible {
  outline: 3px solid #93c5fd; outline-offset: 2px;
}
.hz-launcher svg { width: 26px; height: 26px; }
.hz-window {
  position: fixed; right: 16px; bottom: 84px; z-index: 2147483000;
  width: 360px; max-width: calc(100vw - 32px);
  height: 520px; max-height: calc(100vh - 110px); max-height: calc(100dvh - 110px);
  background: var(--hz-bg); border: 1px solid var(--hz-border); border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,.25);
  display: none; flex-direction: column; overflow: hidden;
}
.hz-window.hz-open { display: flex; animation: hz-pop .18s ease-out; }
@keyframes hz-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.hz-head {
  background: var(--hz-accent); color: var(--hz-accent-text);
  padding: 14px 16px; display: flex; align-items: center; gap: 10px;
}
.hz-head-text { flex: 1; min-width: 0; }
.hz-title { font-weight: 700; font-size: 16px; }
.hz-sub { font-size: 12.5px; opacity: .85; }
.hz-close {
  background: transparent; border: 0; color: inherit; cursor: pointer;
  font-size: 24px; line-height: 1; padding: 4px 8px; border-radius: 8px;
}
.hz-messages {
  flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px;
  overscroll-behavior: contain;
}
.hz-msg {
  max-width: 85%; padding: 9px 13px; border-radius: 14px;
  white-space: pre-wrap; overflow-wrap: anywhere;
}
.hz-bot { align-self: flex-start; background: var(--hz-bot); border-bottom-left-radius: 4px; }
.hz-user { align-self: flex-end; background: var(--hz-accent); color: var(--hz-accent-text); border-bottom-right-radius: 4px; }
.hz-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.hz-chip {
  font: inherit; font-size: 13.5px; cursor: pointer; padding: 7px 12px;
  background: var(--hz-bg); color: var(--hz-accent); border: 1px solid var(--hz-accent); border-radius: 999px;
}
.hz-chip:hover { background: var(--hz-bot); }
.hz-typing { display: inline-flex; gap: 4px; align-items: center; padding: 13px 14px; }
.hz-typing i {
  width: 7px; height: 7px; border-radius: 50%; background: #9ca3af; display: block;
  animation: hz-blink 1.2s infinite ease-in-out;
}
.hz-typing i:nth-child(2) { animation-delay: .2s; }
.hz-typing i:nth-child(3) { animation-delay: .4s; }
@keyframes hz-blink { 0%, 80%, 100% { opacity: .3; } 40% { opacity: 1; } }
.hz-form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--hz-border); background: var(--hz-bg); }
.hz-input {
  flex: 1; min-width: 0; font: inherit; font-size: 16px; /* 16px stops zoom on iPhones */
  padding: 10px 12px; border: 1px solid var(--hz-border); border-radius: 12px;
  background: var(--hz-bg); color: var(--hz-text);
}
.hz-input:focus { outline: 2px solid var(--hz-accent); outline-offset: 0; border-color: transparent; }
.hz-send {
  border: 0; cursor: pointer; padding: 0 16px; border-radius: 12px; font: inherit; font-weight: 600;
  background: var(--hz-accent); color: var(--hz-accent-text);
}
.hz-send:disabled { opacity: .5; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) {
  .hz-window.hz-open, .hz-typing i { animation: none; }
  .hz-launcher { transition: none; }
}
@media (max-width: 480px) {
  .hz-window { right: 8px; left: 8px; width: auto; max-width: none; bottom: 80px; }
}
`;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- BUILD THE PAGE ELEMENTS ---------- */
  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text) e.textContent = text;
    return e;
  }

  var root = el("div", "hz-chat");

  var launcher = el("button", "hz-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var win = el("div", "hz-window");
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", CONFIG.title);

  var head = el("div", "hz-head");
  var headText = el("div", "hz-head-text");
  headText.appendChild(el("div", "hz-title", CONFIG.title));
  headText.appendChild(el("div", "hz-sub", CONFIG.subtitle));
  var closeBtn = el("button", "hz-close", "\u00d7");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  head.appendChild(headText);
  head.appendChild(closeBtn);

  var list = el("div", "hz-messages");
  list.setAttribute("aria-live", "polite");

  var form = el("form", "hz-form");
  var input = el("input", "hz-input");
  input.type = "text";
  input.placeholder = "Type your question\u2026";
  input.maxLength = CONFIG.maxChars;
  input.setAttribute("aria-label", "Your message");
  input.autocomplete = "off";
  var sendBtn = el("button", "hz-send", "Send");
  sendBtn.type = "submit";
  form.appendChild(input);
  form.appendChild(sendBtn);

  win.appendChild(head);
  win.appendChild(list);
  win.appendChild(form);
  root.appendChild(launcher);
  root.appendChild(win);
  document.body.appendChild(root);

  /* ---------- CHAT LOGIC ---------- */
  var history = []; // what has been said so far (sent to the server each time)
  var busy = false;
  var chipsBox = null;

  function addMessage(role, text) {
    var m = el("div", "hz-msg hz-" + role);
    m.textContent = text; // textContent keeps it safe: no HTML can sneak in
    list.appendChild(m);
    list.scrollTop = list.scrollHeight;
    return m;
  }

  function addTyping() {
    var t = el("div", "hz-msg hz-bot hz-typing");
    t.setAttribute("aria-label", "Assistant is typing");
    t.appendChild(el("i"));
    t.appendChild(el("i"));
    t.appendChild(el("i"));
    list.appendChild(t);
    list.scrollTop = list.scrollHeight;
    return t;
  }

  function setBusy(state) {
    busy = state;
    sendBtn.disabled = state;
  }

  async function send(text) {
    text = (text || "").trim().slice(0, CONFIG.maxChars);
    if (!text || busy) return;
    setBusy(true);
    if (chipsBox) {
      chipsBox.remove();
      chipsBox = null;
    }
    addMessage("user", text);
    var typing = addTyping();
    try {
      var r = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.concat([{ role: "user", text: text }]).slice(-12)
        })
      });
      var data = await r.json().catch(function () {
        return {};
      });
      if (!r.ok || !data.reply) throw new Error(data.error || "Bad response (" + r.status + ")");
      typing.remove();
      addMessage("bot", data.reply);
      history.push({ role: "user", text: text });
      history.push({ role: "assistant", text: data.reply });
    } catch (err) {
      console.error("Chat error:", err);
      typing.remove();
      addMessage("bot", CONFIG.errorText);
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  // Opening message and quick-question buttons
  addMessage("bot", CONFIG.welcome);
  chipsBox = el("div", "hz-chips");
  CONFIG.suggestions.forEach(function (q) {
    var chip = el("button", "hz-chip", q);
    chip.type = "button";
    chip.addEventListener("click", function () {
      send(q);
    });
    chipsBox.appendChild(chip);
  });
  list.appendChild(chipsBox);

  /* ---------- OPEN / CLOSE ---------- */
  function setOpen(open) {
    win.classList.toggle("hz-open", open);
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
    launcher.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    if (open) input.focus();
  }
  launcher.addEventListener("click", function () {
    setOpen(!win.classList.contains("hz-open"));
  });
  closeBtn.addEventListener("click", function () {
    setOpen(false);
    launcher.focus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && win.classList.contains("hz-open")) {
      setOpen(false);
      launcher.focus();
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value;
    input.value = "";
    send(value);
  });
})();
