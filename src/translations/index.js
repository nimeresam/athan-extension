// const options = require('../services/options.service');

/**
 * @public
 * Translate key to current language
 * @param {string} language
 * @param {string} key
 * @param  {...string} replacements
 * @returns {Promise<string>}
 */
module.exports = function translate(language, key, ...replacements) {
  const translations = require(`./${language}.json`);
  const translation = translations[key];
  if (!translation) return key;
  if (!replacements?.length) return translation;
  return replacements.reduce(
    (translation, replacement) => translation.replace('%s', replacement),
    translation
  );
};
