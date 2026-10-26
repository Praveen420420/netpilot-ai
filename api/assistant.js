import { ai } from "hatchable";

export const access = "public";
export const methods = ["POST"];

export default async function (req, res) {
  const body = req.body || {};
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const task = typeof body.task === "string" ? body.task.slice(0, 100) : "Networking help";

  if (!question || question.length > 4000) {
    return res.status(400).json({ error: "Enter a question up to 4,000 characters." });
  }

  const system = `You are NetPilot AI, a careful networking assistant for small businesses and IT learners in India.
Give clear, practical, beginner-friendly answers. Ask for missing details when needed. For network designs, distinguish assumptions from verified facts and mention VLAN, IP addressing, DHCP, DNS, firewall rules, backup and growth where relevant. For troubleshooting, begin with safe diagnostic checks and explain what each result means. Never suggest unauthorised access, credential collection, disabling endpoint protection, or risky changes without approval. Never claim you have inspected a real network. Do not request passwords, secrets, or sensitive customer logs. State when a qualified network engineer should validate advice. Task selected by user: ${task}.`;

  try {
    const result = await ai.generateText({
      model: "gemini",
      purpose: "netpilot-network-assistant",
      system,
      prompt: question,
      maxTokens: 1800,
      signal: AbortSignal.timeout(60000)
    });
    if (result.finishReason === "length") {
      return res.status(502).json({ error: "The answer was truncated. Try a shorter question." });
    }
    return res.json({ answer: result.text, usage: result.usage || null });
  } catch (err) {
    console.error("NetPilot AI error", String(err).slice(0, 300));
    return res.status(502).json({ error: "AI is not available right now. Check the Hatchable AI provider setup and usage limits." });
  }
}
