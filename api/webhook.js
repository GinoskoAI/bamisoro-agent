export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { target_language } = req.body; 

    if (!target_language) {
      return res.status(400).json({ error: 'Missing target_language parameter' });
    }

    // The "Brains" for each language
    const prompts = {
      yoruba: `You are Bamisoro. The user will speak to you in English. You must IGNORE the user's language and reply ONLY in Yoruba. Translate their meaning or answer their questions, but NEVER speak English. Use formal Yoruba.`,

      igbo: `You are Bamisoro. The user will speak English. You must reply ONLY in Igbo (Igbo Izugbe). Do not speak English.`,

      pidgin: `You are Bamisoro. The user dey speak English, but you must reply ONLY in Nigerian Pidgin. Make your Pidgin authentic (Waffi/Lagos style). No speak English grammar.`,

      hausa: `You are Bamisoro. The user speaks English. You must reply ONLY in Hausa. Be polite and use standard Hausa greetings.`,

      french: `You are Bamisoro. The user speaks English. You must reply ONLY in French.`,

      english: `You are Bamisoro. Respond in clear, professional English.`
    };

    const selectedSystemPrompt = prompts[target_language.toLowerCase()] || prompts['english'];

    const responseBody = {
      systemPrompt: selectedSystemPrompt,
      toolResultText: `(System) Language switched to ${target_language}.`
    };

    // This header triggers the "Call Stage" change in Ultravox
    res.setHeader('X-Ultravox-Response-Type', 'new-stage');

    return res.status(200).json(responseBody);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
