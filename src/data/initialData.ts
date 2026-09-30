import { AvailableFlightOption, Booking, DestinationPreset, Flight, Passenger } from '../types';
import { HistoricalRecord } from '../lib/overbooking';

export const destinationPresets: DestinationPreset[] = [
  {
    destination: 'London (LHR)',
    airportCode: 'LHR',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    currencyCode: 'GBP',
    currencySymbol: '£',
    economyPrice: 480,
    premiumPrice: 950,
    businessPrice: 2400,
  },
  {
    destination: 'Paris (CDG)',
    airportCode: 'CDG',
    country: 'France / European Union',
    countryFlag: '🇫🇷',
    currencyCode: 'EUR',
    currencySymbol: '€',
    economyPrice: 420,
    premiumPrice: 820,
    businessPrice: 2100,
  },
  {
    destination: 'Tokyo (NRT)',
    airportCode: 'NRT',
    country: 'Japan',
    countryFlag: '🇯🇵',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    economyPrice: 85000,
    premiumPrice: 165000,
    businessPrice: 390000,
  },
  {
    destination: 'Dubai (DXB)',
    airportCode: 'DXB',
    country: 'United Arab Emirates',
    countryFlag: '🇦🇪',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    economyPrice: 2200,
    premiumPrice: 4100,
    businessPrice: 9500,
  },
  {
    destination: 'New York (JFK)',
    airportCode: 'JFK',
    country: 'United States',
    countryFlag: '🇺🇸',
    currencyCode: 'USD',
    currencySymbol: '$',
    economyPrice: 550,
    premiumPrice: 1100,
    businessPrice: 2800,
  },
  {
    destination: 'Singapore (SIN)',
    airportCode: 'SIN',
    country: 'Singapore',
    countryFlag: '🇸🇬',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    economyPrice: 650,
    premiumPrice: 1250,
    businessPrice: 3200,
  },
  {
    destination: 'New Delhi (DEL)',
    airportCode: 'DEL',
    country: 'India',
    countryFlag: '🇮🇳',
    currencyCode: 'INR',
    currencySymbol: '₹',
    economyPrice: 38000,
    premiumPrice: 72000,
    businessPrice: 165000,
  },
  {
    destination: 'Sydney (SYD)',
    airportCode: 'SYD',
    country: 'Australia',
    countryFlag: '🇦🇺',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    economyPrice: 890,
    premiumPrice: 1680,
    businessPrice: 4100,
  },
  {
    destination: 'Frankfurt (FRA)',
    airportCode: 'FRA',
    country: 'Germany / European Union',
    countryFlag: '🇩🇪',
    currencyCode: 'EUR',
    currencySymbol: '€',
    economyPrice: 450,
    premiumPrice: 880,
    businessPrice: 2250,
  },
  {
    destination: 'Toronto (YYZ)',
    airportCode: 'YYZ',
    country: 'Canada',
    countryFlag: '🇨🇦',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    economyPrice: 720,
    premiumPrice: 1350,
    businessPrice: 3400,
  },
  {
    destination: 'Zurich (ZRH)',
    airportCode: 'ZRH',
    country: 'Switzerland',
    countryFlag: '🇨🇭',
    currencyCode: 'CHF',
    currencySymbol: 'CHF',
    economyPrice: 510,
    premiumPrice: 980,
    businessPrice: 2600,
  },
  {
    destination: 'Rome (FCO)',
    airportCode: 'FCO',
    country: 'Italy',
    countryFlag: '🇮🇹',
    currencyCode: 'EUR',
    currencySymbol: '€',
    economyPrice: 440,
    premiumPrice: 850,
    businessPrice: 2150,
  },
  {
    destination: 'Madrid (MAD)',
    airportCode: 'MAD',
    country: 'Spain',
    countryFlag: '🇪🇸',
    currencyCode: 'EUR',
    currencySymbol: '€',
    economyPrice: 410,
    premiumPrice: 800,
    businessPrice: 2050,
  },
  {
    destination: 'Bangkok (BKK)',
    airportCode: 'BKK',
    country: 'Thailand',
    countryFlag: '🇹🇭',
    currencyCode: 'THB',
    currencySymbol: '฿',
    economyPrice: 18500,
    premiumPrice: 36000,
    businessPrice: 85000,
  },
  {
    destination: 'Seoul (ICN)',
    airportCode: 'ICN',
    country: 'South Korea',
    countryFlag: '🇰🇷',
    currencyCode: 'KRW',
    currencySymbol: '₩',
    economyPrice: 750000,
    premiumPrice: 1400000,
    businessPrice: 3200000,
  },
  {
    destination: 'Amsterdam (AMS)',
    airportCode: 'AMS',
    country: 'Netherlands / European Union',
    countryFlag: '🇳🇱',
    currencyCode: 'EUR',
    currencySymbol: '€',
    economyPrice: 430,
    premiumPrice: 840,
    businessPrice: 2150,
  },
  {
    destination: 'Doha (DOH)',
    airportCode: 'DOH',
    country: 'Qatar',
    countryFlag: '🇶🇦',
    currencyCode: 'QAR',
    currencySymbol: 'QR',
    economyPrice: 2100,
    premiumPrice: 4000,
    businessPrice: 9200,
  },
  {
    destination: 'Riyadh (RUH)',
    airportCode: 'RUH',
    country: 'Saudi Arabia',
    countryFlag: '🇸🇦',
    currencyCode: 'SAR',
    currencySymbol: '﷼',
    economyPrice: 2150,
    premiumPrice: 4200,
    businessPrice: 9600,
  },
];

// Fallback country flag dictionary for global destinations
const countryFlagDictionary: Array<{ keywords: string[]; flag: string; country: string; currency: string; symbol: string; basePrice: number }> = [
  { keywords: ['india', 'delhi', 'del', 'mumbai', 'bom', 'bangalore', 'blr', 'bengaluru', 'hyderabad', 'hyd', 'chennai', 'maa', 'kolkata', 'ccu', 'ahmedabad', 'amd', 'cochin', 'cok', 'punjab', 'goa'], flag: '🇮🇳', country: 'India', currency: 'INR', symbol: '₹', basePrice: 38000 },
  { keywords: ['uae', 'united arab emirates', 'dubai', 'dxb', 'abu dhabi', 'auh', 'sharjah', 'shj', 'emirates'], flag: '🇦🇪', country: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ', basePrice: 2200 },
  { keywords: ['singapore', 'sin', 'changi'], flag: '🇸🇬', country: 'Singapore', currency: 'SGD', symbol: 'S$', basePrice: 650 },
  { keywords: ['japan', 'tokyo', 'nrt', 'hnd', 'osaka', 'kix', 'kyoto', 'fukuoka', 'fuk', 'sapporo', 'cts', 'haneda', 'narita'], flag: '🇯🇵', country: 'Japan', currency: 'JPY', symbol: '¥', basePrice: 85000 },
  { keywords: ['france', 'paris', 'cdg', 'ory', 'nice', 'nce', 'lyon', 'marseille'], flag: '🇫🇷', country: 'France', currency: 'EUR', symbol: '€', basePrice: 420 },
  { keywords: ['usa', 'united states', 'america', 'new york', 'jfk', 'los angeles', 'lax', 'san francisco', 'sfo', 'chicago', 'ord', 'boston', 'bos', 'miami', 'mia', 'seattle', 'sea', 'dallas', 'dfw', 'atlanta', 'atl', 'las vegas', 'las'], flag: '🇺🇸', country: 'United States', currency: 'USD', symbol: '$', basePrice: 550 },
  { keywords: ['uk', 'united kingdom', 'britain', 'great britain', 'london', 'lhr', 'lgw', 'heathrow', 'gatwick', 'manchester', 'man', 'edinburgh', 'edi', 'birmingham', 'bhx', 'glasgow', 'gla'], flag: '🇬🇧', country: 'United Kingdom', currency: 'GBP', symbol: '£', basePrice: 480 },
  { keywords: ['germany', 'frankfurt', 'fra', 'munich', 'muc', 'berlin', 'ber', 'hamburg', 'ham', 'dusseldorf', 'dus'], flag: '🇩🇪', country: 'Germany', currency: 'EUR', symbol: '€', basePrice: 450 },
  { keywords: ['australia', 'sydney', 'syd', 'melbourne', 'mel', 'brisbane', 'bne', 'perth', 'per', 'adelaide', 'adl'], flag: '🇦🇺', country: 'Australia', currency: 'AUD', symbol: 'A$', basePrice: 890 },
  { keywords: ['canada', 'toronto', 'yyz', 'vancouver', 'yvr', 'montreal', 'yul', 'calgary', 'yyc', 'ottawa', 'yow'], flag: '🇨🇦', country: 'Canada', currency: 'CAD', symbol: 'C$', basePrice: 720 },
  { keywords: ['switzerland', 'swiss', 'zurich', 'zrh', 'geneva', 'gva', 'basel', 'bsl'], flag: '🇨🇭', country: 'Switzerland', currency: 'CHF', symbol: 'CHF', basePrice: 510 },
  { keywords: ['italy', 'rome', 'fco', 'milan', 'mxp', 'venice', 'vce', 'naples', 'nap'], flag: '🇮🇹', country: 'Italy', currency: 'EUR', symbol: '€', basePrice: 440 },
  { keywords: ['spain', 'madrid', 'mad', 'barcelona', 'bcn', 'valencia', 'vlc', 'seville', 'svq', 'malaga', 'agp'], flag: '🇪🇸', country: 'Spain', currency: 'EUR', symbol: '€', basePrice: 410 },
  { keywords: ['thailand', 'bangkok', 'bkk', 'phuket', 'hkt', 'chiang mai', 'cnx'], flag: '🇹🇭', country: 'Thailand', currency: 'THB', symbol: '฿', basePrice: 18500 },
  { keywords: ['south korea', 'korea', 'seoul', 'icn', 'incheon', 'busan', 'pus', 'gimpo', 'gmp'], flag: '🇰🇷', country: 'South Korea', currency: 'KRW', symbol: '₩', basePrice: 750000 },
  { keywords: ['netherlands', 'holland', 'amsterdam', 'ams', 'schiphol', 'rotterdam'], flag: '🇳🇱', country: 'Netherlands', currency: 'EUR', symbol: '€', basePrice: 430 },
  { keywords: ['qatar', 'doha', 'doh', 'hamad'], flag: '🇶🇦', country: 'Qatar', currency: 'QAR', symbol: 'QR', basePrice: 2100 },
  { keywords: ['saudi arabia', 'saudi', 'riyadh', 'ruh', 'jeddah', 'jed', 'dammam', 'dmm', 'medina', 'med'], flag: '🇸🇦', country: 'Saudi Arabia', currency: 'SAR', symbol: '﷼', basePrice: 2150 },
  { keywords: ['china', 'beijing', 'pek', 'pkx', 'shanghai', 'pvg', 'sha', 'guangzhou', 'can', 'shenzhen', 'szx', 'hong kong', 'hkg'], flag: '🇨🇳', country: 'China', currency: 'CNY', symbol: '¥', basePrice: 3500 },
  { keywords: ['turkey', 'istanbul', 'ist', 'saw', 'ankara', 'esb', 'antalya', 'ayt'], flag: '🇹🇷', country: 'Turkey', currency: 'TRY', symbol: '₺', basePrice: 16000 },
  { keywords: ['brazil', 'sao paulo', 'gru', 'rio', 'rio de janeiro', 'gig', 'brasilia', 'bsb'], flag: '🇧🇷', country: 'Brazil', currency: 'BRL', symbol: 'R$', basePrice: 3200 },
  { keywords: ['south africa', 'johannesburg', 'jnb', 'cape town', 'cpt', 'durban', 'dur'], flag: '🇿🇦', country: 'South Africa', currency: 'ZAR', symbol: 'R', basePrice: 8500 },
  { keywords: ['malaysia', 'kuala lumpur', 'kul', 'penang', 'pen'], flag: '🇲🇾', country: 'Malaysia', currency: 'MYR', symbol: 'RM', basePrice: 2400 },
  { keywords: ['indonesia', 'jakarta', 'cgk', 'bali', 'denpasar', 'dps'], flag: '🇮🇩', country: 'Indonesia', currency: 'IDR', symbol: 'Rp', basePrice: 7500000 },
  { keywords: ['new zealand', 'auckland', 'akl', 'wellington', 'wlg', 'christchurch', 'chc'], flag: '🇳🇿', country: 'New Zealand', currency: 'NZD', symbol: 'NZ$', basePrice: 980 },
  { keywords: ['mexico', 'mexico city', 'mex', 'cancun', 'cun', 'guadalajara', 'gdl'], flag: '🇲🇽', country: 'Mexico', currency: 'MXN', symbol: '$', basePrice: 9500 },
  { keywords: ['egypt', 'cairo', 'cai', 'alexandria', 'hbe'], flag: '🇪🇬', country: 'Egypt', currency: 'EGP', symbol: 'E£', basePrice: 18000 },
  { keywords: ['ireland', 'dublin', 'dub', 'shannon', 'snn'], flag: '🇮🇪', country: 'Ireland', currency: 'EUR', symbol: '€', basePrice: 440 },
  { keywords: ['sweden', 'stockholm', 'arn', 'gothenburg', 'got'], flag: '🇸🇪', country: 'Sweden', currency: 'SEK', symbol: 'kr', basePrice: 5200 },
  { keywords: ['norway', 'oslo', 'osl', 'bergen', 'bgo'], flag: '🇳🇴', country: 'Norway', currency: 'NOK', symbol: 'kr', basePrice: 5400 },
  { keywords: ['denmark', 'copenhagen', 'cph'], flag: '🇩🇰', country: 'Denmark', currency: 'DKK', symbol: 'kr', basePrice: 3800 },
  { keywords: ['greece', 'athens', 'ath', 'santorini', 'thira', 'mykonos'], flag: '🇬🇷', country: 'Greece', currency: 'EUR', symbol: '€', basePrice: 460 },
  { keywords: ['portugal', 'lisbon', 'lis', 'porto', 'opo'], flag: '🇵🇹', country: 'Portugal', currency: 'EUR', symbol: '€', basePrice: 420 },
  { keywords: ['austria', 'vienna', 'vie'], flag: '🇦🇹', country: 'Austria', currency: 'EUR', symbol: '€', basePrice: 460 },
  { keywords: ['belgium', 'brussels', 'bru'], flag: '🇧🇪', country: 'Belgium', currency: 'EUR', symbol: '€', basePrice: 440 },
];

// Dynamic Country Flag & Currency Resolver
export function getDestinationPreset(dest: string): DestinationPreset {
  if (!dest) return destinationPresets[0];
  const normalized = dest.toLowerCase().trim();

  // 1. Direct match with preset list
  const directMatch = destinationPresets.find(
    p =>
      normalized.includes(p.airportCode.toLowerCase()) ||
      normalized.includes(p.destination.toLowerCase()) ||
      normalized.includes(p.country.toLowerCase())
  );
  if (directMatch) return directMatch;

  // 2. Comprehensive dictionary lookup
  for (const item of countryFlagDictionary) {
    if (item.keywords.some(kw => normalized.includes(kw))) {
      const existingPreset = destinationPresets.find(p => p.countryFlag === item.flag);
      if (existingPreset) {
        return {
          ...existingPreset,
          destination: dest,
        };
      }
      return {
        destination: dest,
        airportCode: dest.slice(0, 3).toUpperCase(),
        country: item.country,
        countryFlag: item.flag,
        currencyCode: item.currency,
        currencySymbol: item.symbol,
        economyPrice: item.basePrice,
        premiumPrice: Math.round(item.basePrice * 1.9),
        businessPrice: Math.round(item.basePrice * 4.5),
      };
    }
  }

  // 3. Fallback to default
  return destinationPresets[0];
}

export function getCountryFlagForDestination(dest: string): string {
  return getDestinationPreset(dest).countryFlag;
}

export function getAvailableFlightsForDestination(
  dest: string,
  currentFlight: Flight,
  confirmedBookingsCount?: number
): AvailableFlightOption[] {
  const preset = getDestinationPreset(dest);
  const src = currentFlight.source || 'New York (JFK)';
  const currentNumStr = currentFlight.flightNumber.replace(/\D/g, '') || '204';
  const baseNum = parseInt(currentNumStr, 10);

  const capacity1 = currentFlight.aircraftCapacity || 100;
  const avail1 =
    confirmedBookingsCount !== undefined
      ? Math.max(1, capacity1 - confirmedBookingsCount)
      : Math.max(4, Math.floor(capacity1 * 0.12));
  const eco1 = Math.max(1, Math.floor(avail1 * 0.65));
  const prem1 = Math.max(1, Math.floor(avail1 * 0.22));
  const biz1 = Math.max(1, avail1 - eco1 - prem1);

  const capacity2 = 120;
  const avail2 = 16;
  const eco2 = 10;
  const prem2 = 4;
  const biz2 = 2;

  const capacity3 = 90;
  const avail3 = 8;
  const eco3 = 5;
  const prem3 = 2;
  const biz3 = 1;

  return [
    {
      flightNumber: currentFlight.flightNumber || 'AI-204',
      source: src,
      destination: preset.destination,
      countryFlag: preset.countryFlag,
      departureTime: '08:30 AM',
      arrivalTime: '04:45 PM',
      duration: '7h 15m',
      aircraftType: 'Boeing 777-300ER',
      aircraftCapacity: capacity1,
      availableSeats: avail1,
      availableEconomySeats: eco1,
      availablePremiumSeats: prem1,
      availableBusinessSeats: biz1,
      economyPrice: preset.economyPrice,
      premiumPrice: preset.premiumPrice,
      businessPrice: preset.businessPrice,
      currencyCode: preset.currencyCode,
      currencySymbol: preset.currencySymbol,
    },
    {
      flightNumber: `AI-${baseNum + 112}`,
      source: src,
      destination: preset.destination,
      countryFlag: preset.countryFlag,
      departureTime: '01:15 PM',
      arrivalTime: '09:30 PM',
      duration: '7h 15m',
      aircraftType: 'Airbus A350-900',
      aircraftCapacity: capacity2,
      availableSeats: avail2,
      availableEconomySeats: eco2,
      availablePremiumSeats: prem2,
      availableBusinessSeats: biz2,
      economyPrice: Math.round(preset.economyPrice * 1.05),
      premiumPrice: Math.round(preset.premiumPrice * 1.05),
      businessPrice: Math.round(preset.businessPrice * 1.05),
      currencyCode: preset.currencyCode,
      currencySymbol: preset.currencySymbol,
    },
    {
      flightNumber: `AI-${baseNum + 248}`,
      source: src,
      destination: preset.destination,
      countryFlag: preset.countryFlag,
      departureTime: '08:45 PM',
      arrivalTime: '05:00 AM (+1)',
      duration: '7h 15m',
      aircraftType: 'Boeing 787-9 Dreamliner',
      aircraftCapacity: capacity3,
      availableSeats: avail3,
      availableEconomySeats: eco3,
      availablePremiumSeats: prem3,
      availableBusinessSeats: biz3,
      economyPrice: Math.round(preset.economyPrice * 0.95),
      premiumPrice: Math.round(preset.premiumPrice * 0.95),
      businessPrice: Math.round(preset.businessPrice * 0.95),
      currencyCode: preset.currencyCode,
      currencySymbol: preset.currencySymbol,
    },
  ];
}

export const initialFlight: Flight = {
  flightNumber: 'AI-204',
  source: 'New York (JFK)',
  destination: 'London (LHR)',
  flightDate: '2026-10-02',
  aircraftCapacity: 100,
  maxAllowedOverbooking: 15,
  countryFlag: '🇬🇧',
  currencyCode: 'GBP',
  currencySymbol: '£',
  economyPrice: 480,
  premiumPrice: 950,
  businessPrice: 2400,
};

const passengerSeeds: Array<{ name: string; fareClass: 'ECONOMY' | 'PREMIUM' | 'BUSINESS'; pastNoShows: number; totalPast: number }> = [
  // Business (10 passengers)
  { name: 'Dr. Alan Turing', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 14 },
  { name: 'Ada Lovelace', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 18 },
  { name: 'Grace Hopper', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 22 },
  { name: 'John von Neumann', fareClass: 'BUSINESS', pastNoShows: 1, totalPast: 15 },
  { name: 'Katherine Johnson', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 19 },
  { name: 'Claude Shannon', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 11 },
  { name: 'Margaret Hamilton', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 25 },
  { name: 'Tim Berners-Lee', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 17 },
  { name: 'Barbara Liskov', fareClass: 'BUSINESS', pastNoShows: 0, totalPast: 16 },
  { name: 'Ken Thompson', fareClass: 'BUSINESS', pastNoShows: 1, totalPast: 12 },

  // Premium (22 passengers)
  { name: 'Dennis Ritchie', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 9 },
  { name: 'Linus Torvalds', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 14 },
  { name: 'Donald Knuth', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 13 },
  { name: 'Edsger Dijkstra', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 8 },
  { name: 'Leslie Lamport', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 11 },
  { name: 'Vint Cerf', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 15 },
  { name: 'Radia Perlman', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 10 },
  { name: 'Shafi Goldwasser', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 7 },
  { name: 'Silvio Micali', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 9 },
  { name: 'Michael Stonebraker', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 12 },
  { name: 'Frances Allen', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 6 },
  { name: 'Geoffrey Hinton', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 14 },
  { name: 'Yann LeCun', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 11 },
  { name: 'Yoshua Bengio', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 8 },
  { name: 'Fei-Fei Li', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 13 },
  { name: 'Andrew Ng', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 16 },
  { name: 'Daphne Koller', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 9 },
  { name: 'Peter Norvig', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 12 },
  { name: 'Stuart Russell', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 10 },
  { name: 'Bjarne Stroustrup', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 15 },
  { name: 'Guido van Rossum', fareClass: 'PREMIUM', pastNoShows: 0, totalPast: 14 },
  { name: 'James Gosling', fareClass: 'PREMIUM', pastNoShows: 1, totalPast: 18 },

  // Economy (64 passengers)
  { name: 'Liam Anderson', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 6 },
  { name: 'Emma Wilson', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Noah Martinez', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Olivia Taylor', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 8 },
  { name: 'William Thomas', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 3 },
  { name: 'Sophia Hernandez', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 7 },
  { name: 'James Moore', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 9 },
  { name: 'Isabella Martin', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Oliver Jackson', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 5 },
  { name: 'Charlotte Thompson', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
  { name: 'Benjamin White', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Mia Lopez', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 3 },
  { name: 'Elijah Lee', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 6 },
  { name: 'Amelia Gonzalez', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Lucas Harris', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 10 },
  { name: 'Harper Clark', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Mason Lewis', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 6 },
  { name: 'Evelyn Robinson', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 8 },
  { name: 'Alexander Walker', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 5 },
  { name: 'Abigail Perez', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Ethan Hall', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
  { name: 'Emily Young', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 3 },
  { name: 'Henry Allen', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Ella Sanchez', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 9 },
  { name: 'Sebastian Wright', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 6 },
  { name: 'Avery King', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 8 },
  { name: 'Jack Scott', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Scarlett Green', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 5 },
  { name: 'Samuel Baker', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
  { name: 'Grace Adams', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 3 },
  { name: 'Daniel Nelson', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 6 },
  { name: 'Chloe Hill', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 5 },
  { name: 'Matthew Ramirez', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Victoria Campbell', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 11 },
  { name: 'Aiden Mitchell', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 5 },
  { name: 'Riley Roberts', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Joseph Carter', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 6 },
  { name: 'Aria Phillips', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 3 },
  { name: 'David Evans', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 7 },
  { name: 'Lily Turner', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 8 },
  { name: 'Carter Diaz', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Zoey Parker', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Owen Cruz', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 9 },
  { name: 'Penelope Edwards', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Wyatt Collins', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 6 },
  { name: 'Layla Reyes', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
  { name: 'John Stewart', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 5 },
  { name: 'Nora Morris', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 4 },
  { name: 'Luke Morales', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 8 },
  { name: 'Hazel Murphy', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 3 },
  { name: 'Asher Cook', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Aubrey Rogers', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 6 },
  { name: 'Leo Morgan', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Stella Peterson', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Julian Cooper', fareClass: 'ECONOMY', pastNoShows: 3, totalPast: 9 },
  { name: 'Aurora Reed', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Grayson Bailey', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 6 },
  { name: 'Natalie Bell', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
  { name: 'Isaac Gomez', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 3 },
  { name: 'Zoe Kelly', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 5 },
  { name: 'Gabriel Howard', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 8 },
  { name: 'Hannah Ward', fareClass: 'ECONOMY', pastNoShows: 0, totalPast: 4 },
  { name: 'Anthony Cox', fareClass: 'ECONOMY', pastNoShows: 1, totalPast: 6 },
  { name: 'Lillian Diaz', fareClass: 'ECONOMY', pastNoShows: 2, totalPast: 7 },
];

export function getInitialBookings(flight: Flight = initialFlight): Booking[] {
  let bIdx = 0;
  let pIdx = 0;
  let eIdx = 0;

  const businessSeats = ['1A', '1C', '1D', '1F', '2A', '2C', '2D', '2F', '3A', '3C'];
  const premiumSeats = [
    '4A', '4B', '4C', '4D', '4E', '4F',
    '5A', '5B', '5C', '5D', '5E', '5F',
    '6A', '6B', '6C', '6D', '6E', '6F',
    '7A', '7B', '7C', '7D',
  ];
  const economySeats: string[] = [];
  for (let r = 8; r <= 20; r++) {
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(letter => {
      economySeats.push(`${r}${letter}`);
    });
  }

  return passengerSeeds.map((seed, idx) => {
    const pNumber = (idx + 1).toString().padStart(3, '0');
    const passenger: Passenger = {
      passengerId: `PAX-${pNumber}`,
      fullName: seed.name,
      fareClass: seed.fareClass,
      previousNoShowCount: seed.pastNoShows,
      totalPreviousBookings: seed.totalPast,
    };

    const ticketPrice =
      seed.fareClass === 'BUSINESS'
        ? flight.businessPrice
        : seed.fareClass === 'PREMIUM'
        ? flight.premiumPrice
        : flight.economyPrice;

    let seatNumber: string;
    if (seed.fareClass === 'BUSINESS') {
      seatNumber = businessSeats[bIdx++] || `3${['D', 'F'][bIdx % 2]}`;
    } else if (seed.fareClass === 'PREMIUM') {
      seatNumber = premiumSeats[pIdx++] || `7${['E', 'F'][pIdx % 2]}`;
    } else {
      seatNumber = economySeats[eIdx++] || `${18 + Math.floor(eIdx / 6)}${['A', 'B', 'C', 'D', 'E', 'F'][eIdx % 6]}`;
    }

    return {
      bookingId: `BKG-${pNumber}`,
      flightNumber: flight.flightNumber,
      destination: flight.destination,
      countryFlag: flight.countryFlag,
      passenger,
      status: 'CONFIRMED',
      seatNumber,
      bookingTime: new Date(Date.now() - (100 - idx) * 3600000).toISOString(),
      ticketPrice,
      currencyCode: flight.currencyCode,
      currencySymbol: flight.currencySymbol,
    };
  });
}

export function getInitialHistoricalRecords(): HistoricalRecord[] {
  return [
    { passengerId: 'PAX-HIST-001', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 3, totalPreviousBookings: 6, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-002', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 4, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-003', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 8, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-004', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 12, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-005', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 5, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-006', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 2, totalPreviousBookings: 7, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-007', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 9, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-008', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 3, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-009', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 2, totalPreviousBookings: 5, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-010', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 15, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-011', fareClass: 'PREMIUM', bookingStatus: 'NO_SHOW', previousNoShowCount: 1, totalPreviousBookings: 6, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-012', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 8, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-013', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 4, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-014', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 3, totalPreviousBookings: 8, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-015', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 10, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-016', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 2, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-017', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 14, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-018', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 6, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-019', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 2, totalPreviousBookings: 5, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-020', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 7, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-021', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 5, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-022', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 3, totalPreviousBookings: 9, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-023', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 20, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-024', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 8, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-025', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 4, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-026', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 2, totalPreviousBookings: 6, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-027', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 3, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-028', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 11, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-029', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 7, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-030', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 16, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-031', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 2, totalPreviousBookings: 6, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-032', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 5, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-033', fareClass: 'PREMIUM', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 9, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-034', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 4, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-035', fareClass: 'ECONOMY', bookingStatus: 'NO_SHOW', previousNoShowCount: 3, totalPreviousBookings: 7, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-036', fareClass: 'BUSINESS', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 18, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-037', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 3, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-038', fareClass: 'PREMIUM', bookingStatus: 'NO_SHOW', previousNoShowCount: 1, totalPreviousBookings: 5, noShowOutcome: 1 },
    { passengerId: 'PAX-HIST-039', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 1, totalPreviousBookings: 6, noShowOutcome: 0 },
    { passengerId: 'PAX-HIST-040', fareClass: 'ECONOMY', bookingStatus: 'BOARDED', previousNoShowCount: 0, totalPreviousBookings: 4, noShowOutcome: 0 },
  ];
}
