/**
 * @public
 * Get today date in YYYY-MM-DD format
 * @returns {string}
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * @public
 * Convert date from DD-MM-YYYY to YYYY-MM-DD
 * @param {string} date like 09-01-2021
 * @returns ISO date like 2021-01-09
 */
function getISODate(date) {
  return date.split('-').reverse().join('-');
}

/**
 * @public
 * Convert time from HH:MM to Date
 * @param {string} time
 * @returns {Date}
 */
function timeToDate(time) {
  const today = getTodayDate();
  return new Date(`${today} ${time}`);
}

/**
 * @public
 * Get remaining time for next prayer
 * @param {string} time
 * @returns {{ hours: number, minutes: number }} remaining time
 */
function getRemainingTime(time) {
  const remaining = timeToDate(time) - new Date();
  const seconds = Math.floor((remaining / 1000) % 60);
  const minutes = Math.floor((remaining / 1000 / 60) % 60);
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds, remaining };
}

/**
 * @public
 * Format time to 12h format
 * @param {string} time format HH:MM
 * @param {'24h' | '12h'} format
 * @returns
 */
function formatTime(time, format = '24h') {
  const [match] = time.match(/(\d{2}):(\d{2})/);
  const [hours, minutes] = match.split(':');
  if (format === '24h') return timeToString(hours, minutes);
  const hours12 = hours % 12 || 12;
  return timeToString(hours12, minutes);
}

/**
 * @public
 * Execute callback every second until time is up
 * @param {string} time format HH:MM
 * @param {({ hours, minutes, seconds }) => {}} callback
 */
function countdown(time, callback) {
  const { hours, minutes, seconds, remaining } = getRemainingTime(time);
  if (remaining >= 0) {
    callback({ hours, minutes, seconds });
    setTimeout(() => countdown(time, callback), 1000);
  }
}

/**
 * @public
 * Convert time to string
 * @param {number} hours
 * @param {number} minutes
 * @param {number} [seconds]
 * @returns time string like 09:01:00
 */
function timeToString(hours, minutes, seconds) {
  hours = hours.toString().padStart(2, 0);
  minutes = minutes.toString().padStart(2, 0);
  if (seconds !== undefined) seconds = seconds.toString().padStart(2, 0);
  return `${hours}:${minutes}` + (seconds !== undefined ? `:${seconds}` : '');
}

module.exports = {
  getTodayDate,
  getISODate,
  timeToDate,
  getRemainingTime,
  formatTime,
  countdown,
  timeToString
};
