import React from 'react';
import {
  Plane,
  BarChart3,
  Settings,
  Users,
  Layers,
  GitFork,
  Cpu,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { Flight } from '../types';

export type TabType =
  | 'dashboard'
  | 'flight-setup'
  | 'booking'
  | 'partitioning'
  | 'btree'
  | 'python'
  | 'overbooking'
  | 'code';

interface NavbarProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  flight: Flight;
  confirmedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  flight,
  confirmedCount,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: BarChart3, color: 'text-blue-600' },
    { id: 'flight-setup' as TabType, label: 'Flights Changing', icon: Plane, color: 'text-indigo-600' },
    { id: 'booking' as TabType, label: 'Passenger Booking (OOPJ)', icon: Users, color: 'text-sky-600' },
    { id: 'partitioning' as TabType, label: 'Fare Partitioning (DMGT)', icon: Layers, color: 'text-purple-600' },
    { id: 'btree' as TabType, label: 'B-Tree Index (ADSA)', icon: GitFork, color: 'text-amber-600' },
    { id: 'python' as TabType, label: 'Python Prediction & CSV', icon: Cpu, color: 'text-emerald-600' },
    { id: 'overbooking' as TabType, label: 'Safe Overbooking', icon: ShieldCheck, color: 'text-teal-600' },
    { id: 'code' as TabType, label: 'Academic Source & Viva', icon: Code2, color: 'text-slate-600' },
  ];

  const occupancyPercent = Math.min(100, Math.round((confirmedCount / flight.aircraftCapacity) * 100));

  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      {/* Top Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 bg-linear-to-br from-blue-600 via-indigo-600 to-sky-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Plane className="h-5 w-5 rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-neutral-900 text-lg tracking-tight bg-linear-to-r from-neutral-900 via-blue-950 to-indigo-900 bg-clip-text">
                  AIRLINE OVERBOOKING MANAGER
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                  Academic Prototype
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-medium hidden sm:flex items-center space-x-2">
                <span className="text-purple-600 font-semibold">DMGT</span>
                <span>•</span>
                <span className="text-amber-600 font-semibold">ADSA</span>
                <span>•</span>
                <span className="text-sky-600 font-semibold">OOPJ</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">Python</span>
              </p>
            </div>
          </div>

          {/* Quick Active Flight Status Pill */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setCurrentTab('flight-setup')}
              title="Click for Flights Changing"
              className="bg-linear-to-r from-neutral-50 to-blue-50/50 border border-blue-100/80 hover:border-blue-300 rounded-xl px-3.5 py-1.5 hidden sm:flex items-center space-x-3 shadow-2xs cursor-pointer transition-all text-left"
            >
              <div className="text-right">
                <div className="text-xs font-bold text-neutral-900 flex items-center justify-end space-x-1.5">
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded font-mono text-[10px]">
                    {flight.flightNumber}
                  </span>
                  <span>
                    {flight.source} → <span className="text-sm mr-0.5">{flight.countryFlag}</span>{flight.destination}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center justify-end space-x-2">
                  <span className="font-mono text-neutral-700 font-bold">{flight.currencyCode} ({flight.currencySymbol})</span>
                  <span>•</span>
                  <span>Capacity: <strong className="text-neutral-800">{confirmedCount}</strong>/{flight.aircraftCapacity}</span>
                  <span className="text-neutral-400">({occupancyPercent}%)</span>
                </div>
              </div>
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${confirmedCount >= flight.aircraftCapacity ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${confirmedCount >= flight.aircraftCapacity ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar with colorful active indicators */}
      <div className="border-t border-neutral-100 bg-neutral-50/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1.5 py-2 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-300' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
