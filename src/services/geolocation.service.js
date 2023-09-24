const storage = require('./storage.service');
const { STORAGE } = require('../constants');

/**
 * @public
 * @async
 * Get current position of the user
 * @returns {Promise<{lat: number, long: number}>}
 */
async function getCurrentPosition() {
  const position = await storage.get(STORAGE.Position);
  return position || {};
}

/**
 * @public
 * @async
 * Set current position of the user
 * @returns {Promise<void>}
 */
async function setCurrentPosition() {
  let position = await storage.get(STORAGE.Position);
  if (position) return;
  position = await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        resolve({ latitude, longitude });
      }
    );
  });
  storage.set(STORAGE.Position, position);
}

module.exports = {
  setCurrentPosition,
  getCurrentPosition
};
