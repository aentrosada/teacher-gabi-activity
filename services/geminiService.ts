import { GoogleGenAI, Type } from "@google/genai";
import { UserInputs, ActivityType, GeneratedActivity, GenerationResult } from '../types';

const getResponseSchema = (activityType: ActivityType) => {
  switch (activityType) {
    case ActivityType.CONNECT_THE_DOTS:
      return {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Um título infantil para o desenho." },
          points: {
            type: Type.ARRAY,
            description: "Um array de coordenadas {x, y} entre 0 e 100.",
            items: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
              },
              required: ['x', 'y'],
            },
          },
        },
        required: ['title', 'points'],
      };
    case ActivityType.CROSSWORD:
      return {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Um título para a cruzadinha." },
          gridSize: { type: Type.INTEGER, description: "O tamanho da grade quadrada (ex: 10 para uma grade 10x10)." },
          clues: {
            type: Type.ARRAY,
            description: "Um array de pistas para a cruzadinha.",
            items: {
              type: Type.OBJECT,
              properties: {
                num: { type: Type.INTEGER, description: "O número da pista na grade." },
                clue: { type: Type.STRING, description: "O texto da pista." },
                answer: { type: Type.STRING, description: "A palavra da resposta." },
                row: { type: Type.INTEGER, description: "A linha inicial (base 0)." },
                col: { type: Type.INTEGER, description: "A coluna inicial (base 0)." },
                direction: { type: Type.STRING, description: "'across' (horizontal) ou 'down' (vertical)." },
              },
              required: ['num', 'clue', 'answer', 'row', 'col', 'direction'],
            },
          },
        },
        required: ['title', 'gridSize', 'clues'],
      };
    case ActivityType.WORD_SEARCH:
      return {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Um título para o caça-palavras." },
          gridSize: { type: Type.INTEGER, description: "O tamanho da grade quadrada (ex: 10 para uma grade 10x10)." },
          grid: {
            type: Type.ARRAY,
            description: "Uma matriz 2D de letras maiúsculas para a grade.",
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          words: {
            type: Type.ARRAY,
            description: "Uma lista das palavras escondidas.",
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'gridSize', 'grid', 'words'],
      };
    case ActivityType.QUIZ:
      return {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Um título para a provinha." },
          questions: {
            type: Type.ARRAY,
            description: "Um array de 5 perguntas de múltipla escolha.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "O texto da pergunta." },
                options: {
                  type: Type.ARRAY,
                  description: "Um array de 4 strings com as opções de resposta.",
                  items: { type: Type.STRING },
                },
                answer: { type: Type.STRING, description: "O texto da resposta correta, que deve ser uma das opções." },
              },
              required: ['question', 'options', 'answer'],
            },
          },
        },
        required: ['title', 'questions'],
      };
  }
};

const getPrompt = (inputs: UserInputs, instance: number): string => {
  const variationPrompt = ` Esta é a variação ${instance} de 3, por favor, torne-a distinta das outras.`;
  const base = `Gere uma atividade educativa infantil. Idioma: ${inputs.language}. Faixa etária: ${inputs.age}. Tema: "${inputs.theme}". Atividade: ${inputs.activityType}.`;
  switch (inputs.activityType) {
    case ActivityType.CONNECT_THE_DOTS:
      return `${base} O desenho deve ser um objeto simples e reconhecível relacionado ao tema. Use entre 15 e 30 pontos. As coordenadas devem estar dentro de uma grade de 100x100. ${variationPrompt}`;
    case ActivityType.CROSSWORD:
      return `${base} Gere uma cruzadinha simples com 5-8 palavras. Garanta que as pistas sejam apropriadas para a idade. ${variationPrompt}`;
    case ActivityType.WORD_SEARCH:
      return `${base} Gere uma grade de caça-palavras. Esconda de 6 a 8 palavras na horizontal, vertical ou diagonal. As palavras e letras devem estar em maiúsculas. ${variationPrompt}`;
    case ActivityType.QUIZ:
      return `${base} Gere uma 'provinha' com 5 perguntas de múltipla escolha. As perguntas devem ser simples, adequadas para a idade e sobre o tema. Forneça 4 opções para cada pergunta. A resposta correta deve estar incluída na lista de opções. ${variationPrompt}`;
  }
};

export const generateActivities = async (inputs: UserInputs): Promise<GenerationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("A variável de ambiente API_KEY não está definida");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema = getResponseSchema(inputs.activityType);
  
  const activityGenerationPromises = [1, 2, 3].map(i => {
    const prompt = getPrompt(inputs, i);
    return ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
  });

  const responses = await Promise.all(activityGenerationPromises);

  const activities = responses.map(response => {
    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return { ...parsedJson, type: inputs.activityType };
    } catch (e) {
        console.error("Falha ao analisar a resposta JSON do Gemini:", jsonString);
        throw new Error("Recebemos dados inválidos da IA. Por favor, tente novamente.");
    }
  });

  return { activities: activities as GeneratedActivity[] };
};