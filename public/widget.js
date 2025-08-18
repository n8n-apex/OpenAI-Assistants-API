(function () {
  // 1. Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://openai-assistants-api-production.up.railway.app/style.css';
  document.head.appendChild(link);

  // 2. Inject HTML
  const container = document.createElement('div');
  container.innerHTML = `
    <div id="chat-widget">
      <div id="chat-header">💬 Ask AI</div>
      <div id="chat-body"></div>
      <div id="chat-input-area">
        <input type="text" id="chat-input" placeholder="Type your question..."/>
        <button id="send-btn" aria-label="Send">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               width="22" height="22" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
    </div>
    <button id="chat-toggle">💬</button>
  `;
  document.body.appendChild(container);

  // 3. Toggle open/close
  document.getElementById("chat-toggle").addEventListener("click", () => {
    const widget = document.getElementById("chat-widget");
    widget.style.display = widget.style.display === "flex" ? "none" : "flex";

    // 👉 When opening for the first time, show suggestions
    if (widget.style.display === "flex" && !widget.dataset.initialized) {
      if (typeof renderSuggestions === "function") {
        renderSuggestions();
      }
      widget.dataset.initialized = "true"; // mark as initialized
    }
  });

  // 4. Inject app.js
  const script = document.createElement('script');
  script.src = 'https://openai-assistants-api-production.up.railway.app/app.js';
  script.defer = true;
  document.body.appendChild(script);
})();
