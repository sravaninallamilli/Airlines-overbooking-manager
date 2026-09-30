import React, { useState, useMemo } from 'react';
import {
  Plane,
  Users,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  Layers,
  Sparkles,
  Calendar,
  Compass,
  Armchair,
  Coins,
  BarChart3,
  TrendingUp,
  Globe2,
  Check,
  Activity,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Booking, DestinationPreset, Flight, OverbookingMetrics, PythonPredictionResult } from '../types';
import { SetPartitionResult } from '../lib/dmgt';
import { TabType } from './Navbar';
import { destinationPresets } from '../data/initialData';
import { ActiveBookingSection } from './ActiveBookingSection';
import heroImg from '../assets/images/airline_flight_ops_1790657687687.jpg';

interface DashboardTabProps {
  flight: Flight;
  bookings: Booking[];
  activeBooking?: Booking | null;
  onViewActiveTicket?: (booking: Booking) => void;
  partition: SetPartitionResult;
  prediction: PythonPredictionResult;
  metrics: OverbookingMetrics;
  onNavigate: (tab: TabType) => void;
  onQuickBookModal: () => void;
  onUpdateFlight?: (newFlight: Flight) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  flight,
  bookings,
  activeBooking,
  onViewActiveTicket,
  partition,
  prediction,
  metrics,
  onNavigate,
  onQuickBookModal,
  onUpdateFlight,
}) => {
  const confirmedCount = partition.totalConfirmed;
  const totalBookingsCount = bookings.length;
  const loadFactor = Math.round((confirmedCount / flight.aircraftCapacity) * 100);

  // Filter state for destination cards
  const [destinationRegion, setDestinationRegion] = useState<'ALL' | 'FEATURED' | 'ASIA_ME' | 'EUROPE_AMERICAS'>('ALL');
  // Recharts interactive view toggle
  const [chartView, setChartView] = useState<'ALL' | 'FARE_REVENUE' | 'BOOKING_VELOCITY' | 'RISK_BELL_CURVE' | 'CLASS_DONUT'>('ALL');

  const [hoveredSeat, setHoveredSeat] = useState<{
    seatNum: number;
    booking?: Booking;
    fareClass: string;
    price: number;
  } | null>(null);

  // Revenue calculation in destination currency
  const ecoRevenue = partition.economySet.length * flight.economyPrice;
  const premRevenue = partition.premiumSet.length * flight.premiumPrice;
  const bizRevenue = partition.businessSet.length * flight.businessPrice;
  const totalRevenue = ecoRevenue + premRevenue + bizRevenue;
  const overbookingYieldBonus = metrics.recommendedAdditionalBookings * flight.economyPrice;

  // Status computation
  let statusBadge = {
    label: 'Nominal Booking Flow',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
  };

  if (confirmedCount > flight.aircraftCapacity) {
    statusBadge = {
      label: `Overbooked (+${confirmedCount - flight.aircraftCapacity} in Safe Zone)`,
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: AlertTriangle,
    };
  } else if (confirmedCount === flight.aircraftCapacity) {
    statusBadge = {
      label: 'Physically 100% Full',
      bg: 'bg-blue-50 text-blue-800 border-blue-300',
      icon: CheckCircle2,
    };
  }

  const StatusIcon = statusBadge.icon;

  // Generate 100 aircraft seats mapped to confirmed bookings
  const seats = Array.from({ length: flight.aircraftCapacity }, (_, i) => {
    const seatNum = i + 1;
    const booking = bookings[i];
    let fareClass = 'ECONOMY';
    let price = flight.economyPrice;
    if (seatNum <= 10) {
      fareClass = 'BUSINESS';
      price = flight.businessPrice;
    } else if (seatNum <= 32) {
      fareClass = 'PREMIUM';
      price = flight.premiumPrice;
    }

    return {
      seatNum,
      booking,
      fareClass,
      price,
      isOccupied: seatNum <= confirmedCount,
    };
  });

  // Recharts Data 1: Fare Class & Revenue Distribution
  const fareClassChartData = [
    {
      name: 'Economy',
      passengers: partition.economySet.length,
      revenue: ecoRevenue,
      unitPrice: flight.economyPrice,
      fill: '#0284c7', // Sky Blue
    },
    {
      name: 'Premium',
      passengers: partition.premiumSet.length,
      revenue: premRevenue,
      unitPrice: flight.premiumPrice,
      fill: '#7c3aed', // Purple
    },
    {
      name: 'Business',
      passengers: partition.businessSet.length,
      revenue: bizRevenue,
      unitPrice: flight.businessPrice,
      fill: '#059669', // Emerald
    },
  ];

  // Recharts Data 2: Booking Progression Over Days to Departure (14-day timeline)
  const bookingTimelineData = [
    { day: 'D-14', bookings: Math.round(confirmedCount * 0.2), expectedShowUps: Math.round(confirmedCount * 0.18) },
    { day: 'D-12', bookings: Math.round(confirmedCount * 0.35), expectedShowUps: Math.round(confirmedCount * 0.31) },
    { day: 'D-10', bookings: Math.round(confirmedCount * 0.48), expectedShowUps: Math.round(confirmedCount * 0.42) },
    { day: 'D-8', bookings: Math.round(confirmedCount * 0.62), expectedShowUps: Math.round(confirmedCount * 0.55) },
    { day: 'D-6', bookings: Math.round(confirmedCount * 0.74), expectedShowUps: Math.round(confirmedCount * 0.65) },
    { day: 'D-4', bookings: Math.round(confirmedCount * 0.85), expectedShowUps: Math.round(confirmedCount * 0.75) },
    { day: 'D-2', bookings: Math.round(confirmedCount * 0.94), expectedShowUps: Math.round(confirmedCount * 0.83) },
    { day: 'D-1', bookings: Math.round(confirmedCount * 0.98), expectedShowUps: Math.round(confirmedCount * 0.86) },
    { day: 'Today (Departure)', bookings: confirmedCount, expectedShowUps: Math.round(confirmedCount * (1 - prediction.overallProbability)) },
  ];

  // Recharts Data 3: Binomial distribution of passenger show-up probability
  const showUpDistributionData = useMemo(() => {
    const n = confirmedCount;
    const p = Math.max(0.01, 1 - prediction.overallProbability);
    const mean = n * p;
    const std = Math.max(1.4, Math.sqrt(n * p * (1 - p)));
    const pts = [];
    const minK = Math.max(0, Math.floor(mean - 3.2 * std));
    const maxK = Math.min(flight.aircraftCapacity + 10, Math.ceil(mean + 3.5 * std));

    for (let k = minK; k <= maxK; k++) {
      const z = (k - mean) / std;
      const prob = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      const isOverCap = k > flight.aircraftCapacity;
      pts.push({
        label: `${k} pax`,
        passengers: k,
        probability: Number((prob * 100).toFixed(2)),
        isOverCap,
        status: isOverCap ? 'Over Capacity (Bumping Risk)' : 'Safe Fit (≤ Aircraft Seats)',
      });
    }
    return pts;
  }, [confirmedCount, prediction.overallProbability, flight.aircraftCapacity]);

  // Recharts Data 4: Class Share Breakdown (Pie/Donut)
  const classShareData = [
    { name: 'Economy Class', value: partition.economySet.length, color: '#0284c7' },
    { name: 'Premium Class', value: partition.premiumSet.length, color: '#7c3aed' },
    { name: 'Business Class', value: partition.businessSet.length, color: '#059669' },
  ];

  // Filtered destination presets for cards grid
  const filteredDestinations = useMemo(() => {
    if (destinationRegion === 'FEATURED') {
      const featuredCodes = ['DEL', 'DXB', 'SIN', 'NRT', 'CDG', 'JFK', 'LHR'];
      return destinationPresets.filter(p => featuredCodes.includes(p.airportCode));
    }
    if (destinationRegion === 'ASIA_ME') {
      const codes = ['DEL', 'DXB', 'SIN', 'NRT', 'BKK', 'ICN', 'DOH', 'RUH'];
      return destinationPresets.filter(p => codes.includes(p.airportCode));
    }
    if (destinationRegion === 'EUROPE_AMERICAS') {
      const codes = ['LHR', 'CDG', 'FRA', 'ZRH', 'FCO', 'MAD', 'AMS', 'JFK', 'YYZ', 'SYD'];
      return destinationPresets.filter(p => codes.includes(p.airportCode));
    }
    return destinationPresets;
  }, [destinationRegion]);

  const handleSwitchDestination = (preset: DestinationPreset) => {
    if (onUpdateFlight) {
      onUpdateFlight({
        ...flight,
        destination: preset.destination,
        countryFlag: preset.countryFlag,
        currencyCode: preset.currencyCode,
        currencySymbol: preset.currencySymbol,
        economyPrice: preset.economyPrice,
        premiumPrice: preset.premiumPrice,
        businessPrice: preset.businessPrice,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Hero Banner with Generated Aviation Image */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm bg-neutral-900 text-white">
        <img
          src={heroImg}
          alt="Airliner Cruising at Sunrise"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-900/90 to-blue-950/70" />

        <div className="relative p-6 sm:p-8 z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                {flight.flightNumber}
              </span>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusBadge.label}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-neutral-200 border border-white/20 flex items-center space-x-1">
                <span className="text-sm">{flight.countryFlag}</span>
                <span>{flight.currencyCode} ({flight.currencySymbol})</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
              <span>{flight.source}</span>
              <ArrowRight className="h-6 w-6 text-blue-400" />
              <span className="flex items-center space-x-2">
                <span>{flight.countryFlag}</span>
                <span>{flight.destination}</span>
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Departure: {flight.flightDate}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Compass className="h-4 w-4 text-indigo-400" />
                <span>Boeing 777-300ER • Long-Haul Route</span>
              </span>
              <span className="flex items-center space-x-1.5 font-semibold text-emerald-400">
                <Coins className="h-4 w-4" />
                <span>Flight Revenue: {flight.currencySymbol}{totalRevenue.toLocaleString()} {flight.currencyCode}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('flight-setup')}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all shadow-xs cursor-pointer"
            >
              Flights Changing & Prices
            </button>
            <button
              onClick={onQuickBookModal}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all shadow-md shadow-blue-500/30 cursor-pointer flex items-center space-x-1.5"
            >
              <span>+ Book Ticket</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono text-[11px]">
                {Math.max(1, flight.aircraftCapacity - confirmedCount)} Seats Available
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Destination Pricing Tiers Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-neutral-700">
          <span className="text-xl">{flight.countryFlag}</span>
          <span className="font-bold text-neutral-900">{flight.destination} Pricing ({flight.currencyCode}):</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Economy: {flight.currencySymbol}{flight.economyPrice.toLocaleString()}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Premium: {flight.currencySymbol}{flight.premiumPrice.toLocaleString()}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Business: {flight.currencySymbol}{flight.businessPrice.toLocaleString()}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold font-mono">
            Total Revenue: {flight.currencySymbol}{totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Colorful KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Aircraft Capacity */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-blue-50/40 border border-blue-200/70 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-indigo-600" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Aircraft Capacity
            </span>
            <div className="p-2 bg-blue-100/70 text-blue-700 rounded-xl">
              <Plane className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">
              {flight.aircraftCapacity}
            </span>
            <span className="text-xs font-medium text-neutral-500">physical seats</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span>Operational Cap:</span>
            <span className="font-bold text-blue-700 font-mono">+{flight.maxAllowedOverbooking} seats</span>
          </div>
        </div>

        {/* Card 2: Confirmed Bookings */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-purple-50/40 border border-purple-200/70 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Confirmed Bookings
            </span>
            <div className="p-2 bg-purple-100/70 text-purple-700 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-neutral-900 tracking-tight">
              {confirmedCount}
            </span>
            <span className="text-xs font-medium text-neutral-500">
              of {flight.aircraftCapacity} ({totalBookingsCount} indexed)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span>Cabin Load Factor:</span>
            <span className={`font-bold font-mono ${loadFactor > 100 ? 'text-amber-700' : 'text-purple-700'}`}>
              {loadFactor}% load
            </span>
          </div>
        </div>

        {/* Card 3: Estimated No-Show Probability */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-amber-50/40 border border-amber-200/70 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              No-Show Estimation
            </span>
            <div className="p-2 bg-amber-100/70 text-amber-700 rounded-xl">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-900 tracking-tight">
              {prediction.percentageString}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
              {prediction.riskTier}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span>Expected No-Shows:</span>
            <span className="font-bold text-amber-800 font-mono">~{metrics.expectedNoShows} passengers</span>
          </div>
        </div>

        {/* Card 4: Safe Overbooking Limit & Yield Gain */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-emerald-50/40 border border-emerald-200/70 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Safe Overbooking Limit
            </span>
            <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-xl">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-900 tracking-tight">
              +{metrics.recommendedAdditionalBookings}
            </span>
            <span className="text-xs font-medium text-neutral-500">
              (Ceiling: <strong className="text-neutral-900">{metrics.maxSafeBookings}</strong>)
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <span>Yield Upside:</span>
            <span className="font-bold text-emerald-700 font-mono">
              +{flight.currencySymbol}{overbookingYieldBonus.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* RECHARTS SECTION: Interactive Data Visualizations & Trends */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 flex items-center space-x-2">
                <span>Visual Analytics & Booking Trends</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200">
                  Recharts Interactive
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Real-time charts for Fare Classes, Booking Velocity, Safe Overbooking Bell Curve, and Cabin Allocation ({flight.currencyCode} {flight.currencySymbol})
              </p>
            </div>
          </div>

          {/* Chart View Toggle */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100/90 p-1 rounded-xl">
            <button
              onClick={() => setChartView('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              All Panels
            </button>
            <button
              onClick={() => setChartView('FARE_REVENUE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === 'FARE_REVENUE'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Fare Classes & Revenue
            </button>
            <button
              onClick={() => setChartView('BOOKING_VELOCITY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === 'BOOKING_VELOCITY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Booking Velocity
            </button>
            <button
              onClick={() => setChartView('RISK_BELL_CURVE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === 'RISK_BELL_CURVE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              No-Show Risk Curve
            </button>
            <button
              onClick={() => setChartView('CLASS_DONUT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                chartView === 'CLASS_DONUT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Cabin Share Donut
            </button>
          </div>
        </div>

        {/* Charts Container */}
        <div className={`grid gap-6 ${chartView === 'ALL' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Chart 1: Fare Class & Revenue Breakdown */}
          {(chartView === 'ALL' || chartView === 'FARE_REVENUE') && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Fare Class Passenger & Revenue Distribution
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Recharts dynamic visualization by class tier ({flight.currencyCode})
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-700 font-mono">
                  {flight.countryFlag} {flight.currencySymbol}{totalRevenue.toLocaleString()}
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fareClassChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={val => `${flight.currencySymbol}${(val / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        name === 'Passengers' ? `${val} pax` : `${flight.currencySymbol}${Number(val).toLocaleString()} ${flight.currencyCode}`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="left" dataKey="passengers" name="Passengers" radius={[6, 6, 0, 0]}>
                      {fareClassChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <Bar yAxisId="right" dataKey="revenue" name={`Revenue (${flight.currencySymbol})`} fill="#334155" opacity={0.3} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Booking Trends & Overbooking Horizon */}
          {(chartView === 'ALL' || chartView === 'BOOKING_VELOCITY') && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Booking Velocity & Safe Overbooking Horizon
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Timeline curve against Physical Capacity ({flight.aircraftCapacity}) & Safe Ceiling ({metrics.maxSafeBookings})
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Safe Buffer Active
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingTimelineData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bookingColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="showUpColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis domain={[0, Math.max(metrics.maxSafeBookings + 10, 115)]} tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} seats`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <ReferenceLine
                      y={flight.aircraftCapacity}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: `Physical Cap (${flight.aircraftCapacity})`, fill: '#b91c1c', fontSize: 10, position: 'top' }}
                    />
                    <ReferenceLine
                      y={metrics.maxSafeBookings}
                      stroke="#059669"
                      strokeDasharray="3 3"
                      label={{ value: `Safe Max (${metrics.maxSafeBookings})`, fill: '#047857', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Area type="monotone" dataKey="bookings" name="Confirmed Bookings" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#bookingColor)" />
                    <Area type="monotone" dataKey="expectedShowUps" name="Expected Show-Ups" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#showUpColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Overbooking Probability Bell Curve */}
          {(chartView === 'ALL' || chartView === 'RISK_BELL_CURVE') && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      No-Show Probability Bell Curve & Bumping Risk
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Binomial distribution of passenger show-ups vs Aircraft Capacity ({flight.aircraftCapacity})
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-full font-mono">
                  Bumping Risk: {metrics.bumpingRiskPercentage}%
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={showUpDistributionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bellCurveColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="passengers" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}% likelihood (${item?.payload?.status || ''})`,
                        'Probability',
                      ]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <ReferenceLine
                      x={flight.aircraftCapacity}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      label={{ value: `Physical Cap (${flight.aircraftCapacity})`, fill: '#b91c1c', fontSize: 10, position: 'top' }}
                    />
                    <Area type="monotone" dataKey="probability" name="Show-Up Likelihood %" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#bellCurveColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 4: Cabin Class Allocation Donut */}
          {(chartView === 'ALL' || chartView === 'CLASS_DONUT') && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                    <PieIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      Cabin Class Proportion & Share
                    </h3>
                    <span className="text-[11px] text-neutral-500">
                      Confirmed passengers partitioned across Economy, Premium, and Business
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {confirmedCount} Pax Total
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} passengers (${Math.round((Number(val) / confirmedCount) * 100)}%)`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Pie
                      data={classShareData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      label={({ name, percent }: any) => `${(name ? String(name).split(' ')[0] : '')} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {classShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GLOBAL FLIGHT DESTINATIONS & DYNAMIC ROUTE CARDS */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-neutral-900 flex items-center space-x-2">
                <span>Global Flight Destinations & Dynamic Route Cards</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono border border-emerald-200">
                  Dynamic Country Flags & Pricing Live
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Each destination automatically displays its correct country flag (e.g. 🇮🇳 India, 🇦🇪 UAE, 🇸🇬 Singapore, 🇯🇵 Japan, 🇫🇷 France, 🇺🇸 USA, 🇬🇧 UK) and corresponding class prices.
              </p>
            </div>
          </div>

          {/* Region Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100/90 p-1 rounded-xl">
            <button
              onClick={() => setDestinationRegion('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                destinationRegion === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              All Routes ({destinationPresets.length})
            </button>
            <button
              onClick={() => setDestinationRegion('FEATURED')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                destinationRegion === 'FEATURED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Featured (🇮🇳 🇦🇪 🇸🇬 🇯🇵 🇫🇷 🇺🇸 🇬🇧)
            </button>
            <button
              onClick={() => setDestinationRegion('ASIA_ME')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                destinationRegion === 'ASIA_ME'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Asia & Middle East
            </button>
            <button
              onClick={() => setDestinationRegion('EUROPE_AMERICAS')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                destinationRegion === 'EUROPE_AMERICAS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
              }`}
            >
              Europe & Americas
            </button>
          </div>
        </div>

        {/* Flight / Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {filteredDestinations.map(preset => {
            const isCurrentActive = flight.destination.includes(preset.airportCode);

            return (
              <div
                key={preset.airportCode}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrentActive
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                }`}
              >
                {/* Card Header: Flag + Destination Name + Country */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl leading-none shadow-2xs select-none" role="img" aria-label={preset.country}>
                      {preset.countryFlag}
                    </span>
                    <div>
                      <div className="text-sm font-extrabold text-neutral-900 flex items-center space-x-2">
                        <span>{preset.destination}</span>
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center space-x-1 mt-0.5">
                        <span>{preset.country}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-neutral-700">{preset.airportCode}</span>
                        <span>•</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {isCurrentActive
                            ? `${Math.max(1, flight.aircraftCapacity - confirmedCount)} Seats Available`
                            : `${preset.availableSeats || 18} Seats Available`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-mono">
                    {preset.currencyCode}
                  </span>
                </div>

                {/* Tiered Class Pricing Table on Card */}
                <div className="mt-3.5 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-sky-50/80 rounded-lg p-1.5 border border-sky-100">
                    <div className="text-[10px] font-bold text-sky-800 uppercase">Economy</div>
                    <div className="text-xs font-black text-sky-950 font-mono mt-0.5">
                      {preset.currencySymbol}{preset.economyPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-purple-50/80 rounded-lg p-1.5 border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-800 uppercase">Premium</div>
                    <div className="text-xs font-black text-purple-950 font-mono mt-0.5">
                      {preset.currencySymbol}{preset.premiumPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 rounded-lg p-1.5 border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Business</div>
                    <div className="text-xs font-black text-emerald-950 font-mono mt-0.5">
                      {preset.currencySymbol}{preset.businessPrice.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Card Action / Active State Button */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Currency: {preset.currencyCode} ({preset.currencySymbol})
                  </span>

                  {isCurrentActive ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                      <Check className="h-3.5 w-3.5" />
                      <span>Current Active Route</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSwitchDestination(preset)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition-all shadow-2xs cursor-pointer"
                    >
                      <Plane className="h-3.5 w-3.5" />
                      <span>Flights Changing (Select Route)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Colorful Fare Partition Sets & Load Factor Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: DMGT Sets Preview with Prices & Revenue */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-neutral-900">
                DMGT Fare Class Partitioning
              </h2>
            </div>
            <button
              onClick={() => onNavigate('partitioning')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore Sets</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Passengers partitioned into disjoint sets based on fare class and ticket value:
          </p>

          <div className="space-y-2.5">
            {/* Economy */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 transition-all hover:border-sky-300">
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-linear-to-r from-sky-400 to-blue-600 shadow-2xs" />
                <div>
                  <span className="text-xs font-bold text-sky-950">Economy Set (E)</span>
                  <span className="text-[10px] text-sky-700 font-mono block">
                    {flight.currencySymbol}{flight.economyPrice.toLocaleString()} / seat
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-sky-950">{partition.economySet.length}</span>
                <span className="text-[11px] text-sky-700 ml-1 font-medium">pax</span>
                <div className="text-[10px] text-sky-800 font-mono font-bold">
                  {flight.currencySymbol}{ecoRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Premium */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 transition-all hover:border-purple-300">
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-linear-to-r from-purple-400 to-indigo-600 shadow-2xs" />
                <div>
                  <span className="text-xs font-bold text-purple-950">Premium Set (P)</span>
                  <span className="text-[10px] text-purple-700 font-mono block">
                    {flight.currencySymbol}{flight.premiumPrice.toLocaleString()} / seat
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-purple-950">{partition.premiumSet.length}</span>
                <span className="text-[11px] text-purple-700 ml-1 font-medium">pax</span>
                <div className="text-[10px] text-purple-800 font-mono font-bold">
                  {flight.currencySymbol}{premRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Business */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 transition-all hover:border-emerald-300">
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-linear-to-r from-emerald-400 to-teal-600 shadow-2xs" />
                <div>
                  <span className="text-xs font-bold text-emerald-950">Business Set (B)</span>
                  <span className="text-[10px] text-emerald-700 font-mono block">
                    {flight.currencySymbol}{flight.businessPrice.toLocaleString()} / seat
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-950">{partition.businessSet.length}</span>
                <span className="text-[11px] text-emerald-700 ml-1 font-medium">pax</span>
                <div className="text-[10px] text-emerald-800 font-mono font-bold">
                  {flight.currencySymbol}{bizRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Disjoint Proof (E ∩ P = ∅):</span>
            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Strictly Invariant ✓
            </span>
          </div>
        </div>

        {/* Right: Multi-segment Seating & Overbooking Gauge */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-neutral-900">
                Safe Overbooking Capacity Spectrum
              </h2>
            </div>
            <button
              onClick={() => onNavigate('overbooking')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Algorithm Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Segmented Colorful Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-neutral-700">
                Confirmed: <strong className="text-blue-600">{confirmedCount}</strong> / {flight.aircraftCapacity} Physical Seats
              </span>
              <span className="text-neutral-900">
                Maximum Safe Ceiling: <strong className="text-emerald-700">{metrics.maxSafeBookings}</strong>
              </span>
            </div>

            <div className="w-full h-5 bg-neutral-100 rounded-xl overflow-hidden flex relative border border-neutral-200 p-0.5">
              {/* Business Segment */}
              <div
                style={{ width: `${(partition.businessSet.length / metrics.maxSafeBookings) * 100}%` }}
                className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-l-lg transition-all"
                title={`Business: ${partition.businessSet.length}`}
              />
              {/* Premium Segment */}
              <div
                style={{ width: `${(partition.premiumSet.length / metrics.maxSafeBookings) * 100}%` }}
                className="h-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all"
                title={`Premium: ${partition.premiumSet.length}`}
              />
              {/* Economy Segment */}
              <div
                style={{ width: `${(partition.economySet.length / metrics.maxSafeBookings) * 100}%` }}
                className="h-full bg-linear-to-r from-sky-400 to-blue-500 transition-all"
                title={`Economy: ${partition.economySet.length}`}
              />
              {/* Overbooking Available Buffer */}
              <div
                style={{ width: `${(metrics.recommendedAdditionalBookings / metrics.maxSafeBookings) * 100}%` }}
                className="h-full bg-amber-400/80 border-l border-dashed border-amber-600 transition-all rounded-r-lg"
                title={`Safe Overbooking Buffer: +${metrics.recommendedAdditionalBookings}`}
              />

              {/* Physical 100% capacity red needle */}
              <div
                style={{ left: `${(flight.aircraftCapacity / metrics.maxSafeBookings) * 100}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-neutral-600 mt-2 gap-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Business ({partition.businessSet.length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Premium ({partition.premiumSet.length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Economy ({partition.economySet.length})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Overbooking Buffer (+{metrics.recommendedAdditionalBookings})</span>
              </div>
            </div>
          </div>

          {/* Interactive Cabin Seating Grid */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5">
                <Armchair className="h-4 w-4 text-neutral-600" />
                <span>Aircraft Cabin Seat Grid Preview (100 Seats)</span>
              </span>
              <span className="text-[11px] text-neutral-500">Hover any seat to view reservation</span>
            </div>

            <div className="p-3 bg-neutral-50/70 border border-neutral-200 rounded-xl">
              <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 sm:gap-1.5">
                {seats.map(s => {
                  const isBiz = s.fareClass === 'BUSINESS';
                  const isPrem = s.fareClass === 'PREMIUM';
                  const colorClass = s.isOccupied
                    ? isBiz
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isPrem
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-sky-500 text-white hover:bg-sky-600'
                    : 'bg-neutral-200 text-neutral-400 border border-dashed border-neutral-300';

                  return (
                    <button
                      key={s.seatNum}
                      onMouseEnter={() => setHoveredSeat({ seatNum: s.seatNum, booking: s.booking, fareClass: s.fareClass, price: s.price })}
                      onMouseLeave={() => setHoveredSeat(null)}
                      className={`h-5 w-full rounded text-[9px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${colorClass}`}
                      title={`Seat ${s.seatNum} • ${s.fareClass} • ${flight.currencySymbol}${s.price}`}
                    >
                      {s.seatNum}
                    </button>
                  );
                })}
              </div>

              {/* Hover Tooltip display */}
              <div className="mt-2 text-xs font-medium text-neutral-700 h-5 flex items-center justify-center">
                {hoveredSeat ? (
                  <span>
                    Seat <strong className="font-mono text-neutral-900">{hoveredSeat.seatNum}</strong> • Class: <strong className="text-neutral-900">{hoveredSeat.fareClass}</strong> • Fare: <strong className="text-emerald-700">{flight.currencySymbol}{hoveredSeat.price.toLocaleString()}</strong>
                    {hoveredSeat.booking ? (
                      <> • Passenger: <strong className="text-blue-700">{hoveredSeat.booking.passenger.fullName}</strong> ({hoveredSeat.booking.bookingId})</>
                    ) : (
                      <span className="text-neutral-400"> (Available Physical Seat)</span>
                    )}
                  </span>
                ) : (
                  <span className="text-neutral-400 text-[11px]">
                    {flight.countryFlag} Destination: {flight.destination} ({flight.currencyCode} {flight.currencySymbol}) • Biz ({flight.currencySymbol}{flight.businessPrice}) • Prem ({flight.currencySymbol}{flight.premiumPrice}) • Eco ({flight.currencySymbol}{flight.economyPrice})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Bookings Table Preview */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <GitFork className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">
              Active Bookings (B-Tree Indexed)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('booking')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({bookings.length})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[11px] border-y border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Passenger</th>
                <th className="py-2.5 px-3">Fare Class</th>
                <th className="py-2.5 px-3">Ticket Fare ({flight.currencySymbol})</th>
                <th className="py-2.5 px-3">No-Show History</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.slice(0, 7).map(b => (
                <tr key={b.bookingId} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                    {b.bookingId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-neutral-900">{b.passenger.fullName}</span>
                    <span className="text-[11px] font-mono text-neutral-400 ml-1.5">({b.passenger.passengerId})</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.passenger.fareClass === 'BUSINESS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : b.passenger.fareClass === 'PREMIUM'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}
                    >
                      {b.passenger.fareClass}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                    {flight.currencySymbol}{(b.ticketPrice || (b.passenger.fareClass === 'BUSINESS' ? flight.businessPrice : b.passenger.fareClass === 'PREMIUM' ? flight.premiumPrice : flight.economyPrice)).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-600">
                    <span className="font-medium">{b.passenger.previousNoShowCount}</span> / {b.passenger.totalPreviousBookings} past
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
