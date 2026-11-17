require('dotenv').config();

module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  bot: {
    name: process.env.BOT_NAME || 'Smart Assistant',
    personality:
      process.env.BOT_PERSONALITY ||
      'You are a helpful, accurate assistant. Answer clearly and concisely.',
    maxHistory: parseInt(process.env.MAX_HISTORY_MESSAGES || '10', 10),
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    webhookUrl: process.env.WEBHOOK_URL || '',
  },
  whatsapp: {
    sessionPath: process.env.SESSION_PATH || './.wwebjs_auth',
    cachePath: process.env.CACHE_PATH || './.wwebjs_cache',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
