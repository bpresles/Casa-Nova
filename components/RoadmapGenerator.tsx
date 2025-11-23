import axios from "axios";
import { ArrowLeft, ArrowRight, Briefcase, Calendar, Check, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, FileText, Heart, HelpCircle, Loader2, MapPin, Plane, Users } from "lucide-react";
import React, { useState } from "react";
import { generateRoadmap } from "../services/geminiService";
import { RoadmapStep, UserProfile } from "../types";

interface RoadmapGeneratorProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  roadmap: RoadmapStep[];
  setRoadmap: (roadmap: RoadmapStep[]) => void;
  onRoadmapGenerated: (destination: string) => void;
  onFindPartner: (category: string) => void;
}

// Static Data for Autocomplete
const STATIC_COUNTRIES = ["Canada", "Japon", "Portugal", "Australie", "Espagne", "Singapour"];

const STATIC_CITIES: Record<string, string[]> = {
  Canada: ["Montréal", "Toronto", "Vancouver", "Ottawa", "Québec", "Calgary"],
  Japon: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo", "Fukuoka"],
  Portugal: ["Lisbonne", "Porto", "Faro", "Coimbra", "Braga", "Funchal"],
  Australie: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
  Espagne: ["Madrid", "Barcelone", "Valence", "Séville", "Bilbao", "Malaga"],
  Singapour: ["Singapour"],
};

const VISA = "Obtention du Visa";
const HOUSING = "Trouver un logement";
const HEALTHCARE = "Système de santé";
const BANK_ACCOUNT = "Ouvrir un compte bancaire";
const EMPLOYMENT = "Emploi sur place";
const SPECIFIC_NEEDS_OPTIONS = [VISA, HOUSING, HEALTHCARE, BANK_ACCOUNT, EMPLOYMENT];

type NEED = (typeof SPECIFIC_NEEDS_OPTIONS)[number];

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ profile, setProfile, roadmap, setRoadmap, onRoadmapGenerated, onFindPartner }) => {
  const [viewMode, setViewMode] = useState<"form" | "loading" | "result">(roadmap.length > 0 ? "result" : "form");
  const [formStep, setFormStep] = useState(1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Local state for the form before committing to main profile
  const [selectedNeeds, setSelectedNeeds] = useState<NEED[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Autocomplete UI state
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const handleNextStep = () => {
    if (formStep < 3) setFormStep(formStep + 1);
  };

  const handlePrevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleGenerate = async () => {
    // Construct the final specific interests string
    const interestsString = `Besoins prioritaires : ${selectedNeeds.join(", ")}. \nPrécisions : ${additionalDetails}`;

    const finalProfile = {
      ...profile,
      specificInterests: interestsString,
    };

    const { data: countries } = await axios.get<{ data: { name_fr: string }[] }>("http://localhost:5000/countries");

    const country = countries.data.find((c) => c.name_fr.toLowerCase() === finalProfile.destinationCountry.toLowerCase()) || finalProfile.destinationCountry;

    const scrappedData = {};

    await Promise.all(
      selectedNeeds.map(async (need: NEED) => {
        if (need === VISA) {
          const { data } = await axios.get(`http://localhost:5000/visa?country=${country.code}`);
          scrappedData["visa"] = data.data.map((item: any) => item.source_url);
        } else if (need === HOUSING) {
          const { data } = await axios.get(`http://localhost:5000/housing?country=${country.code}`);
          scrappedData["housing"] = data.data.map((item: any) => item.source_url);
        } else if (need === HEALTHCARE) {
          const { data } = await axios.get(`http://localhost:5000/healthcare?country=${country.code}`);
          scrappedData["healthcare"] = data.data.map((item: any) => item.source_url);
        } else if (need === BANK_ACCOUNT) {
          const { data } = await axios.get(`http://localhost:5000/banking?country=${country.code}`);
          scrappedData["banking"] = data.data.map((item: any) => item.source_url);
        } else if (need === EMPLOYMENT) {
          const { data } = await axios.get(`http://localhost:5000/job?country=${country.code}`);
          scrappedData["job"] = data.data.map((item: any) => item.source_url);
        }
      })
    );

    setProfile(finalProfile);
    setViewMode("loading");

    try {
      const steps = await generateRoadmap(finalProfile, scrappedData);
      setRoadmap(steps);
      onRoadmapGenerated(finalProfile.destinationCountry);
      setViewMode("result");
    } catch (error) {
      console.error("Failed to generate", error);
      // Simple error handling - go back to form
      setViewMode("form");
      alert("Une erreur est survenue lors de la génération. Veuillez vérifier vos informations.");
    }
  };

  const toggleStep = (idx: number) => {
    setExpandedStep(expandedStep === idx ? null : idx);
  };

  const toggleComplete = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRoadmap = [...roadmap];
    newRoadmap[idx] = {
      ...newRoadmap[idx],
      isCompleted: !newRoadmap[idx].isCompleted,
    };
    setRoadmap(newRoadmap);
  };

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds((prev) => prev.filter((n) => n !== need));
    } else {
      setSelectedNeeds((prev) => [...prev, need]);
    }
  };

  // Autocomplete Handlers
  const handleCountrySelect = (country: string) => {
    setProfile({
      ...profile,
      destinationCountry: country,
      destinationCity: "",
    }); // Reset city on country change
    setShowCountrySuggestions(false);
  };

  const handleCitySelect = (city: string) => {
    setProfile({ ...profile, destinationCity: city });
    setShowCitySuggestions(false);
  };

  // Filter Logic
  const filteredCountries = STATIC_COUNTRIES.filter((c) => c.toLowerCase().includes(profile.destinationCountry.toLowerCase()));

  const availableCities = STATIC_CITIES[profile.destinationCountry] || [];
  const filteredCities = availableCities.filter((c) => c.toLowerCase().includes((profile.destinationCity || "").toLowerCase()));

  // Calculate progress
  const completedSteps = roadmap.filter((s) => s.isCompleted).length;
  const progressPercentage = roadmap.length > 0 ? Math.round((completedSteps / roadmap.length) * 100) : 0;

  if (viewMode === "loading") {
    return (
      <div className='flex flex-col items-center justify-center h-96 text-center px-4'>
        <div className='relative mb-8'>
          <div className='absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25'></div>
          <div className='relative bg-white p-4 rounded-full shadow-lg border border-green-50'>
            <Loader2 className='h-12 w-12 text-green-600 animate-spin' />
          </div>
        </div>
        <h3 className='text-2xl font-bold text-slate-900 mb-2'>Construction de votre roadmap...</h3>
        <p className='text-slate-500 max-w-md'>
          Nous analysons les procédures pour <span className='font-semibold text-green-600'>{profile.destinationCountry}</span> et personnalisons les étapes selon votre profil{" "}
          {profile.status.toLowerCase()}.
        </p>
      </div>
    );
  }

  if (viewMode === "result") {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8 relative'>
        <div className='bg-green-900 rounded-2xl p-6 sm:p-10 text-white mb-10 shadow-xl relative overflow-visible'>
          <div className='absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl'></div>
          <div className='absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-green-500 opacity-20 rounded-full blur-2xl'></div>

          <div className='relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-2 text-green-200 text-sm font-medium uppercase tracking-wider'>
                <Plane className='h-4 w-4' />
                Projet d'expatriation
              </div>
              <h2 className='text-3xl font-bold mb-2'>Direction : {profile.destinationCountry}</h2>
              <div className='flex flex-wrap gap-3 text-sm text-green-100'>
                <span className='bg-green-800/50 px-3 py-1 rounded-full border border-green-700'>{profile.status}</span>
                <span className='bg-green-800/50 px-3 py-1 rounded-full border border-green-700'>{profile.purpose}</span>
                <span className='bg-green-800/50 px-3 py-1 rounded-full border border-green-700'>{profile.moveDate || "Date non fixée"}</span>
              </div>
            </div>
            <button
              onClick={() => setViewMode("form")}
              className='bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2'
            >
              Modifier mon projet
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8 sticky top-24 z-30'>
          <div className='flex justify-between items-end mb-2'>
            <div>
              <h3 className='font-bold text-slate-800'>Votre progression</h3>
              <p className='text-xs text-slate-500'>Complétez les étapes pour réussir votre départ</p>
            </div>
            <span className='text-2xl font-bold text-green-600'>{progressPercentage}%</span>
          </div>
          <div className='w-full bg-slate-100 rounded-full h-2.5 overflow-hidden'>
            <div className='bg-gradient-to-r from-green-500 to-purple-600 h-full rounded-full transition-all duration-700 ease-out' style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className='space-y-4 relative pl-4 sm:pl-0'>
          {/* Timeline connector line */}
          <div className='absolute left-8 sm:left-8 top-8 bottom-8 w-0.5 bg-slate-200 hidden sm:block' />

          {roadmap.length === 0 ? (
            <div className='text-center py-10'>
              <p className='text-slate-600'>Aucune donnée disponible. Veuillez réessayer.</p>
            </div>
          ) : (
            roadmap.map((item, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 sm:ml-16 ${
                  item.isCompleted ? "border-green-200 bg-green-50/30 opacity-75" : "border-slate-200 hover:border-green-300"
                } ${expandedStep === idx ? "ring-2 ring-green-100" : ""}`}
              >
                {/* Desktop Timeline Node */}
                <div className='hidden sm:flex absolute -left-12 top-6 items-center justify-center z-10'>
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-slate-50 ${item.isCompleted ? "border-green-500 text-green-600" : "border-green-600 text-green-600"}`}
                  >
                    <span className='text-xs font-bold'>{idx + 1}</span>
                  </div>
                </div>

                <div className='p-5 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors' onClick={() => toggleStep(idx)}>
                  {/* Checkbox Area */}
                  <div className='z-10 flex items-start pt-1'>
                    <button
                      onClick={(e) => toggleComplete(idx, e)}
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.isCompleted ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-green-400 bg-white"
                      }`}
                    >
                      {item.isCompleted && <Check className='h-4 w-4' />}
                    </button>
                  </div>

                  <div className='flex-1'>
                    <div className='flex flex-wrap justify-between items-start gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${item.isCompleted ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600"}`}>
                          {item.category}
                        </span>
                        {item.priority === "High" && !item.isCompleted && (
                          <span className='text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100'>Prioritaire</span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs sm:text-sm text-slate-500 italic'>{item.timeline}</span>
                        {expandedStep === idx ? <ChevronUp className='h-5 w-5 text-slate-400' /> : <ChevronDown className='h-5 w-5 text-slate-400' />}
                      </div>
                    </div>
                    <h3 className={`text-lg font-bold mt-1 ${item.isCompleted ? "text-slate-500 line-through decoration-slate-400" : "text-slate-900"}`}>{item.title}</h3>
                    <p className={`mt-1 text-sm leading-relaxed ${item.isCompleted ? "text-slate-400" : "text-slate-600"}`}>{item.description}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedStep === idx && (
                  <div className='px-6 pb-6 pt-2 bg-slate-50 border-t border-slate-100 ml-10 sm:ml-0 animate-in slide-in-from-top-2 duration-200'>
                    <div className='grid md:grid-cols-2 gap-6'>
                      {/* Actions */}
                      <div>
                        <h4 className='text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-slate-500' />
                          Actions requises
                        </h4>
                        <ul className='space-y-2 mb-6'>
                          {item.subSteps?.map((sub, subIdx) => (
                            <li key={subIdx} className='flex items-start gap-3 text-sm text-slate-700'>
                              <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0' />
                              <span>{sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className='text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-slate-500' />
                          Ressources Officielles
                        </h4>
                        {item.resources && item.resources.length > 0 ? (
                          <ul className='space-y-2 mb-6'>
                            {item.resources.map((res, rIdx) => (
                              <li key={rIdx}>
                                <a
                                  href={res.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline group bg-white p-2 rounded border border-slate-200 shadow-sm'
                                >
                                  <ExternalLink className='h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform' />
                                  {res.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className='text-sm text-slate-500 italic mb-6'>Nous n'avons pas détecté de lien direct, mais une recherche Google est conseillée.</p>
                        )}
                      </div>
                    </div>

                    {item.serviceCategory && item.serviceCategory !== "NONE" && (
                      <div className='bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col sm:flex-row items-center justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-white rounded-full shadow-sm'>
                            <Briefcase className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <p className='font-bold text-slate-900 text-sm'>Simplifiez-vous la vie</p>
                            <p className='text-xs text-slate-600'>Nos partenaires peuvent gérer cette étape pour vous.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onFindPartner(item.serviceCategory!)}
                          className='whitespace-nowrap px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center'
                        >
                          Voir les experts
                          <ArrowRight className='h-4 w-4' />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // FORM VIEW (WIZARD)
  return (
    <div className='max-w-3xl mx-auto'>
      <div className='mb-8 text-center'>
        <h2 className='text-3xl font-bold text-slate-900'>Créez votre feuille de route</h2>
        <p className='text-slate-600 mt-2'>Répondez à ces quelques questions pour obtenir votre plan d'action personnalisé.</p>
      </div>

      <div className='bg-white rounded-2xl shadow-lg border border-slate-100 relative relative'>
        {/* Progress Steps Header */}
        <div className='bg-slate-50 border-b border-slate-100 px-6 py-4 rounded-t-2xl rounded-t-2xl'>
          <div className='flex items-center justify-between max-w-md mx-auto'>
            {[1, 2, 3].map((s) => (
              <div key={s} className='flex flex-col items-center z-10'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    formStep >= s ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs mt-1 font-medium ${formStep >= s ? "text-green-600" : "text-slate-400"}`}>{s === 1 ? "Destination" : s === 2 ? "Projet" : "Besoins"}</span>
              </div>
            ))}
            {/* Connecting Line */}
            <div className='absolute top-10 left-0 w-full h-0.5 bg-slate-200 -z-0 hidden'></div>
          </div>
        </div>

        <div className='p-8'>
          {/* Step 1: Destination */}
          {formStep === 1 && (
            <div className='space-y-6 animate-in slide-in-from-right duration-300'>
              <div className='space-y-4'>
                {/* Country Input with Static Autocomplete */}
                <label className='block relative z-20'>
                  <span className='text-slate-700 font-semibold mb-1 block'>
                    Pays de destination <span className='text-red-500'>*</span>
                  </span>
                  <div className='relative'>
                    <MapPin className='absolute left-3 top-3.5 h-5 w-5 text-slate-400 z-10' />
                    <input
                      type='text'
                      value={profile.destinationCountry}
                      onChange={(e) => {
                        setProfile({
                          ...profile,
                          destinationCountry: e.target.value,
                        });
                        setShowCountrySuggestions(true);
                      }}
                      onFocus={() => setShowCountrySuggestions(true)}
                      // Delay blur to allow click event on list items
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                      placeholder='Ex: Canada, Japon, Portugal...'
                      className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400'
                      autoComplete='off'
                      autoFocus
                    />

                    {/* Country Suggestions Dropdown */}
                    {showCountrySuggestions && filteredCountries.length > 0 && (
                      <div className='absolute z-20 w-full bg-white mt-1 border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto'>
                        <ul>
                          {filteredCountries.map((country) => (
                            <li key={country} onClick={() => handleCountrySelect(country)} className='px-4 py-3 hover:bg-green-50 cursor-pointer text-slate-700 font-medium transition-colors'>
                              {country}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </label>

                {/* City Input with Dependent Autocomplete */}
                <label className='block relative z-10'>
                  <span className='text-slate-700 font-semibold mb-1 block'>Ville (Optionnel)</span>
                  <div className='relative'>
                    <MapPin className='absolute left-3 top-3.5 h-5 w-5 text-slate-400 z-10' />
                    <input
                      type='text'
                      value={profile.destinationCity || ""}
                      onChange={(e) => {
                        setProfile({
                          ...profile,
                          destinationCity: e.target.value,
                        });
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                      placeholder={availableCities.length > 0 ? `Ex: ${availableCities[0]}...` : "Entrez une ville..."}
                      className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-slate-900 placeholder-slate-400'
                      autoComplete='off'
                    />

                    {/* City Suggestions Dropdown */}
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <div className='absolute z-20 w-full bg-white mt-1 border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto'>
                        <ul>
                          {filteredCities.map((city) => (
                            <li key={city} onClick={() => handleCitySelect(city)} className='px-4 py-3 hover:bg-green-50 cursor-pointer text-slate-700 font-medium transition-colors'>
                              {city}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {availableCities.length === 0 && profile.destinationCountry && STATIC_COUNTRIES.includes(profile.destinationCountry) === false && (
                    <p className='text-xs text-slate-500 mt-1'>Préciser la ville permet d'obtenir des infos plus locales.</p>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Context */}
          {formStep === 2 && (
            <div className='space-y-6 animate-in slide-in-from-right duration-300'>
              <label className='block'>
                <span className='text-slate-700 font-semibold mb-1 block'>
                  Date de départ envisagée <span className='text-red-500'>*</span>
                </span>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-3.5 h-5 w-5 text-slate-400' />
                  <input
                    type='date'
                    value={profile.moveDate}
                    onChange={(e) => setProfile({ ...profile, moveDate: e.target.value })}
                    className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-slate-900'
                  />
                </div>
              </label>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <label className='block'>
                  <span className='text-slate-700 font-semibold mb-1 block'>
                    Motif principal <span className='text-red-500'>*</span>
                  </span>
                  <div className='relative'>
                    <Briefcase className='absolute left-3 top-3.5 h-5 w-5 text-slate-400' />
                    <select
                      value={profile.purpose}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          purpose: e.target.value as any,
                        })
                      }
                      className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-slate-900'
                    >
                      <option value='Travail'>Travail / Expatriation</option>
                      <option value='Etudes'>Etudes</option>
                      <option value='Retraite'>Retraite</option>
                      <option value='Digital Nomad'>Digital Nomad</option>
                    </select>
                    <ChevronDown className='absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none' />
                  </div>
                </label>

                <label className='block'>
                  <span className='text-slate-700 font-semibold mb-1 block'>
                    Statut <span className='text-red-500'>*</span>
                  </span>
                  <div className='relative'>
                    <Users className='absolute left-3 top-3.5 h-5 w-5 text-slate-400' />
                    <select
                      value={profile.status}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          status: e.target.value as any,
                        })
                      }
                      className='w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-slate-900'
                    >
                      <option value='Solo'>Solo</option>
                      <option value='Couple'>En couple</option>
                      <option value='Famille'>En famille</option>
                    </select>
                    <ChevronDown className='absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none' />
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Specific Needs */}
          {formStep === 3 && (
            <div className='space-y-6 animate-in slide-in-from-right duration-300'>
              <div>
                <span className='text-slate-700 font-semibold mb-3 block flex items-center gap-2'>
                  <HelpCircle className='h-5 w-5 text-green-600' />
                  Sur quels points avez-vous besoin d'aide ?
                </span>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {SPECIFIC_NEEDS_OPTIONS.map((option) => (
                    <div
                      key={option}
                      onClick={() => toggleNeed(option)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedNeeds.includes(option) ? "bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500" : "bg-white border-slate-200 hover:border-green-300 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedNeeds.includes(option) ? "bg-green-600 border-green-600" : "bg-white border-slate-300"
                        }`}
                      >
                        {selectedNeeds.includes(option) && <Check className='h-3 w-3 text-white' />}
                      </div>
                      <span className='text-sm font-medium'>{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className='block'>
                <span className='text-slate-700 font-semibold mb-1 block flex items-center gap-2'>
                  <Heart className='h-4 w-4 text-green-600' />
                  D'autres précisions pour votre roadmap ? (Facultatif)
                </span>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Ex: Je veux absolument vivre près de la mer, j'ai besoin d'un traitement médical spécifique, je veux créer mon entreprise..."
                  className='w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all min-h-[100px] bg-white text-slate-900 placeholder-slate-400'
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className='bg-slate-50 border-t border-slate-100 px-8 py-5 flex justify-between items-center rounded-b-2xl'>
          {formStep > 1 ? (
            <button onClick={handlePrevStep} className='text-slate-600 font-medium hover:text-green-600 flex items-center gap-2 px-2 py-1'>
              <ArrowLeft className='h-4 w-4' />
              Retour
            </button>
          ) : (
            <div></div> /* Spacer */
          )}

          {formStep < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={formStep === 1 && !profile.destinationCountry}
              className='bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-green-200'
            >
              Suivant
              <ArrowRight className='h-5 w-5' />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className='bg-gradient-to-r from-green-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-green-200 transform hover:-translate-y-0.5'
            >
              Générer ma Roadmap
              <Plane className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;
