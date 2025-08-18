(function() {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://yourdomain/style.css";
    document.head.appendChild(link);
  
    // Load widget container
    const container = document.createElement("div");
    container.id = "chat-widget-container";
    document.body.appendChild(container);
  
    // Inject HTML
    container.innerHTML = `
      <div id="chat-widget">
        <div id="chat-header">💬 Ask AI</div>
        <div id="chat-body"></div>
        <div id="chat-input-area">
          <input type="text" id="chat-input" placeholder="Type your question..."/>
          <button id="send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 24 24" 
                 width="22" height="22" 
                 fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
            </svg>
          </button>
        </div>
      </div>
      <button id="chat-toggle">💬</button>
    `;
  
    // Load logic
    const script = document.createElement("script");
    script.src = "https://yourdomain/app.js";
    document.body.appendChild(script);
  })();
  