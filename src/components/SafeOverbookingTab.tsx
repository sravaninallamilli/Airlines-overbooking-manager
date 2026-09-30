import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Plane,
  Info,
  TrendingDown,
  Sparkles,
  Users,
  Coins,
  Banknote,
} from 'lucide-react';
import { Flight, OverbookingMetrics, PythonPredictionResult } from '../types';

interface SafeOverbookingTabProps {
  metrics: OverbookingMetrics;
  prediction: PythonPredictionResult;
  safetyFactor: number;
  onSafetyFactorChange: (val: number) => void;
  flight: Flight;
}

export const SafeOverbookingTab: React.FC<SafeOverbookingTabProps> = ({
  metrics,
  prediction,
  safetyFactor,
  onSafetyFactorChange,
  flight,
}) => {
  const additionalRevenue = metrics.recommendedAdditionalBookings * flight.economyPrice;
  const noShowRevenueRisk = Math.round(metrics.expectedNoShows * flight.economyPrice);

  return (
    <div className="space-y-6">
      {/* Top Banner with Flag & Currency */}
      <div className="bg-linear-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md text-teal-300 rounded-xl border border-white/15">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Java Safe Overbooking Service
                </span>
                <span className="text-lg">{flight.countryFlag}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Safe Overbooking Limit & Revenue Economics</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/15 text-teal-200">
                  {flight.currencyCode} ({flight.currencySymbol})
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-xs backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">
              Safety Tolerance: Bumping Risk ≤ 5.0%
            </span>
          </div>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-xl p-4 flex items-start space-x-3 text-neutral-100">
          <Info className="h-5 w-5 text-teal-300 shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-200 leading-relaxed">
            <strong>Passenger Safety Guarantee:</strong> The airline industry prioritizes passenger
            safety and avoids excessive overbooking to avoid civil bumping fines, hotel
            compensations, and customer dissatisfaction. Java incorporates Python's estimated
            no-show rate ({prediction.percentageString}) alongside an operational safety buffer.
          </p>
        </div>
      </div>

      {/* The 5 Key Highlighted Values in Rich Colorful Cards */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Recommended Overbooking Limit & Bounds
            </h2>
            <p className="text-xs text-neutral-500">
              Operational recommendation for {flight.destination} ({flight.countryFlag} {flight.currencyCode})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-neutral-500">Safety Status:</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{metrics.riskTier} ({metrics.bumpingRiskPercentage}% Bumping Probability)</span>
            </span>
          </div>
        </div>

        {/* The 5 Highlighted Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Aircraft Capacity */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-white to-blue-50/60 border border-blue-200/80 shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            <span className="text-[11px] font-bold text-blue-900 uppercase block tracking-wider">
              Aircraft Capacity
            </span>
            <div className="text-3xl font-black text-blue-950 mt-2 font-mono">
              {metrics.aircraftCapacity}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Physical seats</span>
          </div>

          {/* 2. Confirmed Bookings */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-white to-purple-50/60 border border-purple-200/80 shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600" />
            <span className="text-[11px] font-bold text-purple-900 uppercase block tracking-wider">
              Confirmed Bookings
            </span>
            <div className="text-3xl font-black text-purple-950 mt-2 font-mono">
              {metrics.confirmedBookings}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Active reservations</span>
          </div>

          {/* 3. Estimated No-Shows */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-white to-amber-50/60 border border-amber-200/80 shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <span className="text-[11px] font-bold text-amber-900 uppercase block tracking-wider">
              Estimated No-Shows
            </span>
            <div className="text-3xl font-black text-amber-950 mt-2 font-mono">
              {Math.round(metrics.expectedNoShows)}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block font-medium">
              ~{metrics.expectedNoShows} ({prediction.percentageString})
            </span>
          </div>

          {/* 4. Recommended Additional Bookings */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-white to-teal-50/60 border border-teal-200/80 shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />
            <span className="text-[11px] font-bold text-teal-900 uppercase block tracking-wider">
              Recommended Overbooking
            </span>
            <div className="text-3xl font-black text-teal-950 mt-2 font-mono">
              +{metrics.recommendedAdditionalBookings}
            </div>
            <span className="text-[11px] text-neutral-500 mt-1 block font-medium">Extra safe tickets</span>
          </div>

          {/* 5. Safe Overbooking Limit / Maximum Safe Bookings */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-linear-to-br from-neutral-900 via-indigo-950 to-neutral-950 text-white border border-indigo-900 shadow-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-400 to-teal-400" />
            <span className="text-[11px] font-bold text-teal-300 uppercase block tracking-wider">
              Maximum Safe Bookings
            </span>
            <div className="text-3xl font-black text-white mt-2 font-mono">
              {metrics.maxSafeBookings}
            </div>
            <span className="text-[11px] text-neutral-300 mt-1 block font-medium">
              Capacity ({metrics.aircraftCapacity}) + Buffer (+{metrics.recommendedAdditionalBookings})
            </span>
          </div>
        </div>

        {/* Economic Revenue Impact Card */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50/80 via-teal-50/60 to-blue-50/60 border border-emerald-300/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-emerald-950">
                Overbooking Financial Yield ({flight.currencyCode} {flight.currencySymbol})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
              Base Economy Fare: {flight.currencySymbol}{flight.economyPrice.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="p-3 bg-white rounded-xl border border-emerald-200">
              <span className="text-neutral-500 block mb-0.5">Incremental Revenue from Safe Overbooking:</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                +{flight.currencySymbol}{additionalRevenue.toLocaleString()} {flight.currencyCode}
              </div>
              <span className="text-[11px] text-neutral-400">
                ({metrics.recommendedAdditionalBookings} extra confirmed tickets @ {flight.currencySymbol}{flight.economyPrice.toLocaleString()})
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <span className="text-neutral-500 block mb-0.5">Protected Revenue from No-Show Prevention:</span>
              <div className="text-xl font-black text-amber-700 font-mono">
                ~{flight.currencySymbol}{noShowRevenueRisk.toLocaleString()} {flight.currencyCode}
              </div>
              <span className="text-[11px] text-neutral-400">
                (Mitigates perishable seat losses from ~{metrics.expectedNoShows} expected no-shows)
              </span>
            </div>
          </div>
        </div>

        {/* Safety Confidence Slider */}
        <div className="p-5 rounded-2xl bg-linear-to-r from-neutral-50 to-blue-50/30 border border-blue-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              <label className="text-xs font-bold text-neutral-900">
                Safety Buffer Factor (Gamma Parameter): <span className="text-blue-700 font-mono text-sm">{Math.round(safetyFactor * 100)}%</span>
              </label>
            </div>
            <span className="text-xs text-neutral-600 font-mono">
              Formula: floor(Expected No-Shows [{metrics.expectedNoShows}] × {safetyFactor}) = <strong>+{metrics.recommendedAdditionalBookings}</strong>
            </span>
          </div>

          <input
            type="range"
            min="0.40"
            max="0.85"
            step="0.05"
            value={safetyFactor}
            onChange={e => onSafetyFactorChange(Number(e.target.value))}
            className="w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 font-medium">
            <span>40% (Ultra-Conservative)</span>
            <span className="font-bold text-blue-700">65% (Recommended Default)</span>
            <span>85% (Aggressive Buffer)</span>
          </div>
        </div>
      </div>

      {/* Mathematical Audit & Protection Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Java Overbooking Service Execution Pipeline</span>
          </h3>

          <div className="space-y-2 text-xs font-mono text-neutral-800">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between">
              <span>1. Aircraft Physical Capacity C</span>
              <strong className="text-blue-700">{metrics.aircraftCapacity}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between">
              <span>2. Current Confirmed Bookings N</span>
              <strong className="text-purple-700">{metrics.confirmedBookings}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between">
              <span>3. Python No-Show Probability p</span>
              <strong className="text-amber-700">{prediction.percentageString}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex justify-between">
              <span>4. Expected No-Shows E[NS] = N × p</span>
              <strong className="text-neutral-900">~{metrics.expectedNoShows}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 flex justify-between text-teal-900 font-bold">
              <span>5. Recommended Extra = floor(E[NS] × {safetyFactor})</span>
              <span>+{metrics.recommendedAdditionalBookings}</span>
            </div>
            <div className="p-3 rounded-xl bg-linear-to-r from-neutral-900 to-indigo-950 text-white font-bold flex justify-between">
              <span>6. Maximum Safe Bookings = C + Buffer</span>
              <span className="text-teal-300 text-sm font-black">{metrics.maxSafeBookings} seats</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2.5 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Why Avoid Excessive Overbooking?</span>
          </h3>

          <div className="space-y-3 text-xs text-neutral-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-linear-to-r from-red-50/60 to-amber-50/40 border border-amber-200/80 space-y-1">
              <span className="font-bold text-amber-950 block">
                1. Mandatory Denied Boarding Compensation (IDB)
              </span>
              <p>
                Civil aviation regulators mandate cash compensation of up to 400% of the ticket
                fare (up to {flight.currencySymbol}{Math.round(flight.economyPrice * 3).toLocaleString()} in destination jurisdiction)
                plus re-routing and hotel accommodation costs if passengers are involuntarily bumped.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-linear-to-r from-purple-50/60 to-indigo-50/40 border border-purple-200/80 space-y-1">
              <span className="font-bold text-purple-950 block">
                2. DMGT Fare Class Protection Policy
              </span>
              <p>
                In the rare event of cluster show-ups, the airline protects high-yield Business
                ({flight.currencySymbol}{flight.businessPrice.toLocaleString()}) and Premium
                ({flight.currencySymbol}{flight.premiumPrice.toLocaleString()}) passengers first,
                using the Economy set for voluntary incentive bidding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
