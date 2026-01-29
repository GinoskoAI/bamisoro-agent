export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // --- DEBUGGING LOGS ---
    console.log("--- INCOMING REQUEST BODY ---");
    console.log(JSON.stringify(req.body, null, 2)); 

    // 2. Parse the arguments (Flexible Search)
    // We look for the language in multiple places just in case Ultravox changes format
    let target = req.body.target_language || req.body.language || req.body.lang || req.body.name;

    // Sometimes arguments are nested in 'parameters'
    if (!target && req.body.parameters) {
       target = req.body.parameters.target_language || req.body.parameters.language;
    }

    if (!target) {
      console.error("FAILED: Could not find language in body.");
      return res.status(400).json({ 
        error: 'Missing target_language parameter',
        received_body: req.body 
      });
    }

    const selectedLang = target.toLowerCase();
    console.log(`SUCCESS: Detected language -> ${selectedLang}`);

    // 3. Define YOUR Specific Voice IDs
    const voices = {
      yoruba: "b7ede3f9-1445-40c9-b32e-59780715495c", // Funmi
      igbo: "efba3554-a556-4841-9f82-7e86d8408256",    // Ngozi
      hausa: "5b41a7db-acd3-48a7-a7d3-f322bd94ebb7",  // Zainab
      pidgin: "6ce75717-fab9-477f-a06f-b05d846a5cba", // Ufoma
      french: "ab4eaa72-5cf3-40c1-a921-bca62a884bb4", // Alize
      english: "b7ede3f9-1445-40c9-b32e-59780715495c" // Funmi (Fallback)
    };

    // 4. THE MAGIC SAUCE: Continuity Instruction
    // This tells the AI: "Don't start fresh. Look at what we just said."
    const continuityInstruction = `
    IMPORTANT - CONTEXT HANDOFF:
    You have just switched languages in the middle of a live conversation.
    1. READ the transcript of what the user just said in the previous language.
    2. If they asked a question (e.g., "What is the price?"), ANSWER it immediately in the new language.
    3. Do NOT say "Hello" or introduce yourself again unless the user just said "Hello".
    4. Maintain the persona of Bamisoro (friendly, helpful, African context).
    `;

    // 5. Define The "Brains" (System Prompts + Continuity)
    const prompts = {
      yoruba: `You are Bamisoro. ${continuityInstruction} Reply ONLY in Yoruba. Translate their meaning or answer their questions, but NEVER speak English. Use formal Yoruba.`,
      
      igbo: `You are Bamisoro. ${continuityInstruction} Reply ONLY in Igbo (Igbo Izugbe). Do not speak English.`,
      
      pidgin: `You are Bamisoro. ${continuityInstruction} Reply ONLY in Nigerian Pidgin. Make your Pidgin authentic (Waffi/Lagos style). No speak English grammar.`,
      
      hausa: `You are Bamisoro. ${continuityInstruction} Reply ONLY in Hausa. Be polite and use standard Hausa greetings.`,
      
      french: `You are Bamisoro. ${continuityInstruction} Reply ONLY in French.`,
      
      english: `You are Bamisoro. ${continuityInstruction} Respond in clear, professional English.`
    };

    // 6. Select Configuration
    const selectedSystemPrompt = prompts[selectedLang] || prompts['english'];
    const selectedVoice = voices[selectedLang] || voices['english'];

    // 7. Construct the Response Body
    const responseBody = {
      systemPrompt: selectedSystemPrompt,
      voice: selectedVoice, 
      
      // CRITICAL CHANGE: 'initialMessages' is REMOVED.
      // This forces the Agent to generate the next response based on the conversation history.
      // It will see the continuityInstruction and know to answer your last question.

      toolResultText: `(System) Language switched to ${selectedLang}. Context preserved.`
    };

    // 8. Trigger the Stage Change
    res.setHeader('X-Ultravox-Response-Type', 'new-stage');
    
    return res.status(200).json(responseBody);

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
