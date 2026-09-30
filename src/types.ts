export type FareClass = 'ECONOMY' | 'PREMIUM' | 'BUSINESS';

export type BookingStatus = 'CONFIRMED' | 'STANDBY' | 'CANCELLED' | 'BOARDED' | 'NO_SHOW';

export interface Passenger {
  passengerId: string;
  fullName: string;
  fareClass: FareClass;
  previousNoShowCount: number;
  totalPreviousBookings: number;
}

export interface Booking {
  bookingId: string;
  flightNumber: string;
  destination?: string;
  countryFlag?: string;
  passenger: Passenger;
  status: BookingStatus;
  seatNumber?: string | number;
  bookingTime: string;
  ticketPrice: number;
  currencyCode: string;
  currencySymbol: string;
}

export interface Flight {
  flightNumber: string;
  source: string;
  destination: string;
  flightDate: string;
  aircraftCapacity: number;
  maxAllowedOverbooking: number;
  // Destination Pricing & Currency
  currencyCode: string;
  currencySymbol: string;
  countryFlag: string;
  economyPrice: number;
  premiumPrice: number;
  businessPrice: number;
}

export interface DestinationPreset {
  destination: string;
  airportCode: string;
  country: string;
  countryFlag: string;
  currencyCode: string;
  currencySymbol: string;
  economyPrice: number;
  premiumPrice: number;
  businessPrice: number;
  availableSeats?: number;
}

export interface AvailableFlightOption {
  flightNumber: string;
  source: string;
  destination: string;
  countryFlag: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraftType: string;
  aircraftCapacity: number;
  availableSeats: number;
  availableEconomySeats: number;
  availablePremiumSeats: number;
  availableBusinessSeats: number;
  economyPrice: number;
  premiumPrice: number;
  businessPrice: number;
  currencyCode: string;
  currencySymbol: string;
}

export interface BTreeKeyItem {
  key: string;
  booking: Booking;
}

export interface BTreeNodeUI {
  id: string;
  keys: BTreeKeyItem[];
  isLeaf: boolean;
  children: BTreeNodeUI[];
  depth: number;
}

export interface SearchStep {
  nodeId: string;
  keysInNode: string[];
  comparison: string;
  action: string;
  found: boolean;
}

export interface PythonPredictionResult {
  overallProbability: number;
  percentageString: string;
  riskTier: 'Low probability' | 'Medium probability' | 'High probability';
  sampleSize: number;
  totalHistoricalNoShows: number;
  fareClassBreakdown: {
    ECONOMY: { count: number; noShows: number; rate: number };
    PREMIUM: { count: number; noShows: number; rate: number };
    BUSINESS: { count: number; noShows: number; rate: number };
  };
}

export interface OverbookingMetrics {
  aircraftCapacity: number;
  confirmedBookings: number;
  noShowProbability: number;
  expectedNoShows: number;
  recommendedAdditionalBookings: number;
  maxSafeBookings: number;
  bumpingRiskPercentage: number;
  riskTier: string;
  safetyFactor: number;
}
