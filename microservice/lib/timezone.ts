const { DateTime } = require('luxon');
const swisseph = require('swisseph');

/**
 * Convert birth date/time in a named timezone to Julian Day Number.
 * Always converts to UTC before calling swe_julday — never pass local time directly.
 */
function toJulianDay(dob, tob, tz) {
  const dt = DateTime.fromISO(`${dob}T${tob}`, { zone: tz }).toUTC();
  if (!dt.isValid) throw new Error(`Invalid date/time: ${dob} ${tob} ${tz}`);
  return swisseph.swe_julday(
    dt.year,
    dt.month,
    dt.day,
    dt.hour + dt.minute / 60 + dt.second / 3600,
    swisseph.SE_GREG_CAL,
  );
}

function julianDayToISO(jd, tz) {
  const ut = swisseph.swe_jdut1_to_utc(jd, swisseph.SE_GREG_CAL);
  const dt = DateTime.utc(ut.year, ut.month, ut.day, ut.hour, ut.minute, Math.floor(ut.second))
    .setZone(tz);
  return dt.toISO();
}

module.exports = { toJulianDay, julianDayToISO };
