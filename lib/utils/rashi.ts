export const RASHI_NAMES_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;

export const RASHI_NAMES_HI = [
  'मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या',
  'तुला','वृश्चिक','धनु','मकर','कुंभ','मीन',
] as const;

export const NAKSHATRA_NAMES_EN = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
] as const;

export type RashiIndex = 0|1|2|3|4|5|6|7|8|9|10|11;

export function getRashiName(index: number, lang: 'en' | 'hi' = 'en'): string {
  return lang === 'hi' ? RASHI_NAMES_HI[index] ?? '' : RASHI_NAMES_EN[index] ?? '';
}

export function getNakshatraName(index: number, lang: 'en' | 'hi' = 'en'): string {
  return lang === 'hi' ? '' : NAKSHATRA_NAMES_EN[index] ?? '';
}
