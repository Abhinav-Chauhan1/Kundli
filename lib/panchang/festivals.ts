/**
 * Static Hindu festival data.
 * Dates are approximate — calculated from tithi, not Gregorian fixed dates.
 * Update annually or compute dynamically via panchang engine.
 */

export interface Festival {
  name:     string;
  nameHi:   string;
  month:    number; // 1-12
  day:      number; // 1-31 (approximate Gregorian)
  type:     'national' | 'regional' | 'auspicious';
}

export const FESTIVALS_2026: Festival[] = [
  { name: 'Makar Sankranti',  nameHi: 'मकर संक्रांति',  month: 1,  day: 14, type: 'national' },
  { name: 'Basant Panchami',  nameHi: 'बसंत पंचमी',     month: 2,  day: 2,  type: 'national' },
  { name: 'Maha Shivaratri',  nameHi: 'महा शिवरात्री',  month: 2,  day: 17, type: 'national' },
  { name: 'Holi',             nameHi: 'होली',           month: 3,  day: 20, type: 'national' },
  { name: 'Ram Navami',       nameHi: 'राम नवमी',       month: 3,  day: 30, type: 'national' },
  { name: 'Hanuman Jayanti',  nameHi: 'हनुमान जयंती',  month: 4,  day: 12, type: 'national' },
  { name: 'Akshaya Tritiya', nameHi: 'अक्षय तृतीया',   month: 4,  day: 22, type: 'auspicious' },
  { name: 'Guru Purnima',    nameHi: 'गुरु पूर्णिमा',  month: 7,  day: 10, type: 'auspicious' },
  { name: 'Raksha Bandhan',  nameHi: 'रक्षा बंधन',    month: 8,  day: 19, type: 'national' },
  { name: 'Janmashtami',     nameHi: 'जन्माष्टमी',    month: 8,  day: 26, type: 'national' },
  { name: 'Ganesh Chaturthi',nameHi: 'गणेश चतुर्थी',  month: 8,  day: 23, type: 'national' },
  { name: 'Navratri',        nameHi: 'नवरात्री',       month: 9,  day: 23, type: 'national' },
  { name: 'Dussehra',        nameHi: 'दशहरा',          month: 10, day: 2,  type: 'national' },
  { name: 'Karva Chauth',    nameHi: 'करवा चौथ',      month: 10, day: 20, type: 'regional' },
  { name: 'Dhanteras',       nameHi: 'धनतेरस',         month: 10, day: 28, type: 'national' },
  { name: 'Diwali',          nameHi: 'दीवाली',         month: 10, day: 30, type: 'national' },
  { name: 'Bhai Dooj',       nameHi: 'भाई दूज',        month: 11, day: 1,  type: 'national' },
];

export function getFestivalsForMonth(month: number, year = 2026): Festival[] {
  // For non-2026 years, return empty — full computation requires panchang engine
  if (year !== 2026) return [];
  return FESTIVALS_2026.filter((f) => f.month === month);
}
