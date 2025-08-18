(function () {
  // guard against double load
  if (window.__OA_INLINE_BOOT__) return; window.__OA_INLINE_BOOT__ = true;

  // discover base from this script’s URL
  var s = document.currentScript || (function(){var x=document.getElementsByTagName('script');return x[x.length-1];})();
  var BASE = new URL(s.src).origin;

  // where to mount (default #ai-chat)
  var targetSel = s.getAttribute('data-target') || '#ai-chat';
  var placeholder = s.getAttribute('data-placeholder') || 'Type your question...';

  // ensure CSS is loaded
  if (!document.querySelector('link[data-chat-css]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + '/style.css';
    link.setAttribute('data-chat-css','1');
    document.head.appendChild(link);
  }

  // inline overrides to cancel "modal" behavior
  var ov = document.createElement('style');
  ov.setAttribute('data-chat-inline-overrides','1');
  ov.textContent = `
    /* force inline rendering */
    #chat-widget {
      display: flex !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      width: 100% !important;
      height: auto !important;
      max-width: 100% !important;
      max-height: none !important;
      z-index: auto !important;
    }
    /* hide the floating button but keep it in DOM for app.js */
    #chat-toggle { display: none !important; }
    /* keep body comfortably scrollable inside cards/sections */
    #chat-body { max-height: 60vh; }
  `;
  document.head.appendChild(ov);

  // find/create mount
  var mount = document.querySelector(targetSel);
  if (!mount) {
    mount = document.createElement('div');
    mount.id = targetSel.startsWith('#') ? targetSel.slice(1) : 'ai-chat';
    document.body.appendChild(mount);
  }

  // inject SAME markup as your index.html (plus a hidden #chat-toggle)
  mount.innerHTML = ''
    + '<div id="chat-widget">'
    + '  <div id="chat-header">💬 Ask AI</div>'
    + '  <div id="chat-body"></div>'
    + '  <div id="chat-input-area">'
    + '    <input type="text" id="chat-input" placeholder="'+ placeholder +'"/>'
    + '    <button id="send-btn" aria-label="Send">'
    + '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">'
    + '        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>'
    + '      </svg>'
    + '    </button>'
    + '  </div>'
    + '</div>'
    + '<button id="chat-toggle" aria-hidden="true" style="display:none"></button>';

  // load your existing logic (unchanged UI/UX)
  var logic = document.createElement('script');
  logic.src = BASE + '/app.js';
  logic.async = true; logic.defer = true;
  document.body.appendChild(logic);
})();
