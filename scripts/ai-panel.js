require('dotenv').config();

const prompt = process.argv.slice(2).join(' ').trim();
const context = process.env.AI_PROJECT_CONTEXT || 'You are reviewing a software project. Prefer small, practical, production-ready changes.';

if (!prompt) {
  console.error('Usage: npm run ai:panel -- "Describe the feature or idea"');
  process.exit(1);
}

const agents = [
  {
    name: 'ChatGPT',
    enabled: Boolean(process.env.OPENAI_API_KEY),
    async ask() {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'system', content: context }, { role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
      return data.choices[0].message.content;
    },
  },
  {
    name: 'Claude',
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    async ask() {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
          max_tokens: 1800,
          system: context,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
      return data.content.map((part) => part.text || '').join('');
    },
  },
  {
    name: 'Gemini',
    enabled: Boolean(process.env.GEMINI_API_KEY),
    async ask() {
      const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: context }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
      return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    },
  },
];

async function run() {
  const activeAgents = agents.filter((agent) => agent.enabled);
  if (!activeAgents.length) {
    throw new Error('Add at least one provider key: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY.');
  }

  const results = await Promise.all(activeAgents.map(async (agent) => {
    try {
      return { name: agent.name, answer: await agent.ask() };
    } catch (error) {
      return { name: agent.name, error: error.message };
    }
  }));

  console.log('\n=== AI PANEL ===\n');
  results.forEach((result) => {
    console.log(`--- ${result.name} ---`);
    console.log(result.error ? `Error: ${result.error}` : result.answer);
    console.log('');
  });
  console.log('--- Next step ---');
  console.log('Compare the answers, then ask Copilot to implement the selected solution in the workspace.');
}

run().catch((error) => {
  console.error(`AI panel error: ${error.message}`);
  process.exit(1);
});
