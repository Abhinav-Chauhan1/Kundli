/**
 * Varga chart divisional computations.
 * All pure math on sidereal longitude — no engine calls.
 *
 * Supported: D1 (Rashi), D2 (Hora), D3 (Drekkana), D4 (Chaturthamsha),
 * D7 (Saptamsha), D9 (Navamsha), D10 (Dashamsha), D12 (Dvadashamsha),
 * D16 (Shodashamsha), D20 (Vimshamsha), D24 (Chaturvimshamsha),
 * D27 (Bhamsha), D30 (Trimshamsha), D40 (Khavedamsha),
 * D45 (Akshavedamsha), D60 (Shashtiamsha)
 */

export type VargaId = 'D1'|'D2'|'D3'|'D4'|'D7'|'D9'|'D10'|'D12'|
                      'D16'|'D20'|'D24'|'D27'|'D30'|'D40'|'D45'|'D60';

/**
 * Compute the divisional rashi for a given sidereal longitude.
 * Returns the 0-based rashi index (0 = Aries, 11 = Pisces).
 */
export function getVargaRashi(longitude: number, varga: VargaId): number {
  const lng = ((longitude % 360) + 360) % 360;
  const rashi = Math.floor(lng / 30);
  const degInRashi = lng % 30;
  const isOdd = rashi % 2 === 0; // 0,2,4...= Aries,Gemini,Leo... (odd rashis in traditional 1-based)

  switch (varga) {
    case 'D1': return rashi;

    case 'D2': {
      // First 15° → 0 (Leo for even, Cancer for odd rashi)
      const half = Math.floor(degInRashi / 15);
      if (isOdd) return half === 0 ? 4 : 3; // Leo : Cancer
      else       return half === 0 ? 3 : 4; // Cancer : Leo
    }

    case 'D3': {
      // Each 10° → same-element rashi
      const part = Math.floor(degInRashi / 10);
      return (rashi + part * 4) % 12;
    }

    case 'D4': {
      const part = Math.floor(degInRashi / 7.5);
      return (rashi + part * 3) % 12;
    }

    case 'D7': {
      const part = Math.floor(degInRashi / (30 / 7));
      return isOdd
        ? (rashi + part) % 12
        : (rashi + 6 + part) % 12;
    }

    case 'D9': {
      // Each 3°20' (= 3.333°)
      const part = Math.floor(degInRashi / (10 / 3));
      const baseRashi = (rashi % 3) * 4; // Fire signs start from Aries
      return (baseRashi + part) % 12;
    }

    case 'D10': {
      const part = Math.floor(degInRashi / 3);
      return isOdd
        ? (rashi + part) % 12
        : (rashi + 9 + part) % 12;
    }

    case 'D12': {
      const part = Math.floor(degInRashi / 2.5);
      return (rashi + part) % 12;
    }

    case 'D16': {
      const part = Math.floor(degInRashi / 1.875);
      const base = isOdd ? 0 : 3; // Aries or Cancer
      return (base + part) % 12;
    }

    case 'D20': {
      const part = Math.floor(degInRashi / 1.5);
      const base = (rashi % 4) * 3; // Aries, Cancer, Libra, Cap
      return (base + part) % 12;
    }

    case 'D24': {
      const part = Math.floor(degInRashi / 1.25);
      return isOdd
        ? (4 + part) % 12  // from Leo
        : (3 + part) % 12; // from Cancer
    }

    case 'D27': {
      const part = Math.floor(degInRashi / (10 / 9));
      const base = [0, 3, 6, 9][rashi % 4];
      return (base + part) % 12;
    }

    case 'D30': {
      // Trimshamsha: 5 unequal parts per rashi
      const PARTS_ODD  = [5, 5, 8, 7, 5]; // Mars, Saturn, Jupiter, Mercury, Venus
      const SIGNS_ODD  = [0, 9, 7, 5, 1]; // Aries, Capricorn, Scorpio, Virgo, Taurus
      const PARTS_EVEN = [5, 7, 8, 5, 5];
      const SIGNS_EVEN = [1, 5, 7, 6, 9]; // Taurus, Virgo, Scorpio, Libra, Capricorn
      const parts = isOdd ? PARTS_ODD : PARTS_EVEN;
      const signs = isOdd ? SIGNS_ODD : SIGNS_EVEN;
      let cumulative = 0;
      for (let i = 0; i < parts.length; i++) {
        cumulative += parts[i];
        if (degInRashi < cumulative) return signs[i];
      }
      return signs[signs.length - 1];
    }

    case 'D40': {
      const part = Math.floor(degInRashi / 0.75);
      return isOdd ? part % 12 : (3 + part) % 12;
    }

    case 'D45': {
      const part = Math.floor(degInRashi / (2 / 3));
      const base = rashi % 3 === 0 ? 0 : rashi % 3 === 1 ? 3 : 6;
      return (base + part) % 12;
    }

    case 'D60': {
      const part = Math.floor(degInRashi / 0.5);
      return part % 12;
    }

    default:
      return rashi;
  }
}

export const VARGA_LABELS: Record<VargaId, string> = {
  D1:  'Rashi (D1)',       D2:  'Hora (D2)',
  D3:  'Drekkana (D3)',    D4:  'Chaturthamsha (D4)',
  D7:  'Saptamsha (D7)',   D9:  'Navamsha (D9)',
  D10: 'Dashamsha (D10)',  D12: 'Dvadashamsha (D12)',
  D16: 'Shodashamsha (D16)', D20: 'Vimshamsha (D20)',
  D24: 'Chaturvimshamsha (D24)', D27: 'Bhamsha (D27)',
  D30: 'Trimshamsha (D30)', D40: 'Khavedamsha (D40)',
  D45: 'Akshavedamsha (D45)', D60: 'Shashtiamsha (D60)',
};

export const ALL_VARGAS: VargaId[] = [
  'D1','D2','D3','D4','D7','D9','D10','D12',
  'D16','D20','D24','D27','D30','D40','D45','D60',
];
