const { STORAGE, DEFAULT_OPTIONS } = require('../constants');
const storage = require('./storage.service');

/**
 * @public
 * @async
 * Load options from chrome storage
 * @returns {Promise<{}>}
 */
async function get() {
  let options = await storage.get(STORAGE.Options);
  return options || DEFAULT_OPTIONS;
}

module.exports = {
  get
};
