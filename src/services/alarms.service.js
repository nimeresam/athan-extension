const { ALARMS, STORAGE } = require('../constants');
const { timeToDate } = require('../utils/datetime.fns');
const badge = require('../utils/badge.fns');
const translate = require('../translations');
const options = require('./options.service');
// Services
const { getNextPrayer } = require('./prayer.service');
const storage = require('./storage.service');

/**
 * @private
 * @async
 * setup prayer alarm alarm
 * should be called on mount or right after prayer time
 */
async function setupPrayerAlarm() {
  const { prayer, time } = await getNextPrayer();
  const when = timeToDate(time);
  await storage.set(STORAGE.NextPrayer, prayer);
  console.log('[setupPrayerAlarm]', { prayer, when: when.toISOString() });
  chrome.alarms.create(ALARMS.PrayerTime, { when: when.getTime() });
  setupBeforePrayerAlarm();
}

/**
 * @protected
 * @async
 * on prayer time callback
 * used to trigger notification
 */
async function onPrayerTime() {
  console.log('[onPrayerTime]');
  const { language, notifications } = await options.get();
  if (notifications.enabled) {
    const prayer = await storage.get(STORAGE.NextPrayer);
    const translatedPrayer = translate(language, prayer);
    chrome.notifications.create(ALARMS.PrayerTime, {
      type: 'basic',
      iconUrl: '/icons/icon_128.png',
      title: translate(language, 'NOTIFICATION_TITLE', translatedPrayer),
      message: translate(
        language,
        'NOTIFICATION_DESCRIPTION',
        translatedPrayer
      ),
      silent: false
    });
  }
  badge.clearText();
  chrome.alarms.clear(ALARMS.BeforePrayerTime);
  chrome.alarms.clear(ALARMS.UpdateBadgeEveryMinute);
  setTimeout(() => setupPrayerAlarm(), 60000);
}

/**
 * @private
 * @async
 * setup before prayer alarm
 * should be called on setup prayer alarm
 */
async function setupBeforePrayerAlarm() {
  const { time, remaining } = await getNextPrayer();
  if (remaining.hours === 0 && remaining.minutes <= 15) {
    console.log(
      '[setupBeforePrayerAlarm]',
      `with in ${remaining.minutes} minutes`
    );
    onBeforePrayerAlarm(remaining.minutes);
  } else {
    const when = timeToDate(time);
    when.setMinutes(when.getMinutes() - 15);
    console.log('[setupBeforePrayerAlarm]', when.toISOString());
    chrome.alarms.create(ALARMS.BeforePrayerTime, { when: when.getTime() });
  }
}

/**
 * @protected
 * on before prayer time callback
 * used to trigger showing remaining minutes on badge
 * @param {number} [remaining=15] just on mount
 */
function onBeforePrayerAlarm(remaining = 15) {
  console.log('[onBeforePrayerAlarm]', `remaining: ${remaining} minutes`);
  badge.setText(remaining);
  chrome.alarms.create(ALARMS.UpdateBadgeEveryMinute, {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
}

/**
 * @protected
 * @async
 * on every minute before prayer callback
 * called with in 15 minutes before prayer
 * used to show remaining minutes on badge
 */
async function onEveryMinuteBeforePrayer() {
  let text = await badge.getText();
  text = parseInt(text) - 1;
  console.log('[onEveryMinuteBeforePrayer]', `remaining: ${text} minutes`);
  if (text >= 0) {
    badge.setText(text);
  }
}

/**
 * @public
 * @async
 * clear previous alarms and setup new ones
 * should be called on mount
 */
async function setupAlarms() {
  chrome.alarms.clearAll();
  badge.clearText();
  setupPrayerAlarm();
}

module.exports = {
  setupAlarms,
  callbacks: {
    [ALARMS.PrayerTime]: onPrayerTime,
    [ALARMS.BeforePrayerTime]: onBeforePrayerAlarm,
    [ALARMS.UpdateBadgeEveryMinute]: onEveryMinuteBeforePrayer
  }
};
