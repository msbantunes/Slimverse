// FIX: Import `Type` for responseSchema definition.
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { User, SpecialistType, Message } from '../types';
import { SPECIALIST_PROMPTS } from '../constants';

// FIX: Removed getApiKey helper to use process.env.API_KEY directly as per guidelines.

const generatePlan = async (user: User, feedback: string, specialist: SpecialistType): Promise<string> => {
    // FIX: Moved specialistInfo declaration outside the try block to make it accessible in the catch block.
    const specialistInfo = SPECIALIST_PROMPTS[specialist];
    try {
        // FIX: Initialize GoogleGenAI with API key directly from process.env.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
        **Dados do Usuário:**
        - Nome: ${user.name}
        - Gênero: ${user.gender}
        - Data de Nascimento: ${user.dob}
        - Altura: ${user.height} cm
        - Nível: ${user.level}
        - Peso Inicial: ${user.initialWeight} kg
        - Peso Atual: ${user.weight} kg
        - Meta de Peso: ${user.weightGoal} kg
        - Cintura Recente: ${user.waist} cm
        - Histórico de Medidas: ${JSON.stringify(user.history.slice(-3))}
        - Feedback do Dia: "${feedback}"

        **Sua Tarefa:**
        Baseado nos dados e no feedback, crie um novo plano PARA HOJE para o usuário, seguindo estritamente sua persona e diretrizes.
        O plano deve ser prático, motivador e personalizado.
        Comece com uma mensagem de apoio baseada no feedback do usuário antes de apresentar o plano.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: specialistInfo.systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating plan for ${specialist}:`, error);
        return `Ocorreu um erro ao gerar o plano de ${specialistInfo.name}. Por favor, tente novamente mais tarde.`;
    }
};

export const generateAllDailyPlans = async (user: User, feedback: string) => {
    const [workoutPlan, nutritionPlan, mentalPlan] = await Promise.all([
        generatePlan(user, feedback, SpecialistType.PhysicalEducator),
        generatePlan(user, feedback, SpecialistType.Nutritionist),
        generatePlan(user, feedback, SpecialistType.Psychologist),
    ]);

    return { workoutPlan, nutritionPlan, mentalPlan };
};

export const getSpecialistChatResponse = async (user: User, history: Message[], newMessage: string, targetSpecialist?: SpecialistType | 'all'): Promise<{ response: string, specialist: SpecialistType }> => {
    try {
        // FIX: Initialize GoogleGenAI with API key directly from process.env.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        let specialistKey: SpecialistType;

        if (targetSpecialist && targetSpecialist !== 'all') {
            specialistKey = targetSpecialist;
        } else {
            // FIX: Use JSON mode with responseSchema for robust specialist classification.
            const classificationPrompt = `Classifique a seguinte pergunta do usuário em uma das três categorias: '${SpecialistType.PhysicalEducator}', '${SpecialistType.Nutritionist}', ou '${SpecialistType.Psychologist}'. Pergunta: "${newMessage}"`;

            const classificationResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: classificationPrompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            specialist: {
                                type: Type.STRING,
                                description: `A categoria do especialista. Deve ser um dos seguintes: "${SpecialistType.PhysicalEducator}", "${SpecialistType.Nutritionist}", ou "${SpecialistType.Psychologist}".`
                            },
                        },
                    },
                }
            });
            
            let classifiedSpecialist: SpecialistType | undefined;
            try {
                const result = JSON.parse(classificationResponse.text);
                if (result.specialist && Object.values(SpecialistType).includes(result.specialist)) {
                    classifiedSpecialist = result.specialist;
                }
            } catch (e) {
                console.error("Failed to parse specialist classification JSON", e);
            }

            if (!classifiedSpecialist) {
                console.warn(`Could not classify specialist from response: "${classificationResponse.text}". Defaulting to Psychologist.`);
                specialistKey = SpecialistType.Psychologist; // Default fallback if classification is unclear
            } else {
                specialistKey = classifiedSpecialist;
            }
        }
        
        const specialistInfo = SPECIALIST_PROMPTS[specialistKey];

        const chatHistory = history.map(msg => `${msg.sender === 'user' ? 'Usuário' : 'Assistente'}: ${msg.text}`).join('\\n');

        const responsePrompt = `
        **Dados do Usuário:**
        - Nome: ${user.name}, Gênero: ${user.gender}, Data de Nascimento: ${user.dob}, Altura: ${user.height} cm, Nível: ${user.level}, Peso Inicial: ${user.initialWeight} kg, Peso Atual: ${user.weight} kg, Meta de Peso: ${user.weightGoal} kg, Cintura: ${user.waist} cm
        
        **Histórico da Conversa:**
        ${chatHistory}

        **Nova Pergunta do Usuário:**
        "${newMessage}"

        **Sua Tarefa:**
        Responda à pergunta do usuário de forma concisa e útil, seguindo sua persona.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: responsePrompt,
            config: {
                systemInstruction: specialistInfo.systemInstruction,
            }
        });

        return { response: response.text, specialist: specialistKey };
    } catch (error) {
        console.error("Error in chat response:", error);
        return { response: "Desculpe, não consegui processar sua pergunta. Poderia tentar de outra forma?", specialist: SpecialistType.Psychologist };
    }
}
