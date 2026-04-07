import React from 'react';
import { Search, HelpCircle, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  return (
    <header classname="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 bg-white shrink-0">
      <div classname="flex items-center gap-4 flex-1 max-w-2xl">
        <button onclick="{onMenuClick}" classname="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors md:hidden">
          <menu classname="w-6 h-6"/>
        </button>
        <div classname="relative group flex-1">
          <div classname="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <search classname="h-5 w-5 text-gray-400 group-focus-within:text-gray-600"/>
          </div>
          <input type="text" classname="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-full leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-transparent focus:ring-0 sm:text-sm transition-colors" placeholder="Search in Drive"/>
        </div>
      </div>
      <div classname="flex items-center gap-2 ml-4">
        <button classname="hidden sm:block p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <helpcircle classname="w-5 h-5"/>
        </button>
        <button classname="hidden sm:block p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <settings classname="w-5 h-5"/>
        </button>
        <div onclick="{onProfileClick}" classname="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium ml-2 shrink-0 cursor-pointer hover:bg-blue-700 transition-colors" title="Enter Promo Code">
          I
        </div>
      </div>
    </header>
  );
}


