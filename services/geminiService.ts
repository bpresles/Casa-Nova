import { GoogleGenAI, Type } from "@google/genai";
import { ConsultantResponse, DestinationInsight, RoadmapStep, UserProfile } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRoadmap = async (profile: UserProfile, scrappedData: Record<string, string[]>): Promise<RoadmapStep[]> => {
  const ai = getAI();

  console.log(scrappedData);

  const prompt = `
    Génère une roadmap d'expatriation très détaillée et chronologique pour le profil suivant :

    --- PROFIL UTILISATEUR ---
    Origine : ${profile.originCountry}
    Destination : ${profile.destinationCountry} ${profile.destinationCity ? `(Ville: ${profile.destinationCity})` : ""}
    Statut : ${profile.status}
    Motif : ${profile.purpose}
    Date de départ prévue : ${profile.moveDate}

    --- BESOINS SPÉCIFIQUES & CONTEXTE ---
    Demandes spécifiques: ${profile.specificInterests || "Aucun besoin spécifique signalé."}

    --- DONNÉES SCRAPÉES ---
    Tu prendras en compte les informations présentes dans les pages suivantes pour:

    - Les visas: ${scrappedData.visa?.join(", ") || "Aucune donnée visa disponible."}
    - Le travail: ${scrappedData.job?.join(", ") || "Aucune donnée emploi disponible."}
    - Le logement: ${scrappedData.housing?.join(", ") || "Aucune donnée logement disponible."}
    - L'assurance santé: ${scrappedData.healthcare?.join(", ") || "Aucune donnée santé disponible."}
    - La banque: ${scrappedData.banking?.join(", ") || "Aucune donnée bancaire disponible."}
    - La communication: ${scrappedData.communication?.join(", ") || "Aucune donnée communication disponible."}
    - Le transport: ${scrappedData.transport?.join(", ") || "Aucune donnée transport disponible."}
    - La langue: ${scrappedData.language?.join(", ") || "Aucune donnée langue disponible."}

    --- CONSIGNES DE GÉNÉRATION ---
    Agis comme un consultant expert en relocation. Ta mission est de fournir un plan d'action étape par étape.

    Règles impératives :
    1. Analyse les "Besoins spécifiques" listés ci-dessus. Si l'utilisateur a coché "Visa", "Logement", etc., ou ajouté du texte libre, tu DOIS créer des étapes dédiées très détaillées pour ces sujets précis.
    2. Tu ne mettras les étapes que pour les sujets qui est indiqué dans les "Motifs: ", ou mentionné dans "Demandes spécifiques: ".
    3. Tu ne mettras qu'une seule étape par sujet principal (Visa, Logement, Santé, Banque, Emploi), mais elle devra être très détaillée avec des sous-étapes concrètes.
    4. Pour les sujets ayant des données scrappées, intègre ces informations concrètes dans les étapes correspondantes, et n'invente rien d'autre.
    5. Si la date de départ est proche, priorise les urgences (High Priority).
    6. Fait attention à ce que les dates mentionnées dans les étapes soient postérieures à la date actuelle.
    7. Structure la réponse en un tableau JSON strict.
    8. Pour chaque étape, inclus une liste de 'subSteps' (actions concrètes).
    9. Fournis des 'resources' avec des noms de sites officiels pertinents pour la destination en utilisant les URLs scrappées uniquement.
    10. Assigne une 'serviceCategory' si un professionnel est souvent requis pour cette étape.

    Format JSON attendu : Array<RoadmapStep>
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Catégorie courte (ex: Admin, Logement, Santé)",
              },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              timeline: {
                type: Type.STRING,
                description: "Quand faire cette action (ex: M-3, 2 semaines avant)",
              },
              priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              subSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Liste des actions détaillées à effectuer pour cette étape",
              },
              resources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: "Nom du site ou de la ressource (ex: Site officiel Visa)",
                    },
                    url: {
                      type: Type.STRING,
                      description: "URL réelle issue des données scrappées uniquement",
                    },
                  },
                },
                description: "Liens vers des sites officiels ou formulaires",
              },
              serviceCategory: {
                type: Type.STRING,
                enum: ["BANK", "VISA", "HOUSING", "INSURANCE", "TAX", "MOVING", "NONE"],
                description: "Type de service partenaire utile pour cette étape",
              },
            },
            required: ["category", "title", "description", "timeline", "priority", "subSteps", "resources", "serviceCategory"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    // Add isCompleted: false by default
    const steps = JSON.parse(text) as RoadmapStep[];
    return steps.map((s) => ({ ...s, isCompleted: false }));
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return [];
  }
};

export const getDestinationInsights = async (country: string, city?: string): Promise<DestinationInsight | null> => {
  const ai = getAI();

  const target = city ? `${city}, ${country}` : country;
  const prompt = `Donne-moi des informations pratiques et culturelles pour un expatrié s'installant à ${target}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description: "Bref résumé de la destination",
            },
            costOfLiving: {
              type: Type.STRING,
              description: "Estimation du coût de la vie par rapport à la France",
            },
            cultureVibe: {
              type: Type.STRING,
              description: "Ambiance culturelle et sociale",
            },
            adminTips: {
              type: Type.STRING,
              description: "Conseil administratif clé spécifique au pays",
            },
            safety: {
              type: Type.STRING,
              description: "Niveau de sécurité et conseils",
            },
          },
          required: ["overview", "costOfLiving", "cultureVibe", "adminTips", "safety"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as DestinationInsight;
  } catch (error) {
    console.error("Error fetching destination insights:", error);
    return null;
  }
};

export const askAssistant = async (question: string, context: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Tu es un expert en expatriation bienveillant pour l'application Casa Nova.
    Contexte actuel de l'utilisateur : ${context}

    Question de l'utilisateur : "${question}"

    Réponds de manière concise, utile et encourageante (max 3 phrases).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Désolé, je n'ai pas pu traiter votre demande pour le moment.";
  } catch (error) {
    return "Une erreur est survenue lors de la communication avec l'assistant.";
  }
};

// DEPRECATED: Kept only for interface compatibility if needed elsewhere, but logic replaced by direct form submission
export const consultantChat = async (history: { role: "user" | "model"; text: string }[], currentProfile: UserProfile): Promise<ConsultantResponse> => {
  // Placeholder implementation as we moved to form wizard
  return {
    message: "Le système de chat a été remplacé par le formulaire.",
    extractedProfile: currentProfile,
    isReadyToGenerate: false,
  };
};
