import React from 'react';
import { Sparkles, Home, Car, Train, Bus, Plane, Anchor, Bike, Compass } from 'lucide-react';

interface CategoryPillsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const categories = [
    { id: 'all', label: 'Everything', icon: Sparkles },
    { id: 'stays', label: 'Luxury Stays', icon: Home },
    { id: 'transport', label: 'All Transport', icon: Car },
    { id: 'taxi', label: 'Cabs & Taxis', icon: Car },
    { id: 'rental', label: 'Car Rentals', icon: Car },
    { id: 'train', label: 'Metro & Rail', icon: Train },
    { id: 'bus', label: 'Express Buses', icon: Bus },
    { id: 'airport_transfer', label: 'Airport Shuttles', icon: Plane },
    { id: 'boat', label: 'Boat & Ferry', icon: Anchor },
    { id: 'bike', label: 'Smart E-Bikes', icon: Bike },
    { id: 'experiences', label: 'Experiences', icon: Compass },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-none border-b border-slate-200">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              isActive
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
