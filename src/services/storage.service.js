/**
 * @public
 * @async
 * Get value from chrome storage
 * @param {string} key
 * @returns {Promise<any>}
 */
const get = (key) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      if (result[key]) return resolve(result[key]);
      resolve(null);
    });
  });
};

/**
 * @public
 * Set value in chrome storage
 * @param {string} key
 * @param {any} value
 */
const set = (key, value) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve();
    });
  });
};

module.exports = {
  get,
  set
};
