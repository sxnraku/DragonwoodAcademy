import { Stats, NPC, Player, ChatMessage, Interaction, TrainingType, Language } from '../types';
import { PREDEFINED_DRAGON_DESCRIPTIONS, PREDEFINED_ACTION_OUTCOMES } from '../data/predefinedContent';

// --- Proxy & Gemini API Configuration ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
// NAO usar a porta 3000: e a mesma do dev server do Vite (ver vite.config.ts).
// Com localhost:3000 este pedido bate no proprio Vite e devolve sempre 404,
// o que tornava o nivel 2 inalcancavel. 11434 e a porta nativa do Ollama.
const PROXY_API_URL = import.meta.env.VITE_AI_PROXY_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "llama3";

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const parseJsonResponse = <T>(text: string): T | null => {
    let jsonStringToParse = text;
    const fenceRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(fenceRegex);

    if (match && match[1]) {
        jsonStringToParse = match[1];
    } else {
        const firstBrace = text.indexOf('{');
        const firstBracket = text.indexOf('[');
        let startIndex = -1;

        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIndex = firstBrace;
            const lastBrace = text.lastIndexOf('}');
            if (lastBrace > startIndex) {
                jsonStringToParse = text.substring(startIndex, lastBrace + 1);
            }
        } else if (firstBracket !== -1) {
            startIndex = firstBracket;
            const lastBracket = text.lastIndexOf(']');
            if (lastBracket > startIndex) {
                jsonStringToParse = text.substring(startIndex, lastBracket + 1);
            }
        }
    }

    try {
        return JSON.parse(jsonStringToParse.trim());
    } catch (e) {
        console.error("Failed to parse JSON response:", e, `Raw text: "${text}"`, `Attempted to parse: "${jsonStringToParse}"`);
        return null;
    }
};

const callGemini = async (prompt: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Aliases "-latest" primeiro: acompanham a versao atual e nao ficam obsoletos.
    // Os modelos 2.5/2.0/1.5 antigos devolvem 404 "no longer available to new users".
    const models = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
    let lastError: any = null;

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
                signal: controller.signal,
            });

            if (response.ok) {
                clearTimeout(timeoutId);
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }
        } catch (err) {
            lastError = err;
        }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error("All Gemini models failed");
};

const callOllama = async (prompt: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 1500); // 1.5-second fast timeout for offline fallback

    try {
        const response = await fetch(PROXY_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // stream:false -> resposta num unico JSON. Sem isto o Ollama devolve
            // NDJSON em streaming e o response.json() rebenta.
            body: JSON.stringify({ model: OLLAMA_MODEL, prompt: prompt, stream: false }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Request to proxy server failed with status ${response.status}.`);
        }

        const data = await response.json();
        if (data && data.response) {
            return data.response;
        } else {
            throw new Error("Invalid response format from proxy server.");
        }
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

const callAI = async (prompt: string): Promise<string> => {
    try {
        return await callGemini(prompt);
    } catch (e) {
        return await callOllama(prompt);
    }
};

const getLanguageName = (langCode: Language): string => {
    switch (langCode) {
        case 'en': return 'English';
        case 'pt-PT': return 'European Portuguese';
        case 'pt-BR': return 'Brazilian Portuguese';
        default: return 'English';
    }
}

export const getScryingVision = async (targetName: string, targetDescription: string, language: Language): Promise<string> => {
    const langName = getLanguageName(language);
    const prompt = `
You are a mystical oracle providing a vision from a scrying pool.
A player is scrying to see a vision of a character. The response must be in ${langName}.

### CONTEXT
- **Target Character:** ${targetName}
- **Character's Essence:** "${targetDescription}"

### TASK
Generate a short, cryptic, one-sentence vision in ${langName} about them. The vision should be mystical and symbolic, like a fleeting thought or image.

### CRITICAL RULES
1.  **MYSTICAL TONE:** The vision must sound mysterious and magical.
2.  **IMPERSONAL:** Do NOT start with "${targetName} pensa..." or any direct attribution. Give only the vision's content.
3.  **PLAIN TEXT ONLY:** Your response MUST BE ONLY the sentence of the vision. No other text, formatting, or explanations.

GENERATE THE MYSTICAL VISION NOW IN ${langName}.
    `;
    try {
        const responseText = await callAI(prompt);
        return responseText.trim();
    } catch (error) {
        console.error('Error fetching for scrying pool:', error);
        return language === 'en' ? "(The water's surface remains murky... the vision fails.)" : "(A superfície da água permanece turva... a visão falha.)";
    }
};

export const generateInitialDragon = async (name: string, element: string, language: Language): Promise<{ stats: Stats; description:string }> => {
    const langName = getLanguageName(language);
    const prompt = `
      You are a game master for a fantasy RPG. Your task is to generate a new dragon for a player.

      ### TASK
      Generate an initial dragon with the name "${name}" and element "${element}".

      ### RULES & FORMATTING
      1.  **JSON ONLY:** Your ENTIRE response MUST be a single, valid JSON object.
      2.  **NO MARKDOWN OR EXTRA TEXT:** Do not wrap the JSON in markdown fences (like \`\`\`json) or add any text before or after the JSON.
      3.  **STATS:** 'hp' must be between 25-40. 'attack', 'defense', and 'speed' must be between 5-10. 'mana' must be between 20-30.
      4.  **DESCRIPTION:** The 'description' must be a creative, 1-2 sentence description in ${langName}. It should show its personality and appearance.
      5.  **NO NEWLINES IN STRINGS:** The 'description' string MUST NOT contain any newline characters (like \\n).

      ### RESPONSE STRUCTURE
      {
        "stats": { "hp": <integer>, "attack": <integer>, "defense": <integer>, "speed": <integer>, "mana": <integer> },
        "description": "<string in ${langName}>"
      }

      ### FINAL INSTRUCTION
      Generate the JSON object for the dragon named "${name}".
    `;
    try {
        const responseText = await callAI(prompt);
        const data = parseJsonResponse<{ stats: Stats; description: string }>(responseText);
        if (!data || !data.stats || !data.description) {
             console.warn("Proxy returned invalid data for dragon creation, using fallback.");
             throw new Error("Invalid or empty response from proxy.");
        }
        return data;
    } catch (error) {
        console.warn("Failed to generate a dragon via proxy. Using fallback.", error);
        const fallbackDescPt = getRandomItem(PREDEFINED_DRAGON_DESCRIPTIONS);
        const fallbackDescEn = "A young dragon with a curious gleam in its eyes, promising great intelligence and loyalty.";
        const hp = 30 + Math.floor(Math.random() * 10);
        const attack = 7 + Math.floor(Math.random() * 4);
        const defense = 7 + Math.floor(Math.random() * 4);
        const speed = 7 + Math.floor(Math.random() * 4);
        const mana = 25 + Math.floor(Math.random() * 6);
        return {
            stats: { hp, attack, defense, speed, mana },
            description: language === 'en' ? fallbackDescEn : fallbackDescPt,
        };
    }
};

export const getDynamicNpcResponse = async (
    npc: NPC,
    playerName: string,
    conversationHistory: ChatMessage[],
    playerMessage: string,
    currentAffinity: number,
    language: Language
): Promise<{ responseText: string; affinityChange: number; triggerDuel: boolean } | null> => {
    const langName = getLanguageName(language);
    const historySummary = conversationHistory
        .slice(-6)
        .map(msg => `${msg.sender === 'player' ? playerName : t(npc.nameKey)}: ${msg.text}`)
        .join('\n');

    const prompt = `
You are a master AI that strictly generates game data. Your task is to generate a response for an NPC in a fantasy RPG. Your response MUST be in ${langName}.

### SCENARIO
- **YOUR ROLE (NPC):** You are playing as **${t(npc.nameKey)}**. Your personality is: "${t(npc.descriptionKey)}".
- **THE PLAYER:** You are talking to **${playerName}**. Your current affinity with them is ${currentAffinity} (from -100 to 100).

### PROVOKING & DUEL RULES
1. **DETECT PROVOCATION:** If the player insults, taunts, boasts, or calls the NPC weak (e.g. "fraco", "ganho fácil", "lixo", "cobarde", "desafio"), react with anger, indignation or pride.
2. **AFFINITY DROP:** Decrement affinity (-4 to -10) when provoked.
3. **TRIGGER DUEL:** If the player provokes or insults the NPC, or if affinity drops below -10, set <trigger_duel> to "true". The NPC's dialogue MUST end with an angry challenge to fight/duel right now!

### RECENT CONVERSATION
${historySummary}
${playerName}: "${playerMessage}"

### TASK
Generate the NPC's response based on the player's most recent message and the conversation history.

### CRITICAL RULES
1.  **FORMAT:** Your response MUST use the format: <dialogue>|||<affinity_change>|||<trigger_duel>
2.  **LANGUAGE**: Your dialogue MUST be in ${langName}.
3.  **NO PREFIX:** Do NOT start your response with "${t(npc.nameKey)}:". Just give the dialogue directly.
4.  **AFFINITY:** The <affinity_change> must be a single number from -10 to 10.
5.  **TRIGGER_DUEL:** Must be either "true" or "false".

### EXAMPLE
Já chega de insultos! Vamos ver se és tão forte com os teus atos como com a tua boca! Desafio-te para um duelo agora mesmo!|||-7|||true

### FINAL INSTRUCTION
GENERATE THE RESPONSE NOW. STRICTLY FOLLOW THE FORMAT.
    `;

    try {
        const responseText = await callAI(prompt);
        const parts = responseText.split('|||');
        if (parts.length < 2) throw new Error("Invalid response format from model.");

        const dialogue = parts[0].trim();
        const affinityChange = parseInt(parts[1].trim(), 10);
        if (isNaN(affinityChange)) throw new Error("Affinity change is not a number.");
        const triggerDuel = parts.length >= 3 ? parts[2].trim().toLowerCase() === 'true' : false;
        
        const lastNpcLine = [...conversationHistory].reverse().find(msg => msg.sender === "npc")?.text ?? "";
        if (dialogue.trim() && dialogue.trim() === lastNpcLine.trim()) {
            return {
                responseText: language === 'en' ? "Hmm, I feel like I'm repeating myself. What else can I help with?" : "Hmm, parece que estou me repetindo. Em que mais posso ajudar?",
                affinityChange: 0,
                triggerDuel: false,
            };
        }

        return { responseText: dialogue, affinityChange, triggerDuel };

    } catch (error) {
        // Dynamic detection for provocation/insults in fallback mode
        const lowerMsg = playerMessage.toLowerCase();
        const isProvoking = /fraco|fraca|ganho|fácil|facil|aposto|lixo|cobarde|medo|perder|desafio|lutar|inútil|inutil|perderes|perdedor|fracassado|fracassada|tolo|mau|pessimo|péssimo|horrível|horrivel|vaca|cabra|burra|estúpida|estupida|parva|otária|otaria/.test(lowerMsg);
        
        if (isProvoking) {
            return {
                responseText: language === 'en' 
                    ? "That's enough! You dare insult me like that?! Draw your dragon, let's see if you can back up those rude words in a duel!" 
                    : "Já chega! Atreves-te a insultar-me assim?! Prepara o teu dragão, vamos ver se és tão forte a lutar como és a insultar! Desafio-te para um duelo!",
                affinityChange: -8,
                triggerDuel: true,
            };
        }

        // Rich character-specific offline fallback dialogues
        const fallbackMap: Record<string, { pt: string[]; en: string[] }> = {
            elara_swiftwood: {
                pt: [
                    "Olá! Estava precisamente a estudar um antigo pergaminho sobre a genealogia dos dragões da academia. Em que te posso ajudar?",
                    "Saudações! A biblioteca guarda segredos fascinantes hoje. Tens dedicado tempo ao treino do teu dragão?",
                    "Olá domador! Lembro-me de ler que um vínculo forte entre domador e dragão aumenta a precisão das magias."
                ],
                en: [
                    "Hello! I was just researching an ancient scroll on dragon ancestry. How can I help you?",
                    "Greetings! The academy library holds fascinating secrets today. Have you been practicing with your dragon?",
                    "Hello tamer! A strong bond with your dragon greatly improves spell precision."
                ]
            },
            bren_stonehand: {
                pt: [
                    "Com a guarda alta! O treino de hoje vai exigir disciplina máxima. O que precisas?",
                    "Firme como a pedra, domador! Garante que o teu dragão está bem alimentado antes de entrares na arena.",
                    "Saudações! Se estás aqui para treinar, estás no lugar certo. Força e foco sempre!"
                ],
                en: [
                    "Keep your guard up! Today's training requires maximum discipline. What do you need?",
                    "Firm as stone, tamer! Make sure your dragon is well fed before entering the arena.",
                    "Greetings! If you're here to train, you're in the right place. Stay strong!"
                ]
            },
            seraphina_moonshadow: {
                pt: [
                    "As sombras da academia sussurram segredos hoje... O que procuras?",
                    "Silêncio e concentração. A magia elemental exige mente serena e observação atenta.",
                    "Olá. Mantém a calma se quiseres dominar os mistérios mais profundos dos dragões."
                ],
                en: [
                    "The shadows of the academy whisper secrets today... What do you seek?",
                    "Silence and focus. Elemental magic requires a calm mind and careful observation.",
                    "Hello. Stay serene if you wish to master the deeper mysteries of dragons."
                ]
            },
            kael_stormrider: {
                pt: [
                    "Ei! Estás pronto para ver o meu dragão de raio voar a uma velocidade incrível?",
                    "Saudações! O treino de agilidade de hoje está imparável. Vieste pedir umas dicas?",
                    "Ora viva! Espero que estejas preparado para o próximo torneio da academia!"
                ],
                en: [
                    "Hey! Are you ready to see my lightning dragon fly at incredible speeds?",
                    "Greetings! Today's agility training is unstoppable. Looking for some tips?",
                    "Hey there! I hope you're preparing for the next academy tournament!"
                ]
            }
        };

        const npcFallback = fallbackMap[npc.id] || {
            pt: ["Olá! Em que posso ajudar-te hoje na academia?"],
            en: ["Hello! How can I help you today at the academy?"]
        };
        const pool = (language === 'en') ? npcFallback.en : npcFallback.pt;
        const randomText = pool[Math.floor(Math.random() * pool.length)];

        return {
            responseText: randomText,
            affinityChange: 1,
            triggerDuel: false,
        };
    }
    // Helper function to use translations inside the service. A bit of a hack.
    function t(key: string){
        if (language === 'pt-BR') return key; // Simplified for now
        if (language === 'en') return key;
        return key;
    }
};

export const getPostDuelResponse = async (
    npcId: string,
    npcName: string,
    npcPersona: string,
    playerName: string,
    playerWon: boolean,
    currentAffinity: number,
    language: Language
): Promise<{ responseText: string; affinityChange: number }> => {
    const langName = getLanguageName(language);
    const outcome = playerWon
        ? `${playerName} WON the duel. You were defeated.`
        : `${playerName} LOST the duel. You won.`;

    const prompt = `
You are a master AI that strictly generates game data. Your response MUST be in ${langName}.

### SCENARIO
- **YOUR ROLE (NPC):** You are **${npcName}**. Your personality is: "${npcPersona}".
- **WHAT JUST HAPPENED:** You challenged **${playerName}** to a dragon duel after being provoked. The duel is now over. ${outcome}
- **AFFINITY:** Your affinity with ${playerName} is ${currentAffinity} (from -100 to 100).

### TASK
Say ONE or TWO sentences reacting to the duel's result, in character, immediately after the fight.

### CRITICAL RULES
1.  **FORMAT:** Your response MUST use the format: <dialogue>|||<affinity_change>
2.  **IF YOU LOST:** Be humbled, breathless or begrudgingly impressed. Anger fading into respect. <affinity_change> must be POSITIVE (3 to 8).
3.  **IF YOU WON:** Be smug, superior or teasing, but not cruel. <affinity_change> must be between -2 and 3.
4.  **LANGUAGE:** Your dialogue MUST be in ${langName}.
5.  **NO PREFIX:** Do NOT start with "${npcName}:". Give the dialogue directly.
6.  **REFERENCE THE FIGHT:** Mention the duel, the dragons or the result. Do not give generic greetings.

### EXAMPLE
Ofegante... Admito, subestimei-te. O teu dragão luta com um fogo que eu não esperava.|||6

### FINAL INSTRUCTION
GENERATE THE RESPONSE NOW. STRICTLY FOLLOW THE FORMAT.
    `;

    try {
        const responseText = await callAI(prompt);
        const parts = responseText.split('|||');
        if (parts.length < 2) throw new Error("Invalid response format from model.");

        const dialogue = parts[0].trim();
        const affinityChange = parseInt(parts[1].trim(), 10);
        if (!dialogue || isNaN(affinityChange)) throw new Error("Malformed post-duel response.");

        // Mantem o valor dentro do intervalo pedido, mesmo que o modelo exagere.
        const clamped = playerWon
            ? Math.min(8, Math.max(3, affinityChange))
            : Math.min(3, Math.max(-2, affinityChange));

        return { responseText: dialogue, affinityChange: clamped };
    } catch (error) {
        console.warn("Failed to generate post-duel dialogue. Using fallback.", error);

        const fallbackMap: Record<string, { win: { pt: string; en: string }; loss: { pt: string; en: string } }> = {
            elara_swiftwood: {
                win:  { pt: "Ofegante... os pergaminhos não previam isto. Lutaste melhor do que qualquer teoria que eu tenha lido.", en: "Breathless... no scroll predicted this. You fought better than any theory I've read." },
                loss: { pt: "O conhecimento vence o impulso, domador. Volta quando tiveres estudado um pouco mais.", en: "Knowledge beats impulse, tamer. Come back when you've studied a little more." }
            },
            bren_stonehand: {
                win:  { pt: "Firme como a pedra, dizia eu... e tu partiste-a. Tens a minha consideração, domador.", en: "Firm as stone, I said... and you cracked it. You have my respect, tamer." },
                loss: { pt: "Guarda alta da próxima vez! A disciplina ganha duelos, não a língua afiada.", en: "Guard up next time! Discipline wins duels, not a sharp tongue." }
            },
            seraphina_moonshadow: {
                win:  { pt: "As sombras não te esconderam de mim... mas também não te travaram. Vejo-te de outra forma agora.", en: "The shadows did not hide you from me... nor did they stop you. I see you differently now." },
                loss: { pt: "A mente serena prevalece. Da próxima vez, traz mais do que provocações.", en: "The serene mind prevails. Next time, bring more than taunts." }
            },
            kael_stormrider: {
                win:  { pt: "Uau! Nem o meu raio te apanhou. És mesmo rápido, tenho de admitir!", en: "Whoa! Not even my lightning caught you. You really are fast, I'll admit it!" },
                loss: { pt: "Rápido demais para ti! Treina mais e talvez me acompanhes no próximo torneio.", en: "Too fast for you! Train more and maybe you'll keep up at the next tournament." }
            }
        };

        const generic = {
            win:  { pt: "Admito a derrota. O teu dragão foi superior hoje.", en: "I concede. Your dragon was superior today." },
            loss: { pt: "Falaste muito e lutaste pouco. Talvez para a próxima.", en: "You talked a lot and fought little. Maybe next time." }
        };

        const entry = fallbackMap[npcId] || generic;
        const side = playerWon ? entry.win : entry.loss;

        return {
            responseText: language === 'en' ? side.en : side.pt,
            affinityChange: playerWon ? 5 : 1,
        };
    }
};

export const generateActionOutcomes = async (action: string, dragonName: string, dragonElement: string, language: Language, trainingType?: TrainingType): Promise<string[]> => {
    const langName = getLanguageName(language);
    let specificTask = `A player performs the action "${action}" with their dragon named ${dragonName}, an ${dragonElement} element type.`;
    
    if (action === 'Treinar' && trainingType) {
        switch(trainingType) {
            case TrainingType.STRENGTH: specificTask = `A player puts their dragon, ${dragonName}, through a rigorous Strength Training regimen.`; break;
            case TrainingType.DEFENSE: specificTask = `A player puts their dragon, ${dragonName}, through a tough Endurance Training regimen.`; break;
            case TrainingType.SPEED: specificTask = `A player guides their dragon, ${dragonName}, through a fast-paced Agility Training regimen.`; break;
            case TrainingType.ELEMENTAL: specificTask = `A player and their dragon, ${dragonName} (an ${dragonElement} element), enter a deep Elemental Meditation.`; break;
        }
    }

    const prompt = `
      You are a creative writer for an RPG.
      
      ### TASK
      ${specificTask}
      Generate 5 short, distinct, and creative sentences in ${langName} describing the results.

      ### RULES & FORMATTING
      1.  **PLAIN TEXT ONLY:** Your response must be ONLY the sentences.
      2.  **ONE SENTENCE PER LINE:** Each sentence must be on a new line. Do not number them or use bullet points.
      3.  **NO JSON/MARKDOWN:** Do not add any other text or formatting.

      ### FINAL INSTRUCTION
      Generate the 5 sentences for the action: "${action}" in ${langName}.
    `;
    try {
        const responseText = await callAI(prompt);
        const outcomes = responseText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
        if (outcomes.length < 2) throw new Error("Invalid text list response from proxy.");
        return outcomes;
    } catch(error) {
         console.warn(`Failed to generate outcomes for action '${action}' via proxy. Using fallback.`, error);
         const fallbackOutcomes = PREDEFINED_ACTION_OUTCOMES[action] || [];
         if (fallbackOutcomes.length > 0) {
            return fallbackOutcomes.map(o => o.replace(/{dragonName}/g, dragonName)).sort(() => 0.5 - Math.random());
         }
         return language === 'en' ? [`The action "${action}" had no remarkable effect this time.`] : [`A ação "${action}" não teve um efeito notável desta vez.`];
    }
};