import React, { useState } from "react";
import "./app.css";
import CommunityHub from "./components/CommunityHub";
import DestinationInfo from "./components/DestinationInfo";
import FloatingAssistant from "./components/FloatingAssistant";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import RoadmapGenerator from "./components/RoadmapGenerator";
import ServicesDirectory from "./components/ServicesDirectory";
import { AppView, RoadmapStep, UserProfile } from "./types";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // State lifted up for persistence
  const [destinationContext, setDestinationContext] = useState<string>("");
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    originCountry: "France",
    destinationCountry: "",
    destinationCity: "",
    moveDate: "",
    status: "Solo",
    purpose: "Travail",
    specificInterests: "",
  });

  // Specific state for services navigation
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null);

  // NEW: Specific state for Destination Info view to keep it independent from Roadmap
  const [infoViewDestination, setInfoViewDestination] = useState<string>("");

  const handleRoadmapGenerated = (destination: string) => {
    setDestinationContext(destination);
  };

  const handleFindPartner = (category: string) => {
    setSelectedServiceCategory(category);
    setCurrentView(AppView.SERVICES);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
          <Hero
            onStart={() => setCurrentView(AppView.ROADMAP)}
            onExplore={() => {
              setInfoViewDestination(""); // Ensure we start with the list
              setCurrentView(AppView.DESTINATION);
            }}
          />
        );
      case AppView.ROADMAP:
        return <RoadmapGenerator profile={profile} setProfile={setProfile} roadmap={roadmap} setRoadmap={setRoadmap} onRoadmapGenerated={handleRoadmapGenerated} onFindPartner={handleFindPartner} />;
      case AppView.DESTINATION:
        return (
          <DestinationInfo
            destination={infoViewDestination}
            onSelectDestination={(dest) => {
              setInfoViewDestination(dest);
              // We update context for the assistant, but we DO NOT update the roadmap profile
              // to allow independent browsing.
              if (dest) setDestinationContext(dest);
            }}
          />
        );
      case AppView.COMMUNITY:
        return <CommunityHub destinationContext={destinationContext} />;
      case AppView.SERVICES:
        return <ServicesDirectory initialCategory={selectedServiceCategory} />;
      default:
        return (
          <Hero
            onStart={() => setCurrentView(AppView.ROADMAP)}
            onExplore={() => {
              setInfoViewDestination("");
              setCurrentView(AppView.DESTINATION);
            }}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 relative'>
      <Navigation
        currentView={currentView}
        onChangeView={(view) => {
          // Reset specific service filter when manually clicking nav
          if (view !== AppView.SERVICES) setSelectedServiceCategory(null);

          // Always reset Destination Info view to list when clicking the menu item
          // This ensures "Cet item doit toujours afficher les encarts des destinations"
          if (view === AppView.DESTINATION) setInfoViewDestination("");

          setCurrentView(view);
        }}
      />
      <main className='py-6 px-4 sm:px-6 lg:px-8'>{renderContent()}</main>

      <FloatingAssistant destinationContext={destinationContext} />

      {/* Footer */}
      <footer className='bg-white border-t border-slate-200 mt-12'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <p className='text-center text-sm text-slate-500'>&copy; 2024 Casa Nova. Startup Weekend Nantes. Fait avec ❤️ pour les citoyens du monde.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
