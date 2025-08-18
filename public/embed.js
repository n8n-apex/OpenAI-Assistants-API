(function () {
  // ====== CONFIG FROM <script> ATTRIBUTES ======
  // Example usage (one line):
  // <script src="https://openai-assistants-api-production.up.railway.app/embed.js"
  //   data-target="#chat-widget-inline"
  //   data-assistant-id="asst_XXXX"
  //   data-width="100%"
  //   data-height="520px"
  //   data-reset-on-refresh="1"
  // ></script>

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var BASE = "https://openai-assistants-api-production.up.railway.app";

  // Attributes
  var ATTR = {
    target: currentScript.getAttribute("data-target") || "#chat-widget-inline",
    assistantId: currentScript.getAttribute("data-assistant-id") || "",
    width: currentScript.getAttribute("data-width") || "100%",
    height: currentScript.getAttribute("data-height") || "560px",
    resetOnRefresh: (currentScript.getAttribute("data-reset-on-refresh") || "1") === "1",
    // pass-through options for your app.js (optional)
    lang: currentScript.getAttribute("data-lang") || "",
    placeholder: currentScript.getAttribute("data-placeholder") || "",
    starter: currentScript.getAttribute("data-starter") || ""
  };

  // Prevent double-bootstrap
  if (window.__OA_WIDGET_BOOTSTRAPPED__) return;
  window.__OA_WIDGET_BOOTSTRAPPED__ = true;

  // ====== UTILITIES ======
  function uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = (c === "x") ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function deviceId() {
    var ua = navigator.userAgent || "";
    var pf = navigator.platform || "";
    try { return btoa(ua + pf); } catch (_) { return (ua + pf); }
  }

  function cookieGet(name) {
    var value = null;
    if (document.cookie && document.cookie !== "") {
      var parts = document.cookie.split(";");
      for (var i = 0; i < parts.length; i++) {
        var c = parts[i].trim();
        if (c.substring(0, name.length + 1) === name + "=") {
          value = decodeURIComponent(c.substring(name.length + 1));
          break;
        }
      }
    }
    return value;
  }

  function cookieSet(name, val, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + encodeURIComponent(val)
      + "; expires=" + d.toUTCString()
      + "; path=/; Samesite=Lax; Secure;";
  }

  function ensureSession(projectKey) {
    var key = "oa_sess_" + (projectKey || "default");
    var existing = cookieGet(key);
    if (existing) {
      // refresh TTL to 7 days on each load
      cookieSet(key, existing, 7);
      return existing;
    }
    var sid = uuid4();
    cookieSet(key, sid, 7);
    return sid;
  }

  function resetSession(projectKey) {
    var key = "oa_sess_" + (projectKey || "default");
    // expire immediately
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    return ensureSession(projectKey);
  }

  function qs(sel) { return document.querySelector(sel); }

  // ====== LOAD CSS ======
  (function loadCssOnce() {
    if (document.querySelector('link[data-oa-widget-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = BASE + "/style.css";
    link.setAttribute("data-oa-widget-css", "1");
    document.head.appendChild(link);
  })();

  // ====== PREPARE TARGET CONTAINER ======
  var target = qs(ATTR.target);
  if (!target) {
    // if target missing, create one at the end of <body>
    target = document.createElement("div");
    target.id = (ATTR.target.startsWith('#') ? ATTR.target.slice(1) : "chat-widget-inline");
    document.body.appendChild(target);
  }

  // ====== RENDER INLINE WIDGET SHELL ======
  function renderShell() {
    target.innerHTML = [
      '<div id="oa-chat-widget" style="width:' + ATTR.width + ';height:' + ATTR.height + ';display:flex;flex-direction:column;">',
      '  <div id="oa-chat-header" style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem;">',
      '    <span id="oa-chat-title">Ask AI</span>',
      '    <div style="display:flex;gap:.5rem;align-items:center">',
      '      <button id="oa-refresh" title="Reload" aria-label="Reload" style="background:none;border:0;cursor:pointer;">',
      '        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">',
      '          <path d="M12 6V3L7 8l5 5V10a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/>',
      '        </svg>',
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div id="oa-chat-body" style="flex:1;min-height:0;"></div>',
      '  <div id="oa-chat-input-area">',
      '    <input type="text" id="oa-chat-input" placeholder="Type your question..." />',
      '    <button id="oa-send-btn" aria-label="Send">',
      '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">',
      '        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>',
      '      </svg>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join("");
  }

  renderShell();

  // ====== GLOBAL CONFIG FOR app.js ======
  // Your app.js can read this to initialize the chat client.
  // Example usage inside app.js:
  //   const cfg = window.__OA_WIDGET_CONFIG__;
  //   // cfg.sessionId, cfg.assistantId, cfg.deviceId, etc.
  window.__OA_WIDGET_CONFIG__ = {
    base: BASE,
    assistantId: ATTR.assistantId || "",
    deviceId: deviceId(),
    sessionId: ensureSession(ATTR.assistantId || "default"),
    targetSelectors: {
      body: "#oa-chat-body",
      input: "#oa-chat-input",
      sendBtn: "#oa-send-btn"
    },
    lang: ATTR.lang || "",
    placeholder: ATTR.placeholder || "",
    starter: ATTR.starter || ""
  };

  // ====== LOAD MAIN LOGIC (app.js) WITH CACHE-BUSTING ======
  function loadLogic(cacheBust) {
    // Remove previous if reloading
    var prev = document.querySelector('script[data-oa-widget-js]');
    if (prev) prev.remove();

    var s = document.createElement("script");
    s.src = BASE + "/app.js" + (cacheBust ? ("?v=" + Date.now()) : "");
    s.async = true;
    s.defer = true;
    s.setAttribute("data-oa-widget-js", "1");
    s.onerror = function () { console.error("Failed to load app.js from", s.src); };
    document.body.appendChild(s);
  }

  // ====== REFRESH HANDLER (OPTIONAL SESSION RESET) ======
  function wireRefresh() {
    var btn = document.getElementById("oa-refresh");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (ATTR.resetOnRefresh) {
        window.__OA_WIDGET_CONFIG__.sessionId = resetSession(ATTR.assistantId || "default");
      }
      // Clear UI body and reload logic
      var bodyEl = document.querySelector("#oa-chat-body");
      if (bodyEl) bodyEl.innerHTML = "";
      loadLogic(true);
    });
  }

  // Boot
  loadLogic(true);
  wireRefresh();
})();
