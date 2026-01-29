export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- DEBUGGING LOGS ---
    console.log("--- INCOMING REQUEST BODY ---");
    console.log(JSON.stringify(req.body, null, 2)); 
    // This will show up in your Vercel Logs so we can see EXACTLY what is sent.
    
    // 1. Try to find the language variable (Flexible Search)
    // We check common names: 'target_language', 'language', 'lang', 'name'
    let target = req.body.target_language || req.body.language || req.body.lang || req.body.name;

    // If still missing, check if it's inside a 'parameters' object (sometimes happens)
    if (!target && req.body.parameters) {
       target = req.body.parameters.target_language || req.body.parameters.language;
    }

    if (!target) {
      console.error("FAILED: Could not find language in body.");
      return res.status(400).json({ 
        error: 'Missing target_language parameter',
        received_body: req.body // Sends back what we got to help debug
      });
    }

    const selectedLang = target.toLowerCase();
    console.log(`SUCCESS: Detected language -> ${selectedLang}`);

    // --- CONFIGURATION ---
    const voices = {
      yoruba: "b7ede3f9-1445-40c9-b32e-59780715495c", // Funmi
      igbo: "efba3554-a556-4841-9f82-7e86d8408256",   // Ngozi
      hausa: "5b41a7db-acd3-48a7-a7d3-f322bd94ebb7",  // Zainab
      pidgin: "6ce75717-fab9-477f-a06f-b05d846a5cba", // Ufoma
      french: "ab4eaa72-5cf3-40c1-a921-bca62a884bb4", // Alize
      english: "b7ede3f9-1445-40c9-b32e-59780715495c" 
    };

    const prompts = {
      yoruba: `You are Bamisoro. The user will speak to you in English. You must IGNORE the user's language and reply ONLY in Yoruba. Translate their meaning or answer their questions, but NEVER speak English. Use formal Yoruba.`,
      igbo: `You are Bamisoro. The user will speak English. You must reply ONLY in Igbo (Igbo Izugbe). Do not speak English.`,
      pidgin: `You are Bamisoro. The user dey speak English, but you must reply ONLY in Nigerian Pidgin. Make your Pidgin authentic (Waffi/Lagos style). No speak English grammar.`,
      hausa: `You are Bamisoro. The user speaks English. You must reply ONLY in Hausa. Be polite and use standard Hausa greetings.`,
      french: `You are Bamisoro. The user speaks English. You must reply ONLY in French.`,
      english: `You are Bamisoro. Respond in clear, professional English.`
    };

    const greetings = {
      yoruba: "E kaaro! Bawo ni? (Good morning! How are you?)",
      igbo: "Ndeewo! Kedu ka imere? (Hello! How are you?)",
      pidgin: "How far? Wetin dey sup? (How are you? What's up?)",
      hausa: "Sannu! Ina kwana? (Hello! Good morning?)",
      french: "Bonjour! Comment allez-vous?",
      english: "I am back to English. How can I help?"
    };

    const selectedSystemPrompt = prompts[selectedLang] || prompts['english'];
    const selectedVoice = voices[selectedLang] || voices['english'];
    const selectedGreeting = greetings[selectedLang] || "Hello.";

    const responseBody = {
      systemPrompt: selectedSystemPrompt,
      voice: selectedVoice, 
      initialMessages: [{ role: "MESSAGE_ROLE_AGENT", text: selectedGreeting }],
      toolResultText: `(System) Language switched to ${selectedLang}.`
    };

    res.setHeader('X-Ultravox-Response-Type', 'new-stage');
    return res.status(200).json(responseBody);

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
