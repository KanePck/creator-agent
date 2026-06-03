const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/generate", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("API Key found:", apiKey ? "YES" : "NO");
  console.log("Request body:", JSON.stringify(req.body).substring(0, 100));
  
  if (!apiKey) return res.status(500).json({ error: "No API key" });
  
  try {
    const { messages } = req.body;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
       // model: "claude-sonnet-4-20250514",
        max_tokens: 10000,
        messages: messages,
      }),
    });
    const data = await r.json();
    console.log("Anthropic status:", r.status);
    if (!r.ok) return res.status(r.status).json({ error: "API error", detail: data });
    return res.status(200).json(data);
  } catch (e) {
    console.log("Catch error:", e.message);
    return res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log("Server ready at http://localhost:3000"));