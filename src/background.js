'use strict';
global.options = require('./constants').DEFAULT_OPTIONS;

// Services
const alarms = require('./services/alarms.service');

alarms.setupAlarms();

chrome.alarms.onAlarm.addListener(function (alarm) {
  const callback = alarms.callbacks[alarm.name];
  if (callback) callback();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // switch (request.type) {
  // }
  return true;
});
