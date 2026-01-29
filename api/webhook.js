// api/webhook.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { target_language } = req.body; 

    // Voices (Ensure these IDs are correct for your provider)
    const voices = {
      yoruba: "cartesia-voice-id-yoruba", 
      igbo: "cartesia-voice-id-igbo",
      pidgin: "cartesia-voice-id-pidgin",
      hausa: "cartesia-voice-id-hausa",
      french: "cartesia-voice-id-french",
      english: "cartesia-voice-id-english"
    };

    // System Prompts
    // We add a small instruction: "Context Awareness"
    const commonInstruction = "You are continuing an existing conversation. Read the chat history. If the user asked a question just before switching, answer it in this new language.";

    const prompts = {
      yoruba: `You are Bamisoro. ${commonInstruction} Reply ONLY in Yoruba. Translate concepts if needed.`,
      igbo: `You are Bamisoro. ${commonInstruction} Reply ONLY in Igbo (Igbo Izugbe).`,
      pidgin: `You are Bamisoro. ${commonInstruction} Reply ONLY in Nigerian Pidgin (Waffi style).`,
      hausa: `You are Bamisoro. ${commonInstruction} Reply ONLY in Hausa.`,
      french: `You are Bamisoro. ${commonInstruction} Reply ONLY in French.`,
      english: `You are Bamisoro. ${commonInstruction} Reply in clear English.`
    };

    const selectedLang = target_language.toLowerCase();
    const selectedSystemPrompt = prompts[selectedLang] || prompts['english'];
    const selectedVoice = voices[selectedLang] || voices['english'];

    const responseBody = {
      systemPrompt: selectedSystemPrompt,
      voice: selectedVoice,
      // REMOVED: initialMessages [...] <--- We deleted this so the agent generates its own reply
      
      // This text is invisible to the user, but the Agent reads it to know the switch worked.
      toolResultText: `(System Update) Language mode successfully switched to ${selectedLang}. The user can hear you. Continue the conversation naturally in ${selectedLang}.`
    };

    res.setHeader('X-Ultravox-Response-Type', 'new-stage');
    return res.status(200).json(responseBody);

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
