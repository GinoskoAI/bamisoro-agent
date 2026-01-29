export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Parse the arguments
    const { target_language } = req.body; 

    if (!target_language) {
      return res.status(400).json({ error: 'Missing target_language parameter' });
    }

    const selectedLang = target_language.toLowerCase();
    console.log(`Switching language to: ${selectedLang}`);

    // --- CONFIGURATION SECTION ---

    // 3. Define YOUR Specific Voice IDs
    const voices = {
      yoruba: "b7ede3f9-1445-40c9-b32e-59780715495c", // Funmi
      igbo: "efba3554-a556-4841-9f82-7e86d8408256",   // Ngozi
      hausa: "5b41a7db-acd3-48a7-a7d3-f322bd94ebb7",  // Zainab
      pidgin: "6ce75717-fab9-477f-a06f-b05d846a5cba", // Ufoma
      french: "ab4eaa72-5cf3-40c1-a921-bca62a884bb4", // Alize
      
      // Fallback: Using Funmi for English (Standard Nigerian English)
      english: "b7ede3f9-1445-40c9-b32e-59780715495c" 
    };

    // 4. Define The "Brains" (System Prompts)
    const prompts = {
      yoruba: `You are Bamisoro. The user will speak to you in English. You must IGNORE the user's language and reply ONLY in Yoruba. Translate their meaning or answer their questions, but NEVER speak English. Use formal Yoruba.`,
      
      igbo: `You are Bamisoro. The user will speak English. You must reply ONLY in Igbo (Igbo Izugbe). Do not speak English.`,
      
      pidgin: `You are Bamisoro. The user dey speak English, but you must reply ONLY in Nigerian Pidgin. Make your Pidgin authentic (Waffi/Lagos style). No speak English grammar.`,
      
      hausa: `You are Bamisoro. The user speaks English. You must reply ONLY in Hausa. Be polite and use standard Hausa greetings.`,
      
      french: `You are Bamisoro. The user speaks English. You must reply ONLY in French.`,
      
      english: `You are Bamisoro. Respond in clear, professional English.`
    };

    // 5. Define The "Greetings" (Forces the Agent to speak immediately)
    const greetings = {
      yoruba: "E kaaro! Bawo ni? (Good morning! How are you?)",
      igbo: "Ndeewo! Kedu ka imere? (Hello! How are you?)",
      pidgin: "How far? Wetin dey sup? (How are you? What's up?)",
      hausa: "Sannu! Ina kwana? (Hello! Good morning?)",
      french: "Bonjour! Comment allez-vous?",
      english: "I am back to English. How can I help?"
    };

    // --- LOGIC SECTION ---

    // Select the config based on language, fallback to English if not found
    const selectedSystemPrompt = prompts[selectedLang] || prompts['english'];
    const selectedVoice = voices[selectedLang] || voices['english'];
    const selectedGreeting = greetings[selectedLang] || "Hello.";

    // Construct the Response Body for Ultravox
    const responseBody = {
      systemPrompt: selectedSystemPrompt,
      voice: selectedVoice, // <--- This applies your specific Voice ID
      initialMessages: [
        {
          role: "MESSAGE_ROLE_AGENT",
          text: selectedGreeting // <--- This makes the new voice speak immediately
        }
      ],
      toolResultText: `(System) Language switched to ${selectedLang}. Voice ID updated.`
    };

    // CRITICAL: Set the Header to trigger the Stage Change
    res.setHeader('X-Ultravox-Response-Type', 'new-stage');
    
    return res.status(200).json(responseBody);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
