import React, { useState } from 'react';
import { Plane, Save, RotateCcw, Check, Compass, Banknote, Globe2 } from 'lucide-react';
import { DestinationPreset, Flight } from '../types';
import { destinationPresets, getDestinationPreset } from '../data/initialData';

interface FlightSetupTabProps {
  flight: Flight;
  onUpdateFlight: (newFlight: Flight) => void;
  onResetToDemo: () => void;
}

export const FlightSetupTab: React.FC<FlightSetupTabProps> = ({
  flight,
  onUpdateFlight,
  onResetToDemo,
}) => {
  const [formData, setFormData] = useState<Flight>({ ...flight });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFlight({
      ...formData,
      aircraftCapacity: Number(formData.aircraftCapacity),
      maxAllowedOverbooking: Number(formData.maxAllowedOverbooking),
      economyPrice: Number(formData.economyPrice),
      premiumPrice: Number(formData.premiumPrice),
      businessPrice: Number(formData.businessPrice),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleDestinationPresetSelect = (preset: DestinationPreset) => {
    setFormData(prev => ({
      ...prev,
      destination: preset.destination,
      countryFlag: preset.countryFlag,
      currencyCode: preset.currencyCode,
      currencySymbol: preset.currencySymbol,
      economyPrice: preset.economyPrice,
      premiumPrice: preset.premiumPrice,
      businessPrice: preset.businessPrice,
    }));
  };

  const handleDestinationChange = (destVal: string) => {
    const matched = getDestinationPreset(destVal);
    setFormData(prev => ({
      ...prev,
      destination: destVal,
      countryFlag: matched.countryFlag,
      currencyCode: matched.currencyCode,
      currencySymbol: matched.currencySymbol,
      economyPrice: matched.economyPrice,
      premiumPrice: matched.premiumPrice,
      businessPrice: matched.businessPrice,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-white/10 backdrop-blur-md text-blue-300 rounded-xl border border-white/15">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Workflow Step 1 — Flights Changing
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>Flights Changing & Destination Pricing</span>
              <span className="text-2xl ml-2">{formData.countryFlag}</span>
            </h1>
          </div>
        </div>
        <p className="text-xs text-neutral-300">
          Change flight parameters, route destinations, dynamic country flags (🇮🇳 India, 🇦🇪 UAE, 🇸🇬 Singapore, 🇯🇵 Japan, 🇫🇷 France, 🇺🇸 USA, 🇬🇧 UK), and tiered class pricing.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        {savedNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Flight parameters and destination currency pricing successfully updated!</span>
          </div>
        )}

        {/* Destination Cards Grid with Flag + Name + Price */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Globe2 className="h-4 w-4 text-blue-600" />
              <span>Flights Changing & Route Selection (Flag + Destination + Price)</span>
            </label>
            <span className="text-xs text-neutral-500 font-mono">
              Selected: {formData.countryFlag} {formData.destination}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {destinationPresets.map(preset => {
              const isSelected = formData.destination.includes(preset.airportCode);
              return (
                <button
                  key={preset.airportCode}
                  type="button"
                  onClick={() => handleDestinationPresetSelect(preset)}
                  className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-200 shadow-xs'
                      : 'bg-neutral-50/70 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-3xl shadow-2xs leading-none">{preset.countryFlag}</span>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-700 flex items-center space-x-1.5">
                          <span>{preset.destination}</span>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center space-x-1.5">
                          <span>{preset.country}</span>
                          <span>•</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {preset.availableSeats || 18} Seats Avlbl
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-200/70 text-neutral-700 font-mono">
                      {preset.currencyCode}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-200/60 grid grid-cols-3 gap-1 text-center">
                    <div className="bg-sky-50/80 rounded-md py-1 px-1">
                      <div className="text-[9px] font-semibold text-sky-800 uppercase">Eco</div>
                      <div className="text-[11px] font-bold text-sky-950 font-mono">
                        {preset.currencySymbol}{preset.economyPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-purple-50/80 rounded-md py-1 px-1">
                      <div className="text-[9px] font-semibold text-purple-800 uppercase">Prem</div>
                      <div className="text-[11px] font-bold text-purple-950 font-mono">
                        {preset.currencySymbol}{preset.premiumPrice.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-emerald-50/80 rounded-md py-1 px-1">
                      <div className="text-[9px] font-semibold text-emerald-800 uppercase">Biz</div>
                      <div className="text-[11px] font-bold text-emerald-950 font-mono">
                        {preset.currencySymbol}{preset.businessPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flight Number */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Flight Number
              </label>
              <input
                type="text"
                required
                value={formData.flightNumber}
                onChange={e => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. AI-204"
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Flight Date */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Flight Date
              </label>
              <input
                type="date"
                required
                value={formData.flightDate}
                onChange={e => setFormData({ ...formData, flightDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Origin / Departure Airport
              </label>
              <input
                type="text"
                required
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g. New York (JFK)"
                className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Destination with Dynamic Flag detection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Destination Airport</span>
                <span className="text-sm">{formData.countryFlag}</span>
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={e => handleDestinationChange(e.target.value)}
                placeholder="e.g. London (LHR), Tokyo (NRT), Dubai (DXB)..."
                className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
              />
            </div>

            {/* Aircraft Capacity */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Physical Capacity (Seats)
              </label>
              <input
                type="number"
                min="10"
                max="850"
                required
                value={formData.aircraftCapacity}
                onChange={e => setFormData({ ...formData, aircraftCapacity: Math.max(1, Number(e.target.value)) })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Maximum Allowed Overbooking */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Maximum Allowed Overbooking (Seats)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.maxAllowedOverbooking}
                onChange={e => setFormData({ ...formData, maxAllowedOverbooking: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Destination Currency & Country Flag Details Section */}
          <div className="p-5 bg-linear-to-br from-neutral-50 to-blue-50/40 rounded-2xl border border-blue-200/70 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200/50 pb-2.5">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center space-x-2">
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span>Destination Currency & International Country Flag</span>
              </span>
              <span className="text-2xl">{formData.countryFlag}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Destination Country Flag (Emoji/Symbol)
                </label>
                <input
                  type="text"
                  required
                  value={formData.countryFlag}
                  onChange={e => setFormData({ ...formData, countryFlag: e.target.value })}
                  placeholder="e.g. 🇮🇳, 🇦🇪, 🇸🇬, 🇯🇵, 🇫🇷, 🇺🇸, 🇬🇧"
                  className="w-full px-3 py-1.5 text-center text-lg bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Currency Code (ISO)
                </label>
                <input
                  type="text"
                  required
                  value={formData.currencyCode}
                  onChange={e => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. GBP, EUR, JPY, INR, AED"
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  required
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="e.g. £, €, ¥, $, ₹, د.إ"
                  className="w-full px-3 py-1.5 text-xs font-bold text-center bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Class Pricing per Destination */}
            <div className="pt-2 border-t border-blue-200/50">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Ticket Price by Fare Class ({formData.currencyCode} {formData.currencySymbol})
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl">
                  <span className="text-[11px] font-bold text-sky-900 block mb-1">
                    Economy Class Price
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-sky-900 text-sm">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.economyPrice}
                      onChange={e => setFormData({ ...formData, economyPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 text-xs font-bold font-mono bg-white border border-sky-300 rounded-lg text-sky-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl">
                  <span className="text-[11px] font-bold text-purple-900 block mb-1">
                    Premium Class Price
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-purple-900 text-sm">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.premiumPrice}
                      onChange={e => setFormData({ ...formData, premiumPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 text-xs font-bold font-mono bg-white border border-purple-300 rounded-lg text-purple-950 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                    Business Class Price
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-emerald-900 text-sm">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.businessPrice}
                      onChange={e => setFormData({ ...formData, businessPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1 text-xs font-bold font-mono bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResetToDemo}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to London LHR (AI-204)</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Apply Flight Changes & Update Pricing</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preset Academic Scenarios with Dynamic Flags & Prices */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
          <Compass className="h-4 w-4 text-blue-600" />
          <span>Quick Flights Changing Scenarios (Flag + Destination + Price)</span>
        </h2>
        <p className="text-xs text-neutral-500">
          Switch flight configurations instantly to observe how capacity and overbooking limits recalculate:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'LHR')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇬🇧</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-700">
                London (LHR) • From £480
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">JFK → LHR • Cap: 100 • Max Overbk: 15</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'CDG')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇫🇷</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-purple-700">
                Paris (CDG) • From €420
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">LHR → CDG • Cap: 150 • Max Overbk: 20</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'DXB')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇦🇪</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700">
                Dubai (DXB) • From د.إ 2,200
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">JFK → DXB • Cap: 120 • Max Overbk: 18</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'DEL')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇮🇳</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-amber-700">
                New Delhi (DEL) • From ₹38,000
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">LHR → DEL • Cap: 100 • Max Overbk: 15</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'NRT')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-red-500 hover:bg-red-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇯🇵</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-red-700">
                Tokyo (NRT) • From ¥85,000
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">SFO → NRT • Cap: 100 • Max Overbk: 15</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDestinationPresetSelect(destinationPresets.find(p => p.airportCode === 'SIN')!)
            }
            className="text-left p-4 rounded-xl border border-neutral-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇸🇬</span>
              <div className="text-xs font-bold text-neutral-900 group-hover:text-teal-700">
                Singapore (SIN) • From S$650
              </div>
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">LHR → SIN • Cap: 100 • Max Overbk: 15</div>
          </button>
        </div>
      </div>
    </div>
  );
};
