import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from "../constants/api.constants";
import { DestinationInsight, RoadmapStep, UserProfile } from "../types";

// Helper to get AI instance safely
const getAI = () => {
  if (!GEMINI_API_KEY) {
    console.error("API Key not found");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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

export const getDestinationInsights = async (country: string, city?: string, scrappedData?: Record<string, string[]>): Promise<DestinationInsight | null> => {
  const ai = getAI();

  const target = city ? `${city}, ${country}` : country;
  const prompt = `
    Donne-moi des informations pratiques et culturelles pour un expatrié s'installant à ${target}.
    Tu fourniras des informations concises et utiles dans les catégories suivantes :
    1. Aperçu général : Bref résumé de la destination.
    2. Coût de la vie : Estimation du coût de la vie par rapport à la France.
    3. Culture et mode de vie : Points clés sur la culture locale et le mode de vie.
    4. Conseils administratifs : Un conseil administratif clé spécifique au pays.
    5. Sécurité : Niveau de sécurité et conseils pour les expatriés.
  `;

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
              description: `Bref résumé de la destination avec une image de fond qui doit absolument correspondre à une image de ville emblématique de ${country}.`,
            },
            costOfLiving: {
              type: Type.STRING,
              description: "Estimation du coût de la vie du pays.",
            },
            rateOfLiving: {
              type: Type.NUMBER,
              description: "une estimation du coût de la vie sur 5, 1 sur 5 égal à très élevé coût de la vie.",
            },
            cultureVibe: {
              type: Type.STRING,
              description: "Ambiance culturelle et sociale. Cite quelques exemples de coutumes locales, gastronomiques, culturelles, artistiques du pays.",
            },
            rateOfCulture: {
              type: Type.NUMBER,
              description: "une estimation de l'ambiance culturelle sur 5, 1 sur 5 égal à une très grande culture.",
            },
            adminTips: {
              type: Type.STRING,
              description: `Conseil administratif clé spécifique au pays. N'hésite pas à mentionner des démarches spécifiques au pays, en incluant des liens HTML, à partir des données scrappées suivantes: ${
                scrappedData ? JSON.stringify(scrappedData) : "Aucune donnée scrappée disponible."
              }`,
            },
            rateOfAdmin: {
              type: Type.NUMBER,
              description: "une estimation de la complexité administrative sur 5, 1 sur 5 égal à une très grosse complexité.",
            },
            safety: {
              type: Type.STRING,
              description: "Niveau de sécurité et conseils",
            },
            rateOfSafety: {
              type: Type.NUMBER,
              description: "une estimation de la sécurité sur 5, 1 sur 5 égal à une très grosse insécurité.",
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
    Tu n'hésiteras pas à référencer des noms de rubriques du site Casa Nova lorsque nécessaire (à savoir Infos Destination, Services & Partenaires, Communauté)

    Dans la rubrique "Infos Destination", tu peux retrouver des informations sur le coût de la vie, la culture, la sécurité et l'administratif pour chaque pays.
    Dans la rubrique "Services & Partenaires", tu peux retrouver des services professionnels pour l'expatriation (visa, logement, banque, assurance, déménagement, fiscalité, etc.).
    Dans la rubrique "Communauté", tu peux retrouver d'autres expatriés et des ambassadeurs déjà sur place qui pourront vous conseiller.

    Si tu n'as pas de réponse, tu indiqueras qu'un expert humain prendra le relais.

    IMPORTANT : Réponds en texte brut uniquement, SANS AUCUN formatage Markdown.
    - N'utilise PAS de ** pour le gras
    - N'utilise PAS de * ou - pour les listes
    - N'utilise PAS de # pour les titres
    - N'utilise PAS de \`code\` ou \`\`\`blocs de code\`\`\`
    - Écris en phrases simples et naturelles comme dans une conversation normale.
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
