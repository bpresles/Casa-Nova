import {
  ArrowRight,
  Briefcase,
  Check,
  FileText,
  Home,
  Landmark,
  Shield,
  Star,
  Truck,
} from "lucide-react";
import React, { useState } from "react";
import { ServicePartner } from "../types";

interface ServicesDirectoryProps {
  initialCategory?: string | null;
}

const MOCK_PARTNERS: ServicePartner[] = [
  {
    id: "1",
    name: "ExpatBank Global",
    category: "BANK",
    description:
      "Ouvrez votre compte multi-devises en ligne en moins de 10 minutes. Profitez de virements internationaux à taux réels sans frais cachés, d'une carte de débit gratuite et d'un IBAN local dans plus de 30 pays.",
    logo: "🏦",
    rating: 4.8,
  },
  {
    id: "2",
    name: "VisaFastTrack",
    category: "VISA",
    description:
      "Service d'assistance visa et administrative avec garantie de traitement en 48h. Notre équipe d'experts gère l'ensemble de vos démarches : visas, permis de travail, documents légalisés et rendez-vous consulaires prioritaires.",
    logo: "🛂",
    rating: 4.9,
  },
  {
    id: "3",
    name: "HomeSweetHome",
    category: "HOUSING",
    description:
      "Nos chasseurs d'appartements locaux connaissent parfaitement le marché immobilier. Ils visitent pour vous, négocient les prix et vous accompagnent dans toutes les démarches jusqu'à la signature du bail et l'état des lieux.",
    logo: "🏠",
    rating: 4.7,
  },
  {
    id: "4",
    name: "SafeTravel Insure",
    category: "INSURANCE",
    description:
      "Assurance santé internationale couvrant plus de 180 pays avec remboursements jusqu'à 100%. Inclut téléconsultations illimitées, rapatriement médical, assistance 24/7 en français et réseau de 1,5 million de professionnels de santé.",
    logo: "🏥",
    rating: 4.6,
  },
  {
    id: "5",
    name: "EasyMove Logistics",
    category: "MOVING",
    description:
      "Déménagement international porte-à-porte avec suivi en temps réel. Emballage professionnel, dédouanement simplifié, assurance tous risques et stockage temporaire inclus. Service clé en main pour une installation sans stress.",
    logo: "🚛",
    rating: 4.5,
  },
  {
    id: "6",
    name: "TaxOptim",
    category: "TAX",
    description:
      "Cabinet spécialisé en fiscalité internationale pour expatriés. Optimisez votre situation fiscale, évitez la double imposition et restez conforme dans votre pays d'origine et d'accueil. Déclarations en ligne et conseils personnalisés.",
    logo: "📊",
    rating: 4.9,
  },
  {
    id: "7",
    name: "NeoBanq",
    category: "BANK",
    description:
      "La néobanque pensée pour les nomades digitaux et expatriés. Application mobile intuitive, comptes multi-devises, virements instantanés gratuits, cashback sur tous vos achats et aucun frais à l'étranger. Sans engagement.",
    logo: "📱",
    rating: 4.5,
  },
];

const CATEGORIES = [
  { id: "ALL", label: "Tous", icon: Briefcase },
  { id: "BANK", label: "Banque", icon: Landmark },
  { id: "VISA", label: "Visa & Admin", icon: FileText },
  { id: "HOUSING", label: "Logement", icon: Home },
  { id: "INSURANCE", label: "Assurance", icon: Shield },
  { id: "MOVING", label: "Déménagement", icon: Truck },
];

const ServicesDirectory: React.FC<ServicesDirectoryProps> = ({
  initialCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState(
    initialCategory || "ALL",
  );
  const [requested, setRequested] = useState<string[]>([]);

  const filteredPartners =
    activeCategory === "ALL"
      ? MOCK_PARTNERS
      : MOCK_PARTNERS.filter((p) => p.category === activeCategory);

  const handleRequest = (id: string) => {
    setRequested((prev) => [...prev, id]);
    // Dans une vraie app, cela déclencherait un email ou une API call
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">
          Nos Partenaires de Confiance
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Des services sélectionnés pour faciliter chaque étape de votre
          installation.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:border-green-300 hover:bg-green-50"
            }`}
          >
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl bg-slate-50 p-3 rounded-2xl">
                {partner.logo}
              </div>
              <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                <span className="text-sm font-bold text-amber-700">
                  {partner.rating}
                </span>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {partner.name}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {partner.description}
              </p>
            </div>

            <button
              onClick={() => handleRequest(partner.id)}
              disabled={requested.includes(partner.id)}
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-all ${
                requested.includes(partner.id)
                  ? "bg-green-100 text-green-700 cursor-default"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
              }`}
            >
              {requested.includes(partner.id) ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Demande envoyée
                </>
              ) : (
                <>
                  Obtenir un devis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">
            Aucun partenaire trouvé dans cette catégorie pour le moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesDirectory;
