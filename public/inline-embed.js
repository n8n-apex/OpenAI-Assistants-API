// inline-embed.js - Simple version for Railway deployment
(function() {
  if (window.__INLINE_CHAT_LOADED__) return;
  window.__INLINE_CHAT_LOADED__ = true;

  const script = document.currentScript || document.querySelector('script[src*="inline-embed.js"]');
  const API_URL = 'https://openai-assistants-api-production.up.railway.app/chat';
  const TARGET = script.getAttribute('data-target');
  const HEIGHT = script.getAttribute('data-height') || '500px';
  const TITLE = script.getAttribute('data-title') || '💬 Ask AI Assistant';

  // Find or create container
  let container;
  if (TARGET) {
    container = document.querySelector(TARGET);
    if (!container) {
      container = document.createElement('div');
      container.id = TARGET.replace('#', '');
      document.body.appendChild(container);
    }
  } else {
    container = document.createElement('div');
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  // CSS
  const css = `
    .inline-chat-widget {
      width: 100%;
      max-width: 800px;
      margin: 20px auto;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      background: white;
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .inline-chat-main {
      display: flex;
      flex-direction: column;
      height: ${HEIGHT};
    }
    .inline-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      text-align: center;
    }
    .inline-chat-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .inline-chat-body.empty {
      justify-content: center;
      align-items: center;
    }
    .inline-chat-message {
      padding: 12px 16px;
      border-radius: 16px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.5;
    }
    .inline-chat-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      align-self: flex-end;
    }
    .inline-chat-message.bot {
      background: white;
      color: #333;
      align-self: flex-start;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
    }
    .inline-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 500px;
    }
    .inline-chat-suggestion {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 14px 16px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .inline-chat-suggestion:hover {
      background: #f9fafb;
      border-color: #667eea;
      transform: translateY(-1px);
    }
    .inline-chat-input-area {
      display: flex;
      border-top: 1px solid #e5e7eb;
      padding: 16px 20px;
      gap: 12px;
    }
    .inline-chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
    }
    .inline-chat-send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .inline-chat-typing {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      font-size: 13px;
      align-self: flex-start;
    }
    .inline-chat-typing span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }
    .inline-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .inline-chat-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Create widget
  const widgetId = 'chat-' + Math.random().toString(36).substr(2, 9);
  container.innerHTML = `
    <div class="inline-chat-widget">
      <div class="inline-chat-main">
        <div class="inline-chat-header">${TITLE}</div>
        <div class="inline-chat-body empty" id="${widgetId}-body"></div>
        <div class="inline-chat-input-area">
          <input type="text" class="inline-chat-input" id="${widgetId}-input" placeholder="Type your question..." />
          <button class="inline-chat-send-btn" id="${widgetId}-send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Chat functionality
  let threadId = '';
  let hasSuggestions = true;
  const chatBody = document.getElementById(widgetId + '-body');
  const chatInput = document.getElementById(widgetId + '-input');
  const sendBtn = document.getElementById(widgetId + '-send');

  function addMessage(content, sender) {
    const msg = document.createElement('div');
    msg.className = 'inline-chat-message ' + sender;
    msg.textContent = content;
    chatBody.appendChild(msg);
    chatBody.classList.remove('empty');
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function showSuggestions() {
    if (!hasSuggestions) return;
    
    const suggestions = document.createElement('div');
    suggestions.className = 'inline-chat-suggestions';
    suggestions.innerHTML = `
      <div style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 12px;">
        Try asking these questions...
      </div>
      <div class="inline-chat-suggestion">Ich möchte meine bisherige Positionierung schärfen!</div>
      <div class="inline-chat-suggestion">Wie lautet deine bisherige Positionierung?</div>
      <div class="inline-chat-suggestion">Hilf mir bei meiner Content-Strategie.</div>
    `;
    
    suggestions.querySelectorAll('.inline-chat-suggestion').forEach(el => {
      el.onclick = () => {
        chatInput.value = el.textContent;
        sendMessage();
      };
    });
    
    chatBody.appendChild(suggestions);
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (hasSuggestions) {
      chatBody.innerHTML = '';
      hasSuggestions = false;
    }

    chatInput.disabled = true;
    sendBtn.disabled = true;

    addMessage(text, 'user');
    chatInput.value = '';

    const botMsg = addMessage('', 'bot');
    const typing = document.createElement('div');
    typing.className = 'inline-chat-typing';
    typing.innerHTML = 'Getting your answer <span></span><span></span><span></span>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message: text })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        chunk.split('\n').forEach(line => {
          if (line.startsWith('data: ')) {
            const json = line.slice(6).trim();
            if (!json) return;

            try {
              const parsed = JSON.parse(json);
              if (parsed.threadId && !threadId) {
                threadId = parsed.threadId;
              }
              if (parsed.delta) {
                if (typing.parentNode) typing.remove();
                botMsg.textContent += parsed.delta;
                chatBody.scrollTop = chatBody.scrollHeight;
              }
            } catch (e) {}
          }
        });
      }
    } catch (error) {
      botMsg.textContent = 'Sorry, there was an error. Please try again.';
    } finally {
      if (typing.parentNode) typing.remove();
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  sendBtn.onclick = sendMessage;
  chatInput.onkeypress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show initial suggestions
  setTimeout(showSuggestions, 100);
})();
