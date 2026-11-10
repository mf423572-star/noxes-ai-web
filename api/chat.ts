import { GoogleGenAI } from '@google/genai';
export default async function handler(req:any, res:any) {
  const m = req['me'+'thod'];
  if (m !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { messages, stream = true } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'Pesan kosong' });
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const SYS = `Kamu adalah NOXES AI V4, teman nongkrong, bukan AI kaku. Ngomong santai bahasa Indonesia gaul, jawab 2-4 baris, mengalir, pake emoji yang pas sama user. Jangan pernah bilang "Sebagai AI".`;
  const contents = messages.map((x:any)=>({ role: x.role === 'user' ? 'user' : 'model', parts: [{ text: x.content || 'Halo bree!' }] }));
  const models = ['gemini-flash-latest','gemini-flash-lite-latest','gemini-3.1-flash-lite','gemini-3.8-flash'];
  if (stream) {
    res.setHeader('Content-Type','text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control','no-cache, no-transform');
    res.setHeader('Connection','keep-alive');
    let done = false;
    for (const model of models) {
      try {
        const s = await ai.models.generateContentStream({ model, contents, config: { systemInstruction: SYS, temperature: 0.85 } });
        for await (const c of s) { if (c.text) res.write(`data: ${JSON.stringify({ chunk: c.text })}\n\n`); }
        done = true; break;
      } catch(e:any){ continue; }
    }
    if (!done) res.write(`data: ${JSON.stringify({ error: 'Gagal, coba lagi bree' })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }
  for (const model of models) {
    try {
      const r = await ai.models.generateContent({ model, contents, config: { systemInstruction: SYS, temperature: 0.85 } });
      if (r.text) return res.json({ reply: r.text });
    } catch(e:any){ continue; }
  }
  return res.status(500).json({ error: 'Gagal, coba lagi bree' });
}
