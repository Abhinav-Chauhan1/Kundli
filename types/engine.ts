export interface Planet {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  rashi: number;       // 0-11
  rashiName: string;
  nakshatra: number;   // 0-26
  nakshatraName: string;
  pada: number;        // 1-4
  house: number;       // 1-12
  isRetrograde: boolean;
  degree: number;      // degree within rashi 0-29.99
}

export interface House {
  number: number;      // 1-12
  longitude: number;
  rashi: number;
  rashiName: string;
}

export interface ChartInput {
  dob: string;         // "YYYY-MM-DD"
  tob: string;         // "HH:MM"
  lat: number;
  lng: number;
  tz: string;
  ayanamsha?: string;
}

export interface ChartResult {
  planets: Planet[];
  houses: House[];
  ascendant: number;
  ayanamsha: number;
  julianDay: number;
}

export interface PanchangInput {
  date: string;
  lat: number;
  lng: number;
  tz: string;
}

export interface Choghadiya {
  name: string;
  nameHi: string;
  start: string;
  end: string;
  quality: 'GOOD' | 'NEUTRAL' | 'BAD';
}

export interface PanchangResult {
  tithi: { number: number; name: string; nameHi: string; endsAt: string };
  vara: { number: number; name: string; nameHi: string };
  nakshatra: { number: number; name: string; nameHi: string; pada: number; endsAt: string };
  yoga: { number: number; name: string; nameHi: string };
  karana: { number: number; name: string; nameHi: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: { start: string; end: string };
  yamagandam: { start: string; end: string };
  gulikaiKaal: { start: string; end: string };
  choghadiya: { day: Choghadiya[]; night: Choghadiya[] };
}

export interface TransitInput {
  date: string;
  natalMoonLng: number;
  natalMoonSign: number;
}

export interface TransitHouse {
  planet: string;
  natalHouse: number;
  transitHouse: number;
}

export interface Transit {
  planet: string;
  fromRashi: number;
  toRashi: number;
  at: string;
}

export interface TransitResult {
  currentPlanetPositions: Planet[];
  transitHouses: TransitHouse[];
  significantTransits: Transit[];
}

export interface MuhurtaInput {
  startDate: string;
  endDate: string;
  activity: 'MARRIAGE' | 'GRIHA_PRAVESH' | 'NAMKARAN' | 'MUNDAN' | 'VEHICLE' | 'BUSINESS';
  lat: number;
  lng: number;
  tz: string;
}

export interface MuhurtaSlot {
  start: string;
  end: string;
  qualityScore: number;
  tithi: string;
  nakshatra: string;
  vara: string;
  notes: string;
}

export interface MuhurtaResult {
  slots: MuhurtaSlot[];
}

export interface PersonInput {
  dob: string;
  tob: string;
  lat: number;
  lng: number;
  tz: string;
}

export interface MilanInput {
  person1: PersonInput;
  person2: PersonInput;
}

export interface Koota {
  name: 'Varna' | 'Vashya' | 'Tara' | 'Yoni' | 'Graha Maitri' | 'Gana' | 'Bhakoot' | 'Nadi';
  score: number;
  maxScore: number;
  description: string;
}

export interface MilanResult {
  person1MoonSign: number;
  person2MoonSign: number;
  person1Nakshatra: number;
  person2Nakshatra: number;
  kootas: Koota[];
  totalScore: number;
  mangalDosha: {
    person1: { hasMangal: boolean; severity: string; houses: number[] };
    person2: { hasMangal: boolean; severity: string; houses: number[] };
    cancellation: boolean;
    cancellationReason: string | null;
  };
  compatibility: {
    mental: string;
    health: string;
    financial: string;
    children: string;
    longevity: string;
  };
  recommendation: 'HIGHLY_COMPATIBLE' | 'COMPATIBLE' | 'AVERAGE' | 'NOT_RECOMMENDED';
}
