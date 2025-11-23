import { ArrowLeft, Calendar, Mail, MapPin, MessageCircle, Plus, Star, User, Users } from "lucide-react";
import React, { useState } from "react";
import { CommunityGroup } from "../types";

interface CommunityHubProps {
  destinationContext: string;
}

// MOCK DATA
const MOCK_GROUPS: CommunityGroup[] = [
  { id: "1", name: "Français à Montréal", members: 1240, topic: "Entraide générale", image: "https://picsum.photos/100/100?random=1" },
  { id: "2", name: "Tech Expats UK", members: 850, topic: "Carrière & Tech", image: "https://picsum.photos/100/100?random=2" },
  { id: "3", name: "Familles à Tokyo", members: 320, topic: "Scolarité & Vie de famille", image: "https://picsum.photos/100/100?random=3" },
  { id: "4", name: "Entrepreneurs à Lisbonne", members: 600, topic: "Business & Fiscalité", image: "https://picsum.photos/100/100?random=4" },
];

const MOCK_EVENTS = [
  { id: "e1", title: "Apéro Français à Montréal", date: "15 Oct 2023 • 18h00", location: "Le Plateau, Montréal", participants: 42 },
  { id: "e2", title: "Webinar: Comprendre le système de santé", date: "20 Oct 2023 • 12h00 (En ligne)", location: "Zoom", participants: 150 },
  { id: "e3", title: "Randonnée de bienvenue", date: "22 Oct 2023 • 09h00", location: "Mont Royal", participants: 25 },
];

const MOCK_AMBASSADORS = [
  {
    id: "a1",
    name: "Sophie Martin",
    role: "Installée depuis 3 ans",
    location: "Montréal",
    bio: "Spécialiste des démarches PVT et de la recherche d'emploi.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "a2",
    name: "Thomas Dubois",
    role: "Entrepreneur",
    location: "Lisbonne",
    bio: "Je peux vous aider sur la création d'entreprise et la fiscalité.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "a3",
    name: "Yuki Tanaka",
    role: "Étudiante",
    location: "Tokyo",
    bio: "Je partage mes astuces pour trouver un logement étudiant pas cher.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const MOCK_TOPICS = [
  { id: 1, title: "Conseils pour trouver un appartement à distance ?", author: "Marie L.", replies: 12, time: "2h" },
  { id: 2, title: "Banques acceptant les non-résidents", author: "Pierre D.", replies: 8, time: "5h" },
  { id: 3, title: "Meilleurs quartiers pour une famille ?", author: "Sophie M.", replies: 24, time: "1j" },
];

const CommunityHub: React.FC<CommunityHubProps> = ({ destinationContext }) => {
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [activeTab, setActiveTab] = useState<"discussions" | "events" | "ambassadors">("discussions");

  // Group Selection View (Main Page)
  if (!selectedGroup) {
    return (
      <div className='max-w-6xl mx-auto'>
        {/* Title Section */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-slate-900'>Rejoignez une communauté</h2>
          <p className='mt-2 text-slate-600'>Échangez avec des expatriés qui partagent votre destination ou vos intérêts.</p>
        </div>

        {/* Groups Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {MOCK_GROUPS.map((group) => (
            <div key={group.id} className='bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full'>
              <div className='h-32 bg-green-600/10 relative'>
                <img src={`https://picsum.photos/400/200?random=${group.id}`} alt='' className='w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity' />
                <div className='absolute -bottom-6 left-6'>
                  <img src={group.image} alt={group.name} className='h-16 w-16 rounded-xl border-4 border-white shadow-md object-cover' />
                </div>
              </div>
              <div className='pt-8 px-6 pb-6 flex-1 flex flex-col'>
                <div className='flex-1'>
                  <h3 className='text-xl font-bold text-slate-900'>{group.name}</h3>
                  <p className='text-green-600 text-sm font-medium mb-2'>{group.topic}</p>
                  <div className='flex items-center text-slate-500 text-sm mb-4'>
                    <Users className='h-4 w-4 mr-1' />
                    {group.members} membres
                  </div>
                </div>
                <button onClick={() => setSelectedGroup(group)} className='w-full py-2.5 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors mt-auto'>
                  Rejoindre
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group Detail View (Sub-page)
  return (
    <div className='max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300'>
      <button onClick={() => setSelectedGroup(null)} className='flex items-center text-slate-500 hover:text-green-600 mb-6 transition-colors font-medium'>
        <ArrowLeft className='h-4 w-4 mr-2' />
        Retour aux communautés
      </button>

      {/* Header */}
      <div className='bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6'>
        <img src={selectedGroup.image} alt={selectedGroup.name} className='h-24 w-24 rounded-2xl object-cover shadow-md' />
        <div className='flex-1'>
          <h1 className='text-3xl font-bold text-slate-900'>{selectedGroup.name}</h1>
          <p className='text-slate-500 mt-1 flex items-center gap-4'>
            <span className='bg-green-50 text-green-700 px-2 py-0.5 rounded text-sm font-medium'>{selectedGroup.topic}</span>
            <span className='flex items-center gap-1 text-sm'>
              <Users className='h-4 w-4' /> {selectedGroup.members} membres
            </span>
          </p>
        </div>
        <button className='px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm'>Quitter le groupe</button>
      </div>

      {/* Tabs */}
      <div className='border-b border-slate-200 mb-8'>
        <div className='flex gap-8 overflow-x-auto'>
          {[
            { id: "discussions", label: "Discussions", icon: MessageCircle },
            { id: "events", label: "Événements", icon: Calendar },
            { id: "ambassadors", label: "Ambassadeurs", icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? "border-green-600 text-green-600" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <tab.icon className='h-4 w-4' />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className='min-h-[400px]'>
        {activeTab === "discussions" && (
          <div className='space-y-6 animate-in fade-in duration-200'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-bold text-slate-900'>Sujets à la une</h3>
              <button className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors'>
                <Plus className='h-4 w-4' />
                Nouveau sujet
              </button>
            </div>

            <div className='space-y-4'>
              {MOCK_TOPICS.map((topic) => (
                <div key={topic.id} className='bg-white p-4 rounded-xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all cursor-pointer group'>
                  <div className='flex items-start gap-4'>
                    <div className='bg-green-50 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors'>
                      <MessageCircle className='h-5 w-5' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-base font-bold text-slate-900 mb-1 group-hover:text-green-600 transition-colors'>{topic.title}</h4>
                      <div className='flex items-center gap-2 sm:gap-4 text-xs text-slate-500 flex-wrap'>
                        <span className='font-medium text-slate-700'>Par {topic.author}</span>
                        <span className='hidden sm:inline'>•</span>
                        <span>Il y a {topic.time}</span>
                        <span className='hidden sm:inline'>•</span>
                        <span className='text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full'>{topic.replies} réponses</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className='space-y-6 animate-in fade-in duration-200'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-bold text-slate-900'>Événements à venir</h3>
              <button className='text-green-600 text-sm font-medium hover:underline'>Voir le calendrier complet</button>
            </div>
            <div className='grid gap-4'>
              {MOCK_EVENTS.map((evt) => (
                <div
                  key={evt.id}
                  className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-green-200 transition-colors'
                >
                  <div className='flex items-start gap-4'>
                    <div className='bg-green-50 rounded-lg p-3 text-center min-w-[70px] flex-shrink-0'>
                      <span className='block text-green-600 font-bold text-xl'>{evt.date.split(" ")[0]}</span>
                      <span className='block text-green-400 text-xs uppercase font-bold'>{evt.date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <h4 className='text-lg font-bold text-slate-900'>{evt.title}</h4>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-500 mt-1'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' /> {evt.date}
                        </span>
                        <span className='flex items-center gap-1'>
                          <MapPin className='h-3 w-3' /> {evt.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className='px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all whitespace-nowrap self-start md:self-center w-full md:w-auto'>
                    Je participe
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ambassadors" && (
          <div className='space-y-6 animate-in fade-in duration-200'>
            <div className='bg-gradient-to-r from-green-50 to-purple-50 p-6 rounded-xl border border-green-100 mb-6'>
              <div className='flex items-start gap-4'>
                <div className='p-2 bg-white rounded-lg shadow-sm text-green-600'>
                  <User className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='text-lg font-bold text-green-900 mb-1'>Besoin d'un parrain ?</h3>
                  <p className='text-green-700 text-sm'>
                    Les ambassadeurs sont des membres expérimentés prêts à répondre à vos questions spécifiques ou à vous rencontrer pour faciliter votre arrivée.
                  </p>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {MOCK_AMBASSADORS.map((amb) => (
                <div key={amb.id} className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-shadow'>
                  <img src={amb.avatar} alt={amb.name} className='h-16 w-16 rounded-full object-cover border-2 border-green-50 flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-start mb-1'>
                      <h4 className='font-bold text-slate-900 truncate'>{amb.name}</h4>
                      <div className='flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0'>
                        <Star className='h-3 w-3 fill-current' /> 4.9
                      </div>
                    </div>
                    <p className='text-xs text-green-600 font-medium mb-2 uppercase tracking-wide'>{amb.role}</p>
                    <p className='text-slate-600 text-sm mb-4 line-clamp-2 italic'>"{amb.bio}"</p>
                    <button className='w-full py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2'>
                      <Mail className='h-4 w-4' />
                      Contacter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHub;
