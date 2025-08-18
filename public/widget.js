(function () {
  // 1. Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://openai-assistants-api-production.up.railway.app/style.css'; // hosted CSS
  document.head.appendChild(link);

  // 2. Inject HTML container
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
  `;
  document.body.appendChild(container);

  // 3. Inject JS
  const script = document.createElement('script');
  script.src = 'https://openai-assistants-api-production.up.railway.app/app.js'; // hosted JS
  script.defer = true;
  document.body.appendChild(script);
})();
