const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 3000;
const OPENAI_API_KEY = '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';
const ASSISTANT_ID = 'asst_nbnmuUxJrt0i6n7AztCy4FFZ';
const PUBLIC_ORIGIN = 'http://localhost:3000';

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: PUBLIC_ORIGIN.split(',').map(o => o.trim()),
  credentials: true
}));

app.post('/chat', async (req, res) => {
  const { threadId, message } = req.body;
  let tId = threadId;

  // Set SSE headers early
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Kickstart SSE so client starts listening
  res.write(`:\n\n`);

  try {
    // Create thread if needed
    if (!tId || tId === 'undefined' || typeof tId !== "string" || !tId.startsWith("thread_")) {
      console.log("🌀 No threadId provided, creating new thread...");
      const tRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
          'Content-Type': 'application/json'
        }
      });

      const tData = await tRes.json();
      console.log("📩 Thread creation response:", tData);

      if (!tRes.ok || !tData.id) throw new Error(`Thread creation failed: ${JSON.stringify(tData)}`);

      tId = tData.id;
    }

    console.log(`✅ Using threadId: ${tId}`);
    res.write(`data: ${JSON.stringify({ threadId: tId })}\n\n`);

    // Send user message
    console.log("📨 Sending message to thread...");
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${tId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    const msgData = await msgRes.json();
    console.log("📩 Message send response:", msgData);

    if (!msgRes.ok) throw new Error(`Message send failed: ${JSON.stringify(msgData)}`);

    // Start run stream
    console.log("📡 Starting run stream...");
    const runRes = await fetch(`https://api.openai.com/v1/threads/${tId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        stream: true
      })
    });

    if (!runRes.ok || !runRes.body) {
      const errText = await runRes.text();
      throw new Error(`Run stream failed: ${errText}`);
    }

    const reader = runRes.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    
      const chunk = decoder.decode(value, { stream: true });
    
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;

        console.log("Json Response:", line);
    
        const data = line.slice(6).trim();
        if (!data) continue;
    
        if (data === "[DONE]") {
          console.log("✅ Stream completed");
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          break;
        }
    
        try {
          const event = JSON.parse(data);
    
          // Only handle 'thread.message.delta' events with text content
          if (event.object === "thread.message.delta" && event.delta?.content) {
            for (const block of event.delta.content) {
              if (block.type === "text" && block.text?.value) {
                res.write(`data: ${JSON.stringify({ delta: block.text.value })}\n\n`);
              }
            }
          }
    
        } catch (err) {
          // ignore malformed JSON / pings
        }
      }
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }catch (err) {
    console.error("💥 Server error:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});



app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
