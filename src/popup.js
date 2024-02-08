'use strict';

const { PRAYERS } = require('./constants');
const translate = require('./translations');
const { formatTime, countdown, timeToString } = require('./utils/datetime.fns');
// Services
const { getNextPrayer, getTodayPrayers } = require('./services/prayer.service');
const options = require('./services/options.service');
const { setCurrentPosition } = require('./services/geolocation.service');

// Global variables will be set in loadOptions()
var language, timeFormat;

/**
 * @private
 * @async
 * load options from storage
 * then set global variables
 */
async function loadOptions() {
  const opts = await options.get();
  language = opts.language;
  timeFormat = opts.timeFormat;
  document.documentElement.lang = language;
  document.body.dir = language === 'en' ? 'ltr' : 'rtl';
}

function hideSpinner() {
  document.getElementById('spinner-container').classList.add('hidden');
}

function showError(message) {
  document.getElementById('error').classList.remove('hidden');
  document.getElementById('error').innerText = `${message}`;
}

/**
 * @private
 * @async
 * update next prayer time
 * @param {{ [key: string]: string }} prayerTimes
 */
async function updateNextPrayer() {
  const { prayer, time } = await getNextPrayer();
  // show countdown timer
  countdown(time, ({ hours, minutes, seconds }) => {
    document.getElementById('next-prayer').innerHTML = `
      <div class="d-flex justify-content-center label">${translate(
        language,
        prayer
      )}</div>
      <div class="d-flex justify-content-center">${timeToString(
        hours,
        minutes,
        seconds
      )}</div>`;
  });
}

/**
 * @private
 * Generate HTML grid for prayer times
 * @param {{ [key: string]: string }} prayerTimes
 */
function updatePrayerTimes(prayerTimes) {
  document.getElementById('prayer-times').innerHTML = [
    PRAYERS.Fajr,
    PRAYERS.Sunrise,
    PRAYERS.Dhuhr,
    PRAYERS.Asr,
    PRAYERS.Maghrib,
    PRAYERS.Isha
  ]
    .map((key) => {
      const value = prayerTimes[key];
      return `
        <div class="row">
          <div class="col label">${translate(language, key)}</div>
          <div class="col time">${formatTime(value, timeFormat)}</div>
        </div>
      `;
    })
    .join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  // TODO: check geolocation permission with HTML handler
  // TODO: check internet connection with HTML handler
  try {
    await loadOptions();
    await setCurrentPosition();
    const prayerTimes = await getTodayPrayers();
    updatePrayerTimes(prayerTimes);
    updateNextPrayer();
    chrome.runtime.sendMessage({
      type: 'CREATE_ALARM'
    });
  } catch (err) {
    showError(err);
  }
  hideSpinner();
});
