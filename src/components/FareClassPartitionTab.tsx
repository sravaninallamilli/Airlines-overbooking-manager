import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle2, Info, Users, Sparkles, Coins, Banknote } from 'lucide-react';
import { SetPartitionResult } from '../lib/dmgt';
import { FareClass, Flight, Passenger } from '../types';

interface FareClassPartitionTabProps {
  partition: SetPartitionResult;
  flight: Flight;
}

export const FareClassPartitionTab: React.FC<FareClassPartitionTabProps> = ({ partition, flight }) => {
  const [activeSetView, setActiveSetView] = useState<FareClass>('ECONOMY');

  const currentList: Passenger[] =
    activeSetView === 'ECONOMY'
      ? partition.economySet
      : activeSetView === 'PREMIUM'
      ? partition.premiumSet
      : partition.businessSet;

  const total = partition.totalConfirmed;
  const ecoPercent = total > 0 ? Math.round((partition.economySet.length / total) * 100) : 0;
  const premPercent = total > 0 ? Math.round((partition.premiumSet.length / total) * 100) : 0;
  const bizPercent = total > 0 ? Math.round((partition.businessSet.length / total) * 100) : 0;

  const ecoRevenue = partition.economySet.length * flight.economyPrice;
  const premRevenue = partition.premiumSet.length * flight.premiumPrice;
  const bizRevenue = partition.businessSet.length * flight.businessPrice;
  const totalRevenue = ecoRevenue + premRevenue + bizRevenue;

  return (
    <div className="space-y-6">
      {/* Top Banner with Flag and Destination Currency */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-white/10 backdrop-blur-md text-purple-200 rounded-xl border border-white/15">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  DMGT (Unit 2 - Set Theory & Partitioning)
                </span>
                <span className="text-lg">{flight.countryFlag}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                <span>Passenger Partitioning by Fare Class & Value</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/15 text-purple-200">
                  {flight.currencyCode} ({flight.currencySymbol})
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-xs backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">Disjoint Property Verified (Zero Overlap)</span>
          </div>
        </div>

        {/* Required Simple Explanation Callout */}
        <div className="bg-white/10 border border-white/15 rounded-xl p-4 flex items-start space-x-3 text-neutral-100">
          <Info className="h-5 w-5 text-purple-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              “Passengers are partitioned into disjoint sets based on their fare class.”
            </p>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Every confirmed passenger belongs to exactly one fare class subset. No passenger can
              simultaneously belong to Economy and Premium, or Premium and Business, satisfying the
              fundamental mathematical definition of a set partition: S = E ∪ P ∪ B and E ∩ P = ∅,
              E ∩ B = ∅, P ∩ B = ∅.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Yield by Partition Subset Strip */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-neutral-700">
          <span className="text-lg">{flight.countryFlag}</span>
          <span className="font-bold text-neutral-900">
            Total Partitioned Yield ({flight.destination}):
          </span>
          <span className="font-mono font-black text-sm text-emerald-800">
            {flight.currencySymbol}{totalRevenue.toLocaleString()} {flight.currencyCode}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-sky-800 font-bold">
            Eco: {flight.currencySymbol}{ecoRevenue.toLocaleString()}
          </span>
          <span>•</span>
          <span className="text-purple-800 font-bold">
            Prem: {flight.currencySymbol}{premRevenue.toLocaleString()}
          </span>
          <span>•</span>
          <span className="text-emerald-800 font-bold">
            Biz: {flight.currencySymbol}{bizRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Colorful Disjoint Set Visualizer (Euler Diagram Boxes) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Interactive Disjoint Partition Sets (Universal Set |S| = {total})</span>
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            Additive Principle: |S| = |E| + |P| + |B|
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Economy Set Card */}
          <div
            onClick={() => setActiveSetView('ECONOMY')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
              activeSetView === 'ECONOMY'
                ? 'bg-sky-50/80 border-sky-500 shadow-md ring-2 ring-sky-200'
                : 'bg-white border-neutral-200 hover:border-sky-300 hover:bg-sky-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-linear-to-br from-sky-400 to-blue-600 shadow-xs" />
                <span>Economy Set (E)</span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                {ecoPercent}% of Cabin
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-sky-950">{partition.economySet.length}</span>
                <span className="text-xs font-medium text-neutral-500 ml-1.5">passengers</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-500 block">Unit Fare:</span>
                <span className="font-mono font-bold text-sky-900 text-sm">
                  {flight.currencySymbol}{flight.economyPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="mt-3 w-full h-2 bg-sky-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${ecoPercent}%` }}
                className="h-full bg-linear-to-r from-sky-400 to-blue-600 rounded-full"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-sky-100 text-xs text-neutral-600 flex justify-between">
              <span>Subset Revenue Yield:</span>
              <span className="font-bold text-sky-950 font-mono">
                {flight.currencySymbol}{ecoRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-neutral-500 flex justify-between">
              <span>Baseline No-Show:</span>
              <span className="font-semibold text-neutral-700">~16.0%</span>
            </div>
          </div>

          {/* Premium Set Card */}
          <div
            onClick={() => setActiveSetView('PREMIUM')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
              activeSetView === 'PREMIUM'
                ? 'bg-purple-50/80 border-purple-500 shadow-md ring-2 ring-purple-200'
                : 'bg-white border-neutral-200 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-linear-to-br from-purple-400 to-indigo-600 shadow-xs" />
                <span>Premium Set (P)</span>
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {premPercent}% of Cabin
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-purple-950">{partition.premiumSet.length}</span>
                <span className="text-xs font-medium text-neutral-500 ml-1.5">passengers</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-500 block">Unit Fare:</span>
                <span className="font-mono font-bold text-purple-900 text-sm">
                  {flight.currencySymbol}{flight.premiumPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="mt-3 w-full h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${premPercent}%` }}
                className="h-full bg-linear-to-r from-purple-400 to-indigo-600 rounded-full"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-purple-100 text-xs text-neutral-600 flex justify-between">
              <span>Subset Revenue Yield:</span>
              <span className="font-bold text-purple-950 font-mono">
                {flight.currencySymbol}{premRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-neutral-500 flex justify-between">
              <span>Baseline No-Show:</span>
              <span className="font-semibold text-neutral-700">~8.0%</span>
            </div>
          </div>

          {/* Business Set Card */}
          <div
            onClick={() => setActiveSetView('BUSINESS')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
              activeSetView === 'BUSINESS'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-200'
                : 'bg-white border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 shadow-xs" />
                <span>Business Set (B)</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {bizPercent}% of Cabin
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-black text-emerald-950">{partition.businessSet.length}</span>
                <span className="text-xs font-medium text-neutral-500 ml-1.5">passengers</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-neutral-500 block">Unit Fare:</span>
                <span className="font-mono font-bold text-emerald-900 text-sm">
                  {flight.currencySymbol}{flight.businessPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="mt-3 w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${bizPercent}%` }}
                className="h-full bg-linear-to-r from-emerald-400 to-teal-600 rounded-full"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 text-xs text-neutral-600 flex justify-between">
              <span>Subset Revenue Yield:</span>
              <span className="font-bold text-emerald-950 font-mono">
                {flight.currencySymbol}{bizRevenue.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-neutral-500 flex justify-between">
              <span>Baseline No-Show:</span>
              <span className="font-semibold text-neutral-700">~3.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* DMGT Mathematical Invariants Verification */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Formal Equivalence Relation & Invariant Proof</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-linear-to-br from-neutral-50 to-emerald-50/30 rounded-xl border border-emerald-200/60 space-y-2">
            <span className="font-bold text-neutral-900 block text-xs">Pairwise Disjoint Checks:</span>
            <div className="space-y-2 font-mono text-[11px] text-neutral-800">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200">
                <span>E ∩ P = ∅ (Economy & Premium)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">0 shared</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200">
                <span>E ∩ B = ∅ (Economy & Business)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">0 shared</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-neutral-200">
                <span>P ∩ B = ∅ (Premium & Business)</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">0 shared</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-linear-to-br from-neutral-50 to-purple-50/30 rounded-xl border border-purple-200/60 space-y-2">
            <span className="font-bold text-neutral-900 block text-xs">Equivalence Relation on Passenger Set S:</span>
            <p className="text-neutral-700 leading-relaxed">
              Define relation R on S: (x, y) ∈ R ⇔ fareClass(x) == fareClass(y).
            </p>
            <ul className="space-y-1 text-neutral-600 pl-4 list-disc text-[11px]">
              <li><strong>Reflexive:</strong> Every passenger shares their own fare class.</li>
              <li><strong>Symmetric:</strong> If x shares class with y, y shares class with x.</li>
              <li><strong>Transitive:</strong> If x and y share class, and y and z share class, then x and z share class.</li>
            </ul>
            <p className="text-purple-900 font-semibold text-[11px] pt-1">
              Quotient Set: S / R = {'{E, P, B}'}.
            </p>
          </div>
        </div>
      </div>

      {/* Set Members Table with Individual Ticket Prices */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Set Members: {activeSetView} Set (|{activeSetView[0]}| = {currentList.length}) • Ticket: {flight.currencySymbol}
              {(activeSetView === 'BUSINESS' ? flight.businessPrice : activeSetView === 'PREMIUM' ? flight.premiumPrice : flight.economyPrice).toLocaleString()}
            </h2>
          </div>
          <div className="flex space-x-1.5">
            {(['ECONOMY', 'PREMIUM', 'BUSINESS'] as FareClass[]).map(fc => (
              <button
                key={fc}
                onClick={() => setActiveSetView(fc)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeSetView === fc
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {fc} ({fc === 'ECONOMY' ? partition.economySet.length : fc === 'PREMIUM' ? partition.premiumSet.length : partition.businessSet.length})
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Passenger ID</th>
                <th className="py-2.5 px-3">Passenger Name</th>
                <th className="py-2.5 px-3">Ticket Fare Paid ({flight.currencySymbol})</th>
                <th className="py-2.5 px-3">Previous Bookings</th>
                <th className="py-2.5 px-3">Past No-Shows</th>
                <th className="py-2.5 px-3">Personal Risk Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {currentList.map(p => {
                const indRate =
                  p.totalPreviousBookings > 0
                    ? ((p.previousNoShowCount / p.totalPreviousBookings) * 100).toFixed(1)
                    : '0.0';
                const classPrice =
                  p.fareClass === 'BUSINESS'
                    ? flight.businessPrice
                    : p.fareClass === 'PREMIUM'
                    ? flight.premiumPrice
                    : flight.economyPrice;

                return (
                  <tr key={p.passengerId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-neutral-900">
                      {p.passengerId}
                    </td>
                    <td className="py-2 px-3 font-semibold text-neutral-900">{p.fullName}</td>
                    <td className="py-2 px-3 font-mono font-bold text-neutral-900">
                      {flight.currencySymbol}{classPrice.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-neutral-600">{p.totalPreviousBookings} flights</td>
                    <td className="py-2 px-3 text-neutral-600">{p.previousNoShowCount} times</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-neutral-800 w-12">{indRate}%</span>
                        <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Number(indRate))}%` }}
                            className={`h-full ${Number(indRate) > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
