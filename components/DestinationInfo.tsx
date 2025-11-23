import { Coins, FileText, Loader2, MapPin, PartyPopper, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getDestinationInsights } from "../services/geminiService";
import { DestinationInsight } from "../types";

interface DestinationInfoProps {
  destination: string;
  onSelectDestination?: (destination: string) => void;
}

const POPULAR_DESTINATIONS = [
  { name: "Canada", image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Japon", image: "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Portugal", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Australie", image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Espagne", image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { name: "Singapour", image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

const DestinationInfo: React.FC<DestinationInfoProps> = ({ destination, onSelectDestination }) => {
  const [info, setInfo] = useState<DestinationInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) {
      setInfo(null);
      return;
    }

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await getDestinationInsights(destination);
        setInfo(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [destination]);

  if (!destination) {
    return (
      <div className='space-y-8'>
        <div className='text-center max-w-2xl mx-auto mb-12'>
          <h2 className='text-3xl font-bold text-slate-900 mb-4'>Explorez le monde</h2>
          <p className='text-lg text-slate-600'>Sélectionnez une destination populaire pour découvrir les informations essentielles avant votre départ.</p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {POPULAR_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => onSelectDestination && onSelectDestination(dest.name)}
              className='group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300'
            >
              <div className='absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10' />
              <img src={dest.image} alt={dest.name} className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500' />
              <div className='absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20'>
                <h3 className='text-white text-xl font-bold flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  {dest.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20'>
        <Loader2 className='h-10 w-10 text-green-600 animate-spin mb-4' />
        <p className='text-slate-600'>Récupération des informations sur {destination}...</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className='text-center py-12 text-slate-500'>
        <p>Impossible de charger les informations pour {destination}.</p>
        <button onClick={() => onSelectDestination && onSelectDestination("")} className='mt-4 text-green-600 hover:underline'>
          Retour aux destinations
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <button onClick={() => onSelectDestination && onSelectDestination("")} className='text-sm text-slate-500 hover:text-green-600 mb-4 flex items-center gap-1'>
        ← Toutes les destinations
      </button>

      <div className='relative h-80 w-full rounded-2xl overflow-hidden shadow-lg'>
        <img src={`https://picsum.photos/1200/600?random=${Math.floor(Math.random() * 100)}`} alt={destination} className='w-full h-full object-cover' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8'>
          <div>
            <h1 className='text-5xl font-bold text-white mb-2'>{destination}</h1>
            <p className='text-slate-200 text-lg max-w-3xl leading-relaxed shadow-black drop-shadow-md'>{info.overview}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-100 transition-colors'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 bg-green-100 rounded-xl'>
              <Coins className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>Coût de la vie</h3>
          </div>
          <p className='text-slate-600 leading-relaxed'>{info.costOfLiving}</p>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-100 transition-colors'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 bg-purple-100 rounded-xl'>
              <PartyPopper className='h-6 w-6 text-purple-600' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>Vie Culturelle</h3>
          </div>
          <p className='text-slate-600 leading-relaxed'>{info.cultureVibe}</p>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-100 transition-colors'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 bg-green-100 rounded-xl'>
              <Shield className='h-6 w-6 text-green-600' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>Sécurité</h3>
          </div>
          <p className='text-slate-600 leading-relaxed'>{info.safety}</p>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-green-100 transition-colors'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-3 bg-amber-100 rounded-xl'>
              <FileText className='h-6 w-6 text-amber-600' />
            </div>
            <h3 className='text-xl font-bold text-slate-900'>Astuce Administrative</h3>
          </div>
          <p className='text-slate-600 leading-relaxed'>{info.adminTips}</p>
        </div>
      </div>
    </div>
  );
};

export default DestinationInfo;
