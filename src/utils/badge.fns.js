/**
 * @public
 * @async
 * Get badge text
 * @returns {Promise<string>}
 */
function getText() {
  return new Promise((resolve) => {
    chrome.action.getBadgeText({}, resolve);
  });
}

/**
 * Set badge text
 * @param {string} text
 * @param {'info' | 'warn' | 'error'} level
 */
function setText(text, level = 'info') {
  // TODO: set badge color based on level
  chrome.action.setBadgeText({ text: text.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#a13c51' });
}

/**
 * Clear badge text
 */
function clearText() {
  chrome.action.setBadgeText({ text: '' });
}

module.exports = {
  getText,
  setText,
  clearText
};
