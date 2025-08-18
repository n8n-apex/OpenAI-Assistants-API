// inline-embed.js - Styled to match your design
(function() {
  if (window.__INLINE_CHAT_LOADED__) return;
  window.__INLINE_CHAT_LOADED__ = true;

  const script = document.currentScript || document.querySelector('script[src*="inline-embed.js"]');
  const API_URL = script.getAttribute('data-api-url') || 'https://openai-assistants-api-production.up.railway.app/chat';
  const TARGET = script.getAttribute('data-target');
  const HEIGHT = script.getAttribute('data-height') || '600px';
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

  // CSS that matches your design
  const css = `
    .modern-chat-widget {
      width: 100%;
      max-width: 900px;
      margin: 20px auto;
      border-radius: 24px;
      overflow: hidden;
      background: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      position: relative;
    }

    .modern-chat-container {
      display: flex;
      flex-direction: column;
      height: ${HEIGHT};
      background: white;
    }

    .modern-chat-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px 24px;
      background: white;
      border-bottom: 1px solid #f1f3f4;
    }

    .modern-chat-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .modern-chat-title {
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      flex: 1;
    }

    .modern-chat-body {
      flex: 1;
      padding: 32px 24px 24px;
      overflow-y: auto;
      background: white;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .modern-chat-body.empty {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .modern-chat-welcome {
      color: #374151;
      font-size: 16px;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .modern-chat-message {
      padding: 16px 20px;
      border-radius: 20px;
      max-width: 85%;
      font-size: 15px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .modern-chat-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 8px;
      margin-left: auto;
    }

    .modern-chat-message.bot {
      background: #f8fafc;
      color: #374151;
      align-self: flex-start;
      border-bottom-left-radius: 8px;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
    }

    .modern-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 600px;
    }

    .modern-chat-suggestion {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 18px 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 15px;
      color: #374151;
      font-weight: 500;
      text-align: left;
      line-height: 1.4;
    }

    .modern-chat-suggestion:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .modern-chat-input-container {
      padding: 24px;
      background: white;
      border-top: 1px solid #f1f3f4;
    }

    .modern-chat-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 2px solid #e5e7eb;
      border-radius: 24px;
      padding: 4px 4px 4px 20px;
      transition: all 0.2s ease;
    }

    .modern-chat-input-wrapper:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      background: white;
    }

    .modern-chat-input {
      flex: 1;
      padding: 16px 16px 16px 0;
      border: none;
      background: transparent;
      font-size: 15px;
      outline: none;
      color: #374151;
      font-family: inherit;
      line-height: 1.4;
    }

    .modern-chat-input::placeholder {
      color: #9ca3af;
    }

    .modern-chat-send-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .modern-chat-send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    }

    .modern-chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .modern-chat-typing {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px 20px;
      background: #f8fafc;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      border-bottom-left-radius: 8px;
      font-size: 14px;
      align-self: flex-start;
      margin-bottom: 8px;
    }

    .modern-chat-typing span {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: modern-bounce 1.4s infinite;
    }

    .modern-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .modern-chat-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes modern-bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
      .modern-chat-widget {
        margin: 10px;
        border-radius: 20px;
        max-width: calc(100vw - 20px);
      }
      
      .modern-chat-container {
        height: 500px;
      }
      
      .modern-chat-body {
        padding: 20px 16px 16px;
      }
      
      .modern-chat-input-container {
        padding: 16px;
      }
      
      .modern-chat-suggestion {
        padding: 16px 20px;
        font-size: 14px;
      }
    }

    /* Scrollbar styling */
    .modern-chat-body::-webkit-scrollbar {
      width: 6px;
    }

    .modern-chat-body::-webkit-scrollbar-track {
      background: transparent;
    }

    .modern-chat-body::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }

    .modern-chat-body::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `;

  // Inject CSS
  if (!document.querySelector('#modern-chat-styles')) {
    const style = document.createElement('style');
    style.id = 'modern-chat-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Create widget
  const widgetId = 'chat-' + Math.random().toString(36).substr(2, 9);
  container.innerHTML = `
    <div class="modern-chat-widget">
      <div class="modern-chat-container">
        <div class="modern-chat-header">
          <div class="modern-chat-avatar">🤖</div>
          <div class="modern-chat-title">${TITLE}</div>
        </div>
        <div class="modern-chat-body empty" id="${widgetId}-body"></div>
        <div class="modern-chat-input-container">
          <div class="modern-chat-input-wrapper">
            <input 
              type="text" 
              class="modern-chat-input" 
              id="${widgetId}-input" 
              placeholder="Versuchen Sie, diese Fragen zu stellen..." 
            />
            <button class="modern-chat-send-btn" id="${widgetId}-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Chat functionality
  let threadId = localStorage.getItem('chat-thread-id') || '';
  let hasSuggestions = true;
  const chatBody = document.getElementById(widgetId + '-body');
  const chatInput = document.getElementById(widgetId + '-input');
  const sendBtn = document.getElementById(widgetId + '-send');

  function addMessage(content, sender) {
    const msg = document.createElement('div');
    msg.className = 'modern-chat-message ' + sender;
    msg.textContent = content;
    chatBody.appendChild(msg);
    chatBody.classList.remove('empty');
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function showSuggestions() {
    if (!hasSuggestions) return;
    
    const welcome = document.createElement('div');
    welcome.className = 'modern-chat-welcome';
    welcome.textContent = 'Versuchen Sie, diese Fragen zu stellen...';
    chatBody.appendChild(welcome);
    
    const suggestions = document.createElement('div');
    suggestions.className = 'modern-chat-suggestions';
    
    const suggestionTexts = [
      'Ich möchte meine bisherige Positionierung schärfen!',
      'Wie lautet deine bisherige Positionierung?',
      'Hilf mir bei meiner Content-Strategie.'
    ];
    
    suggestionTexts.forEach(text => {
      const suggestion = document.createElement('div');
      suggestion.className = 'modern-chat-suggestion';
      suggestion.textContent = text;
      suggestion.onclick = () => {
        chatInput.value = text;
        sendMessage();
      };
      suggestions.appendChild(suggestion);
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
    typing.className = 'modern-chat-typing';
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
                localStorage.setItem('chat-thread-id', threadId);
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
