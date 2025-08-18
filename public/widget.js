// widget.js
(function () {
  var BASE = "https://openai-assistants-api-production.up.railway.app";

  // 1) Load CSS
  if (!document.querySelector('link[data-chat-css]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + '/style.css?v=' + Date.now();
    link.setAttribute('data-chat-css','1');
    document.head.appendChild(link);
  }

  // 2) Inline overrides to make sure it displays in-page
  if (!document.querySelector('style[data-chat-inline-overrides]')) {
    var ov = document.createElement('style');
    ov.setAttribute('data-chat-inline-overrides','1');
    ov.textContent = `
      #chat-widget {
        display:flex !important;
        position:relative !important;
        top:auto !important; left:auto !important; right:auto !important; bottom:auto !important;
        transform:none !important;
        width:100% !important; height:auto !important; max-width:100% !important; max-height:none !important;
        z-index:auto !important;
      }
      #chat-toggle { display:none !important; }
      #chat-body { max-height:60vh; }
    `;
    document.head.appendChild(ov);
  }

  // 3) Create mount point where the script is placed
  var mount = document.createElement('div');
  mount.id = 'ai-chat';
  var current = document.currentScript;
  current.parentNode.insertBefore(mount, current);

  // 4) Inject widget markup
  mount.innerHTML =
    '<div id="chat-widget">' +
    '  <div id="chat-header">💬 Ask AI</div>' +
    '  <div id="chat-body"></div>' +
    '  <div id="chat-input-area">' +
    '    <input type="text" id="chat-input"/>' +
    '    <button id="send-btn" aria-label="Send">' +
    '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
    '        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>' +
    '      </svg>' +
    '    </button>' +
    '  </div>' +
    '</div>';

  // 5) Load logic
  var logic = document.createElement('script');
  logic.src = BASE + '/app.js?v=' + Date.now();
  logic.async = true;
  logic.defer = true;
  document.body.appendChild(logic);
})();
