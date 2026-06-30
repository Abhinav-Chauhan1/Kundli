const swisseph = require('swisseph');
const { DateTime } = require('luxon');
const { toJulianDay, julianDayToISO } = require('../lib/timezone');
const { setAyanamsha, calcAllPlanets } = require('../lib/ephemeris');

const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
  'Purnima', // Shukla 15
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi',
  'Amavasya', // Krishna 30
];

const TITHI_NAMES_HI = [
  'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी',
  'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
  'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा',
  'प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी',
  'षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी',
  'एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या',
];

const VARA_NAMES    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const VARA_NAMES_HI = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];

const NAKSHATRA_NAMES = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];
const NAKSHATRA_NAMES_HI = [
  'अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा',
  'पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वाफाल्गुनी','उत्तराफाल्गुनी',
  'हस्त','चित्रा','स्वाति','विशाखा','अनुराधा','ज्येष्ठा',
  'मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा',
  'शतभिषा','पूर्वाभाद्रपद','उत्तराभाद्रपद','रेवती',
];

const YOGA_NAMES = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarman',
  'Dhriti','Shoola','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana',
  'Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva','Siddha',
  'Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti',
];
const YOGA_NAMES_HI = [
  'विष्कम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभना','अतिगण्ड','सुकर्मा',
  'धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण',
  'वज्र','सिद्धि','व्यतीपात','वरीयान','परिघ','शिव','सिद्ध',
  'साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति',
];

const KARANA_NAMES = ['Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti','Shakuni','Chatushpada','Nagava','Kimstughna'];
const KARANA_NAMES_HI = ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि','शकुनि','चतुष्पद','नाग','किंस्तुघ्न'];

const CHOGHADIYA_NAMES = ['Udvega','Char','Labh','Amrit','Kaal','Shubh','Rog','Udvega'];
const CHOGHADIYA_QUALITY = ['BAD','NEUTRAL','GOOD','GOOD','BAD','GOOD','BAD','BAD'];
const CHOGHADIYA_NAMES_HI = ['उद्वेग','चर','लाभ','अमृत','काल','शुभ','रोग','उद्वेग'];

// Day order starting index per weekday (0=Sun)
const CHOGHADIYA_DAY_START = [5,1,3,6,2,4,0]; // index into CHOGHADIYA_NAMES for first slot

async function panchangRoutes(fastify) {
  fastify.post('/calculate/panchang', {
    schema: {
      body: {
        type: 'object',
        required: ['date', 'lat', 'lng', 'tz'],
        properties: {
          date: { type: 'string' },
          lat:  { type: 'number' },
          lng:  { type: 'number' },
          tz:   { type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { date, lat, lng, tz } = req.body;

    setAyanamsha('LAHIRI');

    // JD for sunrise (use 06:00 local as approximation for panchang start)
    const jdNoon = toJulianDay(date, '12:00', tz);

    // Get sunrise and sunset
    const sunriseResult = swisseph.swe_rise_trans(
      jdNoon - 0.5, swisseph.SE_SUN, '', swisseph.SEFLG_SIDEREAL,
      swisseph.SE_CALC_RISE, [lng, lat, 0], 1013.25, 10,
    );
    const sunsetResult = swisseph.swe_rise_trans(
      jdNoon - 0.5, swisseph.SE_SUN, '', swisseph.SEFLG_SIDEREAL,
      swisseph.SE_CALC_SET, [lng, lat, 0], 1013.25, 10,
    );
    const moonriseResult = swisseph.swe_rise_trans(
      jdNoon - 0.5, swisseph.SE_MOON, '', swisseph.SEFLG_SIDEREAL,
      swisseph.SE_CALC_RISE, [lng, lat, 0], 1013.25, 10,
    );
    const moonsetResult = swisseph.swe_rise_trans(
      jdNoon - 0.5, swisseph.SE_MOON, '', swisseph.SEFLG_SIDEREAL,
      swisseph.SE_CALC_SET, [lng, lat, 0], 1013.25, 10,
    );

    const sunrise = julianDayToISO(sunriseResult.transitTime ?? jdNoon - 0.25, tz);
    const sunset  = julianDayToISO(sunsetResult.transitTime  ?? jdNoon + 0.25, tz);
    const moonrise = julianDayToISO(moonriseResult.transitTime ?? jdNoon, tz);
    const moonset  = julianDayToISO(moonsetResult.transitTime  ?? jdNoon + 0.5, tz);

    // Sun and Moon longitudes at noon
    const flags = swisseph.SEFLG_SIDEREAL;
    const sunPos  = swisseph.swe_calc_ut(jdNoon, swisseph.SE_SUN,  flags);
    const moonPos = swisseph.swe_calc_ut(jdNoon, swisseph.SE_MOON, flags);

    // Tithi
    let moonSunDiff = ((moonPos.longitude - sunPos.longitude) + 360) % 360;
    const tithiNum = Math.floor(moonSunDiff / 12); // 0-29
    const tithi = {
      number:  tithiNum + 1,
      name:    TITHI_NAMES[tithiNum],
      nameHi:  TITHI_NAMES_HI[tithiNum],
      endsAt:  '',
    };

    // Vara (weekday)
    const dt = DateTime.fromISO(`${date}T12:00`, { zone: tz });
    const vara = {
      number: dt.weekday % 7,
      name:   VARA_NAMES[dt.weekday % 7],
      nameHi: VARA_NAMES_HI[dt.weekday % 7],
    };

    // Nakshatra
    const nakshatraNum = Math.floor(moonPos.longitude / (360 / 27));
    const nakshatra = {
      number:  nakshatraNum,
      name:    NAKSHATRA_NAMES[nakshatraNum],
      nameHi:  NAKSHATRA_NAMES_HI[nakshatraNum],
      pada:    Math.floor((moonPos.longitude % (360 / 27)) / (360 / 27 / 4)) + 1,
      endsAt:  '',
    };

    // Yoga = (Sun + Moon) / (360/27) mod 27
    const yogaNum = Math.floor(((sunPos.longitude + moonPos.longitude) % 360) / (360 / 27));
    const yoga = {
      number: yogaNum,
      name:   YOGA_NAMES[yogaNum],
      nameHi: YOGA_NAMES_HI[yogaNum],
    };

    // Karana = half-tithi
    const karanaNum = Math.floor(moonSunDiff / 6) % 11;
    const karana = {
      number: karanaNum,
      name:   KARANA_NAMES[karanaNum],
      nameHi: KARANA_NAMES_HI[karanaNum],
    };

    // Rahu Kaal, Yamagandam, Gulikai (duration-based from sunrise)
    const sunriseMs = DateTime.fromISO(sunrise).toMillis();
    const sunsetMs  = DateTime.fromISO(sunset).toMillis();
    const dayMs     = sunsetMs - sunriseMs;
    const slotMs    = dayMs / 8;

    // Rahu Kaal slot per weekday (1-indexed weekday 0=Sun)
    const RAHU_SLOTS = [7, 1, 6, 4, 5, 3, 2]; // slot number for Sun-Sat
    const YAMA_SLOTS = [4, 3, 2, 1, 0, 6, 5];
    const GULI_SLOTS = [6, 5, 4, 3, 2, 1, 0];
    const wday = dt.weekday % 7;

    function slotTime(slotIdx: number) {
      const start = new Date(sunriseMs + slotIdx * slotMs).toISOString();
      const end   = new Date(sunriseMs + (slotIdx + 1) * slotMs).toISOString();
      return { start, end };
    }

    const rahuKaal   = slotTime(RAHU_SLOTS[wday]);
    const yamagandam = slotTime(YAMA_SLOTS[wday]);
    const gulikaiKaal = slotTime(GULI_SLOTS[wday]);

    // Choghadiya
    const dayStartIdx = CHOGHADIYA_DAY_START[wday];
    const nightStartIdx = (dayStartIdx + 1) % 8;
    const nightMs = (24 * 3600 * 1000) - dayMs;
    const daySlotMs  = dayMs  / 8;
    const nightSlotMs = nightMs / 8;

    const dayChog   = [];
    const nightChog = [];
    for (let i = 0; i < 8; i++) {
      const idx = (dayStartIdx + i) % 8;
      dayChog.push({
        name:    CHOGHADIYA_NAMES[idx],
        nameHi:  CHOGHADIYA_NAMES_HI[idx],
        quality: CHOGHADIYA_QUALITY[idx],
        start:   new Date(sunriseMs + i * daySlotMs).toISOString(),
        end:     new Date(sunriseMs + (i + 1) * daySlotMs).toISOString(),
      });
      const nIdx = (nightStartIdx + i) % 8;
      nightChog.push({
        name:    CHOGHADIYA_NAMES[nIdx],
        nameHi:  CHOGHADIYA_NAMES_HI[nIdx],
        quality: CHOGHADIYA_QUALITY[nIdx],
        start:   new Date(sunsetMs + i * nightSlotMs).toISOString(),
        end:     new Date(sunsetMs + (i + 1) * nightSlotMs).toISOString(),
      });
    }

    return {
      tithi, vara, nakshatra, yoga, karana,
      sunrise, sunset, moonrise, moonset,
      rahuKaal, yamagandam, gulikaiKaal,
      choghadiya: { day: dayChog, night: nightChog },
    };
  });

  // POST /calculate/muhurta
  fastify.post('/calculate/muhurta', {
    schema: {
      body: {
        type: 'object',
        required: ['startDate', 'endDate', 'activity', 'lat', 'lng', 'tz'],
      },
    },
  }, async (req, reply) => {
    const { startDate, endDate, activity, lat, lng, tz } = req.body;

    const start = DateTime.fromISO(startDate, { zone: tz });
    const end   = DateTime.fromISO(endDate,   { zone: tz });

    // Scan day by day
    const slots = [];
    let current = start;

    while (current < end && slots.length < 20) {
      const dateStr = current.toISODate();
      const jdNoon  = toJulianDay(dateStr, '12:00', tz);

      const flags = swisseph.SEFLG_SIDEREAL;
      const sunPos  = swisseph.swe_calc_ut(jdNoon, swisseph.SE_SUN,  flags);
      const moonPos = swisseph.swe_calc_ut(jdNoon, swisseph.SE_MOON, flags);

      const nakshatraNum = Math.floor(moonPos.longitude / (360 / 27));
      const tithiNum = Math.floor(((moonPos.longitude - sunPos.longitude + 360) % 360) / 12);

      // Good nakshatras per activity (simplified)
      const GOOD_NAK = {
        MARRIAGE: [3,6,7,11,12,14,21,23,24,25,26],
        GRIHA_PRAVESH: [0,3,6,7,12,21,22,24,25],
        NAMKARAN: [0,3,6,7,11,12,21],
        MUNDAN: [0,3,7,12,21,24],
        VEHICLE: [3,6,7,11,12,14,24],
        BUSINESS: [0,3,6,7,11,12,21,22,24],
      };

      const goodNaks = GOOD_NAK[activity] ?? [];
      const nakshatraGood = goodNaks.includes(nakshatraNum);
      const tithiGood = ![4, 8, 9, 14, 19, 24, 29].includes(tithiNum); // avoid certain tithis

      if (nakshatraGood && tithiGood) {
        slots.push({
          start:        `${dateStr}T09:00:00`,
          end:          `${dateStr}T12:00:00`,
          qualityScore: nakshatraGood ? 8 : 5,
          tithi:        TITHI_NAMES[tithiNum],
          nakshatra:    NAKSHATRA_NAMES[nakshatraNum],
          vara:         VARA_NAMES[current.weekday % 7],
          notes:        `Good ${NAKSHATRA_NAMES[nakshatraNum]} nakshatra`,
        });
      }

      current = current.plus({ days: 1 });
    }

    return { slots };
  });
}

module.exports = panchangRoutes;
