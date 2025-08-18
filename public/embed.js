(function () {
  // ----- discover base from the script's URL -----
  var script = document.currentScript || (function(){var a=document.getElementsByTagName('script');return a[a.length-1];})();
  var BASE = new URL(script.src).origin; // -> https://openai-assistants-api-production.up.railway.app
  var TARGET = script.getAttribute('data-target') || '#ai-chat'; // where to mount inline
  var PLACEHOLDER = script.getAttribute('data-placeholder') || 'Type your question...';

  // ----- load CSS once -----
  if (!document.querySelector('link[data-chat-css]')) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE + '/style.css';
    link.setAttribute('data-chat-css', '1');
    document.head.appendChild(link);
  }

  // ----- find or create mount -----
  var mount = document.querySelector(TARGET);
  if (!mount) {
    mount = document.createElement('div');
    mount.id = TARGET.startsWith('#') ? TARGET.slice(1) : 'chat-widget-inline';
    document.body.appendChild(mount);
  }

  // ----- inject the SAME markup as your index.html (without the floating toggle) -----
  mount.innerHTML = '' +
    '<div id="chat-widget" style="display:flex">' +             // force visible (your CSS defaults to display:none)
    '  <div id="chat-header">💬 Ask AI</div>' +
    '  <div id="chat-body"></div>' +
    '  <div id="chat-input-area">' +
    '    <input type="text" id="chat-input" placeholder="'+ PLACEHOLDER +'"/>' +
    '    <button id="send-btn" aria-label="Send">' +
    '      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
    '        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>' +
    '      </svg>' +
    '    </button>' +
    '  </div>' +
    '</div>';

  // ----- app.js logic (kept the same, with API_URL pointing to Railway) -----
  const API_URL = BASE + '/chat';
  let threadId = localStorage.getItem('threadId') || '';
  let suggestionsVisible = true;

  function appendMessage(content, sender) {
    const chatBody = document.getElementById('chat-body');
    const msg = document.createElement('div');
    msg.classList.add('message', sender);
    msg.textContent = content;
    chatBody.appendChild(msg);
    chatBody.classList.add('filled');         // switch layout when first message arrives
    chatBody.scrollTop = chatBody.scrollHeight;
    return msg;
  }

  function renderSuggestions() {
    const chatBody = document.getElementById('chat-body');
    const block = document.createElement('div');
    block.id = 'suggestion-block';

    const title = document.createElement('div');
    title.style.fontSize = '13px';
    title.style.color = '#555';
    title.style.marginBottom = '8px';
    title.textContent = 'Try asking these questions...';
    block.appendChild(title);

    const suggestions = [
      'Ich möchte meine bisherige Positionierung schärfen!',
      'Wie lautet deine bisherige Positionierung?',
      'Hilf mir bei meiner Content-Strategie.'
    ];

    suggestions.forEach(text => {
      const card = document.createElement('div');
      card.classList.add('suggestion');
      card.textContent = text;
      card.addEventListener('click', () => {
        document.getElementById('chat-input').value = text;
        sendMessage(); // auto-send
      });
      block.appendChild(card);
    });

    chatBody.appendChild(block);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeSuggestions() {
    if (suggestionsVisible) {
      const block = document.getElementById('suggestion-block');
      if (block) block.remove();
      suggestionsVisible = false;
    }
  }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    removeSuggestions();

    appendMessage(text, 'user');
    input.value = '';

    const botMsg = appendMessage('', 'bot');

    const typing = document.createElement('div');
    typing.classList.add('typing-indicator');
    typing.innerHTML = 'Getting your answer <span></span><span></span><span></span>';
    document.getElementById('chat-body').appendChild(typing);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: threadId || '', message: text })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        chunk.split('\n').forEach(line => {
          if (!line.startsWith('data: ')) return;
          const json = line.slice(6).trim();
          if (!json) return;

          try {
            const parsed = JSON.parse(json);

            if (parsed.threadId && !threadId) {
              threadId = parsed.threadId;
              localStorage.setItem('threadId', threadId);
            }

            if (parsed.delta) {
              if (typing) typing.remove();
              botMsg.textContent += parsed.delta;
              const body = document.getElementById('chat-body');
              body.scrollTop = body.scrollHeight;
            }

            if (parsed.done && typing) typing.remove();
          } catch (e) {
            console.error('Stream parse error', e);
          }
        });
      }
    } catch (err) {
      if (typing) typing.remove();
      appendMessage('Sorry, there was a network error.', 'bot');
      console.error(err);
    }
  }

  // wire events
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // show suggestions on load
  renderSuggestions();
})();
