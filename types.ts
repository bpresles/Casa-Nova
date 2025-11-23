export enum AppView {
  HOME = "HOME",
  ROADMAP = "ROADMAP",
  COMMUNITY = "COMMUNITY",
  DESTINATION = "DESTINATION",
  SERVICES = "SERVICES",
}

export interface RoadmapResource {
  title: string;
  url: string;
}

export interface RoadmapStep {
  category: string;
  title: string;
  description: string;
  timeline: string;
  priority: "High" | "Medium" | "Low";
  subSteps?: string[]; // Détails des démarches
  subStepsCompleted?: boolean[]; // État d'avancement de chaque sous-étape
  resources?: RoadmapResource[]; // Liens officiels
  isCompleted?: boolean; // État d'avancement
  serviceCategory?: "BANK" | "VISA" | "HOUSING" | "INSURANCE" | "TAX" | "MOVING" | "NONE"; // Pour lier aux partenaires
}

export interface UserProfile {
  originCountry: string;
  destinationCountry: string;
  destinationCity?: string;
  moveDate: string;
  status: "Solo" | "Couple" | "Famille";
  purpose: "Travail" | "Etudes" | "Retraite" | "Digital Nomad";
  specificInterests?: string; // Nouveaux sujets d'intérêt (ex: "scolarité", "animal de compagnie")
}

export interface DestinationInsight {
  overview: string;
  costOfLiving: string;
  cultureVibe: string;
  adminTips: string;
  safety: string;
  rateOfLiving: number; // Rating de 1 à 5 pour le coût de la vie
  rateOfCulture: number; // Rating de 1 à 5 pour la culture
  rateOfSafety: number; // Rating de 1 à 5 pour la sécurité
  rateOfAdmin: number; // Rating de 1 à 5 pour les démarches administratives
}

export interface CommunityGroup {
  id: string;
  name: string;
  members: number;
  topic: string;
  image: string;
}

export interface ServicePartner {
  id: string;
  name: string;
  category: "BANK" | "VISA" | "HOUSING" | "INSURANCE" | "TAX" | "MOVING";
  description: string;
  logo: string;
  rating: number;
}

export interface ConsultantResponse {
  message: string;
  extractedProfile: Partial<UserProfile>;
  isReadyToGenerate: boolean;
}
