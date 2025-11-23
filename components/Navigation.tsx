import { Briefcase, Globe2, Map, Menu, Users, X } from "lucide-react";
import React from "react";
import { AppView } from "../types";
//@ts-expect-error
import logo from "./../assets/svg/logo.svg";

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: AppView.HOME, label: "Accueil", icon: Globe2 },
    { id: AppView.ROADMAP, label: "Ma Feuille de Route", icon: Map },
    { id: AppView.DESTINATION, label: "Infos Destination", icon: Globe2 },
    { id: AppView.SERVICES, label: "Services & Partenaires", icon: Briefcase },
    { id: AppView.COMMUNITY, label: "Communauté", icon: Users },
  ];

  return (
    <nav className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center cursor-pointer' onClick={() => onChangeView(AppView.HOME)}>
            <img className='size-32' src={logo} alt='Casa Nova' />
          </div>

          {/* Desktop Menu */}
          <div className='hidden md:flex items-center space-x-8'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === item.id ? "text-green-600 bg-green-50" : "text-slate-600 hover:text-green-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className='h-4 w-4 mr-2' />
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button onClick={() => setIsOpen(!isOpen)} className='text-slate-600 hover:text-slate-900 p-2'>
              {isOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className='md:hidden bg-white border-t border-slate-100'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  currentView === item.id ? "text-green-600 bg-green-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className='flex items-center'>
                  <item.icon className='h-5 w-5 mr-3' />
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
