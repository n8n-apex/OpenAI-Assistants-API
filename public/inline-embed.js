// inline-embed.js - Embeds chat widget directly in page content
(function() {
  // Prevent double loading
  if (window.__INLINE_CHAT_LOADED__) return;
  window.__INLINE_CHAT_LOADED__ = true;

  // Configuration from script attributes
  const script = document.currentScript || document.querySelector('script[src*="inline-embed.js"]');
  const API_URL = script.getAttribute('data-api-url') || 'https://openai-assistants-api-production.up.railway.app/chat';
  const TARGET = script.getAttribute('data-target') || null;
  const HEIGHT = script.getAttribute('data-height') || '500px';
  const TITLE = script.getAttribute('data-title') || '💬 Ask AI Assistant';

  // Find or create target container
  let container;
  if (TARGET) {
    container = document.querySelector(TARGET);
    if (!container) {
      container = document.createElement('div');
      container.id = TARGET.replace('#', '');
      document.body.appendChild(container);
    }
  } else {
    // Auto-insert after script tag
    container = document.createElement('div');
    container.id = 'auto-chat-embed-' + Math.random().toString(36).substr(2, 9);
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  // Inject CSS
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

    .inline-chat-widget * {
      box-sizing: border-box;
    }

    .inline-chat-main {
      display: flex;
      flex-direction: column;
      height: ${HEIGHT};
      background: white;
    }

    .inline-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }

    .inline-chat-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
      align-items: center;
    }

    .inline-chat-body.filled {
      justify-content: flex-start;
      align-items: stretch;
    }

    .inline-chat-message {
      padding: 12px 16px;
      border-radius: 16px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .inline-chat-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 6px;
    }

    .inline-chat-message.bot {
      background: white;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 6px;
      border: 1px solid #e5e7eb;
      white-space: pre-wrap;
    }

    .inline-chat-suggestions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      max-width: 500px;
    }

    .inline-chat-suggestions-title {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin-bottom: 8px;
    }

    .inline-chat-suggestion {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      color: #374151;
      text-align: center;
    }

    .inline-chat-suggestion:hover {
      background: #f9fafb;
      border-color: #667eea;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .inline-chat-input-area {
      display: flex;
      border-top: 1px solid #e5e7eb;
      background: white;
      padding: 16px 20px;
      align-items: center;
      gap: 12px;
    }

    .inline-chat-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease;
      font-family: inherit;
    }

    .inline-chat-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
      transition: all 0.2s ease;
    }

    .inline-chat-send-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .inline-chat-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .inline-chat-typing {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      background: white;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      border-bottom-left-radius: 6px;
      font-size: 13px;
      max-width: 80%;
      align-self: flex-start;
    }

    .inline-chat-typing span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      display: inline-block;
      animation: inline-chat-bounce 1.4s infinite;
    }

    .inline-chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .inline-chat-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes inline-chat-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
      .inline-chat-widget {
        margin: 10px;
        border-radius: 12px;
      }
      .inline-chat-main {
        height: 400px;
      }
    }
  `;

  // Inject CSS into page
  if (!document.querySelector('#inline-chat-styles')) {
    const style = document.createElement('style');
    style.id = 'inline-chat-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Create HTML structure
  container.innerHTML = `
    <div class="inline-chat-widget">
      <div class="inline-chat-main">
        <div class="inline-chat-header">${TITLE}</div>
        <div class="inline-chat-body" id="inline-chat-body-${container.id}"></div>
        <div class="inline-chat-input-area">
          <input type="text" class="inline-chat-input" id="inline-chat-input-${container.id}" placeholder="Type your question here..." />
          <button class="inline-chat-send-btn" id="inline-chat-send-btn-${container.id}" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Chat functionality
  let threadId = localStorage.getItem('chat-thread-id') || '';
  let suggestionsVisible = true;

  const chatBody = document.getElementById(`inline-chat-body-${container.id}`);
  const chatInput = document.getElementById(`inline-chat-input-${container.id}`);
  const sendBtn = document.getElementById(`inline-chat-send-btn-${container.id}`);

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function appendMessage(content, sender) {
    const msg = document.createElement('div');
    msg.classList.add('inline-chat-message', sender);
    msg.textContent = content;
    chatBody.appendChild(msg);

    chatBody.classList.add('filled');
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function renderSuggestions() {
    const block = document.createElement('div');
    block.classList.add('inline-chat-suggestions');
    block.id = `inline-chat-suggestions-${container.id}`;

    const title = document.createElement('div');
    title.classList.add('inline-chat-suggestions-title');
    title.textContent = 'Try asking these questions...';
    block.appendChild(title);

    const suggestions = [
      'Ich möchte meine bisherige Positionierung schärfen!',
      'Wie lautet deine bisherige Positionierung?',
      'Hilf mir bei meiner Content-Strategie.'
    ];

    suggestions.forEach(text => {
      const card = document.createElement('div');
      card.classList.add('inline-chat-suggestion');
      card.textContent = text;

      card.addEventListener('click', () => {
        chatInput.value = text;
        sendMessage();
      });

      block.appendChild(card);
    });

    chatBody.appendChild(block);
  }

  function removeSuggestions() {
    if (suggestionsVisible) {
      const block = document.getElementById(`inline-chat-suggestions-${container.id}`);
      if (block) block.remove();
      suggestionsVisible = false;
    }
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Disable input while processing
    chatInput.disabled = true;
    sendBtn.disabled = true;

    removeSuggestions();

    // Show user message
    appendMessage(text, 'user');
    chatInput.value = '';

    // Bot placeholder
    const botMsg = appendMessage('', 'bot');

    // Typing indicator
    const typing = document.createElement('div');
    typing.classList.add('inline-chat-typing');
    typing.innerHTML = `Getting your answer <span></span><span></span><span></span>`;
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: threadId || '', message: text })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        chunk.split("\n").forEach(line => {
          if (line.startsWith("data: ")) {
            const json = line.slice(6).trim();
            if (!json) return;

            try {
              const parsed = JSON.parse(json);

              if (parsed.threadId && !threadId) {
                threadId = parsed.threadId;
                localStorage.setItem('chat-thread-id', threadId);
              }

              if (parsed.delta) {
                if (typing && typing.parentNode) typing.remove();
                botMsg.textContent += parsed.delta;
                chatBody.scrollTop = chatBody.scrollHeight;
              }

              if (parsed.done) {
                if (typing && typing.parentNode) typing.remove();
              }

            } catch (err) {
              console.error('Stream parse error:', err);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      botMsg.textContent = 'Sorry, there was an error processing your message. Please try again.';
      if (typing && typing.parentNode) typing.remove();
    } finally {
      // Re-enable input
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // Initialize suggestions when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSuggestions);
  } else {
    setTimeout(renderSuggestions, 100); // Small delay to ensure DOM is ready
  }
})();
