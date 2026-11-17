const config = require('../config/config');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[config.logLevel] ?? 2;

const timestamp = () => new Date().toISOString();

module.exports = {
  error: (...args) => currentLevel >= 0 && console.error(`[${timestamp()}] ❌`, ...args),
  warn: (...args) => currentLevel >= 1 && console.warn(`[${timestamp()}] ⚠️`, ...args),
  info: (...args) => currentLevel >= 2 && console.log(`[${timestamp()}] ℹ️`, ...args),
  debug: (...args) => currentLevel >= 3 && console.log(`[${timestamp()}] 🐛`, ...args),
};
