const storage = require('./storage.service');
const { getCurrentPosition } = require('./geolocation.service');
const { STORAGE, PRAYERS } = require('../constants');
const {
  getTodayDate,
  getISODate,
  timeToDate,
  getRemainingTime
} = require('../utils/datetime.fns');

/**
 * @private
 * @async
 * fetch prayer times for current location from API
 * @returns {Promise<{}[]>}
 */
async function fetchPrayerTimes() {
  const { latitude, longitude } = await getCurrentPosition();
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const params = new URLSearchParams({ latitude, longitude, month, year });
  console.log('[fetchPrayerTimes]', { latitude, longitude, month, year });
  const res = await fetch(
    `http://api.aladhan.com/v1/calendar?${params.toString()}`
  );
  const { data } = await res.json();
  console.log('[fetchPrayerTimes]', data);
  const monthPrayerTimes = data.reduce((acc, { date, timings }) => {
    const { gregorian } = date;
    const { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Sunset } = timings;
    const isoDate = getISODate(gregorian.date);
    acc[isoDate] = {
      Fajr,
      Sunrise,
      Dhuhr,
      Asr,
      Maghrib,
      Sunset,
      Isha
    };
    return acc;
  }, {});
  return monthPrayerTimes;
}

/**
 * @public
 * @async
 * Load prayer times for current location
 * from chrome storage or API
 * @returns {Promise<{}[]>}
 */
async function getMonthPrayers() {
  let monthPrayerTimes = await storage.get(STORAGE.MonthPrayerTimes);
  if (monthPrayerTimes) return monthPrayerTimes;
  monthPrayerTimes = await fetchPrayerTimes();
  await storage.set(STORAGE.MonthPrayerTimes, monthPrayerTimes);
  return monthPrayerTimes;
}

/**
 * @public
 * @async
 * Get today prayer times
 * @returns {Promise<{ [key: string]: string }>}
 * @throws {string} error message
 */
async function getTodayPrayers() {
  const monthPrayerTimes = await getMonthPrayers();
  const today = getTodayDate();
  const todayPrayers = monthPrayerTimes[today];
  if (!todayPrayers) return reject('No prayer times found');
  return todayPrayers;
}

/**
 * @public
 * @async
 * Get next prayer name
 * @returns {{ prayer: string, time: string }} next prayer details
 */
async function getNextPrayer() {
  const prayerTimes = await getTodayPrayers();
  const prayer =
    [
      PRAYERS.Fajr,
      PRAYERS.Dhuhr,
      PRAYERS.Asr,
      PRAYERS.Maghrib,
      PRAYERS.Isha
    ].find((key) => {
      const prayerTime = prayerTimes[key];
      return timeToDate(prayerTime) > new Date();
    }) || PRAYERS.Fajr;
  const time = prayerTimes[prayer];
  const remaining = getRemainingTime(time);
  return { prayer, time, remaining };
}

module.exports = {
  getMonthPrayers,
  getTodayPrayers,
  getNextPrayer
};
