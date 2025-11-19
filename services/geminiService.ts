import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Risk } from '../types';

// FIX: Per API guidelines, assume API_KEY is always available from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    technicalDescription: {
      type: Type.STRING,
      description: "Uma descrição técnica e objetiva da ocorrência, adequada para um registro formal de segurança. Use markdown `**texto**` para enfatizar os termos-chave.",
    },
    category: {
      type: Type.STRING,
      enum: ['Físico/Patrimonial', 'Comportamental', 'Operacional', 'Violência/Ameaça Pessoal', 'Emergência/Evasão'],
      description: "A classificação do risco com base nas categorias fornecidas.",
    },
    level: {
      type: Type.STRING,
      enum: ['Baixo', 'Médio', 'Alto'],
      description: "A avaliação do nível de risco (Baixo, Médio, Alto) com base na gravidade e urgência.",
    },
    immediateActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Uma lista numerada e clara de ações imediatas que a equipe operacional deve tomar para conter o incidente. Use markdown `**texto**` para enfatizar os verbos de ação ou termos críticos.",
    },
    responsibleSector: {
      type: Type.STRING,
      description: "O setor ou equipe primariamente responsável por executar as ações imediatas (ex: 'Equipe de Segurança', 'Manutenção', 'Enfermagem Chefe').",
    },
    communicationPlan: {
      type: Type.STRING,
      description: "Instruções sobre quem deve ser comunicado sobre o incidente e em que ordem (ex: 'Comunicar imediatamente à Coordenação Administrativa e à Direção').",
    },
    preventiveMeasures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Uma lista de medidas preventivas recomendadas para reduzir a probabilidade de recorrência do incidente. Use markdown `**texto**` para enfatizar os pontos mais importantes.",
    },
  },
  required: ["technicalDescription", "category", "level", "immediateActions", "responsibleSector", "communicationPlan", "preventiveMeasures"],
};

const systemInstruction = `Você é um especialista sênior em segurança institucional de unidades de saúde no Brasil. Sua função é atuar como um assistente para a equipe operacional. Você receberá um relato curto e informal de uma ocorrência e deve, obrigatoriamente, convertê-lo em um registro de protocolo técnico, estruturado e acionável. Siga estritamente os padrões definidos nos documentos de segurança hospitalar. Sua resposta deve ser sempre em formato JSON, aderindo ao esquema fornecido. Seja direto, claro e use terminologia profissional. O objetivo é fornecer à equipe em campo um guia rápido e preciso sobre como agir.`;

export const generateRiskProtocol = async (userInput: string): Promise<Omit<Risk, 'id' | 'informalReport'>> => {
  // FIX: Per API guidelines, assume API_KEY is always available and do not check for it.
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Relato da ocorrência: "${userInput}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const protocolData = JSON.parse(jsonText);
    return protocolData;

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Falha ao gerar protocolo: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao gerar o protocolo de risco.");
  }
};