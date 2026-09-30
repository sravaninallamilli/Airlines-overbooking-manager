import React, { useState, useEffect } from 'react';
import { Flight } from '../types';

interface AirplaneLandingIntroProps {
  flight: Flight;
  onComplete: () => void;
}

export const AirplaneLandingIntro: React.FC<AirplaneLandingIntroProps> = ({
  flight,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'approaching' | 'flare' | 'touchdown' | 'rollout' | 'finished'>('approaching');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hudAlt, setHudAlt] = useState<number>(1450);
  const [hudSpeed, setHudSpeed] = useState<number>(152);

  useEffect(() => {
    // Dynamic altitude and speed countdown for realistic HUD telemetry
    const altInterval = setInterval(() => {
      setHudAlt(prev => {
        if (prev <= 10) return 0;
        return Math.max(0, prev - 38);
      });
      setHudSpeed(prev => {
        if (prev <= 40) return 32;
        return Math.max(32, prev - 3);
      });
    }, 70);

    // Timeline sequence
    const t1 = setTimeout(() => setPhase('flare'), 1300);
    const t2 = setTimeout(() => setPhase('touchdown'), 2100);
    const t3 = setTimeout(() => setPhase('rollout'), 2600);
    const t4 = setTimeout(() => setIsFadingOut(true), 3400);
    const t5 = setTimeout(() => {
      setPhase('finished');
      onComplete();
    }, 3900);

    return () => {
      clearInterval(altInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none bg-slate-950 transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none scale-105 filter blur-xs' : 'opacity-100'
      }`}
    >
      {/* Cinematic Twilight/Dawn Sky Backdrop */}
      <div className="absolute inset-0 bg-linear-to-b from-[#090d16] via-[#0f172a] to-[#1e1b4b]" />
      
      {/* Horizon Ambient Airfield & Dawn Light Glow */}
      <div className="absolute bottom-28 left-0 right-0 h-44 bg-linear-to-t from-amber-500/15 via-indigo-500/10 to-transparent blur-2xl" />
      <div className="absolute bottom-28 left-1/4 right-1/4 h-24 bg-blue-500/20 blur-3xl rounded-full" />

      {/* Layer 1: Stars in upper night sky */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute top-[12%] left-[18%] w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute top-[8%] left-[45%] w-1.5 h-1.5 bg-blue-200 rounded-full opacity-80" />
        <div className="absolute top-[15%] left-[72%] w-1 h-1 bg-amber-100 rounded-full opacity-90" />
        <div className="absolute top-[22%] left-[88%] w-1 h-1 bg-white rounded-full opacity-70" />
        <div className="absolute top-[6%] left-[82%] w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[32%] w-1 h-1 bg-white rounded-full opacity-50" />
        <div className="absolute top-[18%] left-[8%] w-1 h-1 bg-sky-200 rounded-full opacity-75" />
      </div>

      {/* Layer 2: Drifting Background Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud 1 */}
        <div className="absolute top-[18%] -left-32 w-96 h-28 bg-white/5 rounded-full blur-2xl animate-[cloudDrift_18s_linear_infinite]" />
        {/* Cloud 2 */}
        <div className="absolute top-[28%] left-[35%] w-[480px] h-32 bg-indigo-300/10 rounded-full blur-3xl animate-[cloudDrift_24s_linear_infinite]" />
        {/* Cloud 3 */}
        <div className="absolute top-[10%] left-[60%] w-[380px] h-24 bg-sky-400/5 rounded-full blur-2xl animate-[cloudDrift_20s_linear_infinite]" />
        {/* Cloud 4 (Lower wisps) */}
        <div className="absolute bottom-36 -right-20 w-[550px] h-28 bg-indigo-950/40 rounded-full blur-2xl" />
      </div>

      {/* Layer 3: Distant Airfield Skyline & Control Tower */}
      <div className="absolute bottom-28 left-0 right-0 h-16 flex items-end justify-between px-12 opacity-40 pointer-events-none">
        {/* Distant hangar silhouettes */}
        <div className="w-28 h-6 bg-slate-800/80 rounded-t-sm" />
        <div className="w-44 h-8 bg-slate-800/70 rounded-t-sm" />
        
        {/* Control Tower Silhouette with Flashing Beacon */}
        <div className="relative flex flex-col items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute -top-3" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 absolute -top-2.5 shadow-[0_0_8px_#ef4444]" />
          <div className="w-7 h-4 bg-slate-700 rounded-t-md" />
          <div className="w-3.5 h-16 bg-slate-800" />
        </div>

        <div className="w-36 h-7 bg-slate-800/70 rounded-t-sm" />
        <div className="w-20 h-5 bg-slate-800/60 rounded-t-sm" />
      </div>

      {/* Layer 4: Airport Runway Perspective */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[#0c121e] border-t border-slate-700/60 shadow-[0_-15px_30px_rgba(0,0,0,0.8)]">
        {/* Runway Asphalt Surface Texture */}
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Green Runway Threshold Lights */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-around px-8">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={`thresh-${i}`} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          ))}
        </div>

        {/* Centerline Dashed Runway Lights (Amber / White) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-between px-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={`dash-${i}`}
              className="h-1.5 w-10 sm:w-14 bg-amber-200/90 rounded-xs shadow-[0_0_12px_#fde68a] animate-pulse"
              style={{ animationDelay: `${(i % 4) * 0.25}s` }}
            />
          ))}
        </div>

        {/* Runway Edge Blue Taxi Lights */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={`edge-${i}`} className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
          ))}
        </div>

        {/* Runway Designation Marking "27L" */}
        <div className="absolute left-16 top-1/2 -translate-y-1/2 text-slate-500/50 font-black font-mono text-3xl sm:text-4xl tracking-widest select-none">
          27L
        </div>

        {/* Approach guidance lighting bars */}
        <div className="absolute left-44 top-3 bottom-3 w-1 bg-white/40" />
        <div className="absolute left-52 top-3 bottom-3 w-1 bg-white/40" />
      </div>

      {/* Layer 5: Airplane Flight Path & Smooth Curved Landing Motion */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Moving Airplane Container */}
        <div
          className={`absolute transition-all ease-out ${
            phase === 'approaching'
              ? 'top-[16%] left-[10%] -rotate-6 scale-90 duration-1200'
              : phase === 'flare'
              ? 'top-[44%] left-[42%] -rotate-2 scale-100 duration-800'
              : phase === 'touchdown'
              ? 'top-[60%] left-[62%] rotate-0 scale-105 duration-500'
              : 'top-[62%] left-[78%] rotate-0 scale-105 duration-1200'
          }`}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Subtle Wingtip Vapor / Contrails */}
          {phase === 'approaching' && (
            <div className="absolute -top-1 -left-28 w-32 h-1 bg-linear-to-l from-white/40 to-transparent blur-[1px] -rotate-4" />
          )}

          {/* Touchdown Tire Smoke Effect */}
          {(phase === 'touchdown' || phase === 'rollout') && (
            <div className="absolute bottom-2 left-6 pointer-events-none">
              <div className="w-12 h-6 bg-white/60 rounded-full blur-md animate-[smokePuff_0.8s_ease-out_forwards]" />
              <div className="w-8 h-4 bg-slate-300/50 rounded-full blur-sm -mt-2 ml-4 animate-[smokePuff_0.6s_ease-out_forwards]" />
            </div>
          )}

          {/* SVG Modern Widebody Commercial Airliner */}
          <div className="relative w-72 sm:w-84 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
            <svg
              viewBox="0 0 420 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              <defs>
                <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="45%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="fuselageUnder" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <linearGradient id="engineGrad" x1="0%" y1="0%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>

              {/* Stabilizer / Rear Horizontal Wing */}
              <path d="M 45 78 L 15 62 L 18 57 L 65 72 Z" fill="#64748b" opacity="0.9" />

              {/* Vertical Tail Fin */}
              <path
                d="M 50 75 L 8 12 L 32 10 L 95 72 Z"
                fill="url(#tailGrad)"
                stroke="#1d4ed8"
                strokeWidth="1.5"
              />
              {/* Airline Logo Badge on Tail */}
              <circle cx="34" cy="35" r="8" fill="#ffffff" opacity="0.95" />
              <path d="M 28 35 L 34 30 L 40 35 L 34 33 Z" fill="#ef4444" />

              {/* Far Wing (Upper/Background) */}
              <path d="M 170 68 L 225 15 L 245 15 L 210 70 Z" fill="#64748b" />

              {/* Main Fuselage Body */}
              <path
                d="M 385 85 Q 415 88 410 93 Q 395 106 330 108 L 75 108 Q 35 106 30 92 Q 35 78 75 76 L 330 76 Q 370 78 385 85 Z"
                fill="url(#fuselageGrad)"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              {/* Lower Fuselage Shadow / Livery */}
              <path
                d="M 85 96 L 350 96 Q 375 97 392 92 Q 378 106 330 108 L 75 108 Q 50 106 48 98 Z"
                fill="url(#fuselageUnder)"
              />

              {/* Cockpit Windshield (Sleek Aviator Windows) */}
              <path
                d="M 370 80 L 392 85 L 388 90 L 368 85 Z"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1"
              />

              {/* Passenger Cabin Windows (Warm Interior Light Glow) */}
              {Array.from({ length: 22 }).map((_, i) => (
                <rect
                  key={`win-${i}`}
                  x={110 + i * 11}
                  y={82}
                  width={5}
                  height={6}
                  rx={2}
                  fill="#fef08a"
                  opacity={0.9}
                />
              ))}

              {/* Main Wing (Foreground) */}
              <path
                d="M 180 88 L 130 148 L 148 152 L 265 92 Z"
                fill="url(#wingGrad)"
                stroke="#475569"
                strokeWidth="1.5"
              />
              {/* Winglet / Sharklet Tip */}
              <path d="M 128 148 L 122 135 L 133 149 Z" fill="#2563eb" />

              {/* Turbofan Jet Engine mounted under wing */}
              <rect x="200" y="98" width="55" height="22" rx="10" fill="url(#engineGrad)" stroke="#1e293b" />
              {/* Engine Intake Fan Cone */}
              <ellipse cx="250" cy="109" rx="4" ry="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="1" />
              {/* Engine Core Glow */}
              <ellipse cx="204" cy="109" rx="3" ry="8" fill="#f97316" opacity={0.8} />

              {/* Deployed Landing Gear */}
              {/* Nose Gear */}
              <line x1="345" y1="105" x2="345" y2="128" stroke="#475569" strokeWidth="3" />
              <circle cx="343" cy="129" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="347" cy="129" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />

              {/* Main Gear Bogies under Wing */}
              <line x1="210" y1="92" x2="210" y2="132" stroke="#475569" strokeWidth="4" />
              <line x1="202" y1="132" x2="222" y2="132" stroke="#64748b" strokeWidth="3" />
              <circle cx="204" cy="133" r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <circle cx="218" cy="133" r="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />

              {/* Navigation Strobe Lights */}
              {/* Flashing Red Beacon on Fuselage Top & Belly */}
              <circle cx="225" cy="74" r="3" fill="#ef4444" className="animate-ping" />
              <circle cx="225" cy="74" r="2.5" fill="#dc2626" />
              <circle cx="200" cy="108" r="2.5" fill="#dc2626" className="animate-pulse" />

              {/* High-intensity White Strobe on Wingtip */}
              <circle cx="125" cy="142" r="3.5" fill="#ffffff" className="animate-ping" />
              <circle cx="125" cy="142" r="2" fill="#ffffff" />

              {/* Forward Landing Lights Illumination Cone */}
              <path
                d="M 355 106 L 440 145 L 430 165 L 348 115 Z"
                fill="url(#landingLightBeam)"
                opacity={0.35}
              />
              <linearGradient id="landingLightBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.0} />
              </linearGradient>
            </svg>
          </div>
        </div>
      </div>

      {/* Layer 6: Aviation Telemetry HUD Display */}
      <div className="absolute top-6 left-6 z-20 flex flex-col space-y-1.5 font-mono text-xs text-sky-400 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-sky-500/30 shadow-lg shadow-black/50">
        <div className="flex items-center space-x-2 text-white font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{flight.flightNumber} APPROACH MONITOR</span>
        </div>
        <div className="text-[11px] text-slate-300 flex items-center space-x-2 pt-1 border-t border-slate-700/50">
          <span>DEST: <strong className="text-white">{flight.countryFlag} {flight.destination}</strong></span>
          <span>•</span>
          <span>RWY: <strong className="text-amber-300">27L</strong></span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px]">
          <div>
            <span className="text-slate-400">ALTITUDE: </span>
            <span className="font-bold text-white font-mono">{hudAlt} FT</span>
          </div>
          <div>
            <span className="text-slate-400">AIRSPEED: </span>
            <span className="font-bold text-white font-mono">{hudSpeed} KTS</span>
          </div>
          <div>
            <span className="text-slate-400">STATUS: </span>
            <span className={`font-bold ${phase === 'touchdown' || phase === 'rollout' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {phase === 'approaching' && 'GLIDESLOPE CAPTURED'}
              {phase === 'flare' && 'FLARING OVER THRESHOLD'}
              {phase === 'touchdown' && 'TOUCHDOWN SMOOTH ✓'}
              {phase === 'rollout' && 'REVERSE THRUST ACTIVE'}
              {phase === 'finished' && 'ARRIVED AT GATE'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">WIND: </span>
            <span className="text-slate-200">270° / 06 KT</span>
          </div>
        </div>
      </div>

      {/* Layer 7: Center Touchdown Announcement Banner */}
      <div className="absolute bottom-36 left-0 right-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div
          className={`transition-all duration-700 transform ${
            phase === 'touchdown' || phase === 'rollout'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="inline-flex items-center space-x-2.5 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-black tracking-widest uppercase shadow-lg shadow-emerald-500/20">
            <span>✈️ TOUCHDOWN CONFIRMED</span>
            <span>•</span>
            <span>{flight.destination}</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-medium tracking-wide">
            Welcome aboard • Initializing Airline Overbooking Manager Dashboard...
          </p>
        </div>
      </div>

      {/* Layer 8: Skip Button in Top Right */}
      <div className="absolute top-6 right-6 z-30">
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <span>Skip Intro</span>
          <span className="text-slate-400 group-hover:text-white">✕</span>
        </button>
      </div>

      {/* Inline styles for custom keyframe animations */}
      <style>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(100vw); }
        }
        @keyframes smokePuff {
          0% { transform: scale(0.3) translateY(0); opacity: 0.9; }
          50% { transform: scale(1.4) translateY(-10px); opacity: 0.5; }
          100% { transform: scale(2.2) translateY(-20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
