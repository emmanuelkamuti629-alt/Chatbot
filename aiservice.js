const OpenAI = require('openai');
const NodeCache = require('node-cache');
const config = require('../config/config');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: config.openai.apiKey });

// Cache conversation history per chat for 1 hour
const historyCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Build the system prompt that shapes bot behavior.
 */
function buildSystemPrompt() {
  return `${config.bot.personality}

Rules:
- Be concise (WhatsApp style). Use short paragraphs, emojis sparingly.
- If the user writes in a specific language, reply in the same language.
- Never invent facts. If unsure, ask a clarifying question.
- Stay on topic; politely decline unrelated requests.
- Format replies for readability (bullets when listing).`;
}

/**
 * Get conversation history for a chat.
 */
function getHistory(chatId) {
  return historyCache.get(chatId) || [];
}

/**
 * Append a message to history and trim to max.
 */
function appendHistory(chatId, role, content) {
  const history = getHistory(chatId);
  history.push({ role, content });
  const trimmed = history.slice(-config.bot.maxHistory * 2); // pairs
  historyCache.set(chatId, trimmed);
}

/**
 * Generate a relevant reply using OpenAI with retry logic.
 * @param {string} chatId - unique chat identifier
 * @param {string} userMessage - the incoming message text
 * @returns {Promise<string>} - bot reply text
 */
async function generateReply(chatId, userMessage) {
  if (!userMessage || !userMessage.trim()) {
    return "I didn't catch that — could you rephrase? 🙂";
  }

  appendHistory(chatId, 'user', userMessage);

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...getHistory(chatId),
  ];

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages,
        max_tokens: config.openai.maxTokens,
        temperature: config.openai.temperature,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      const reply =
        response.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn't generate a reply. Please try again.";

      appendHistory(chatId, 'assistant', reply);
      return reply;
    } catch (err) {
      logger.warn(`OpenAI attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) {
        logger.error('OpenAI failed after retries:', err);
        return "⚠️ I'm having trouble connecting right now. Please try again in a moment.";
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * Clear conversation for a chat.
 */
function clearHistory(chatId) {
  historyCache.del(chatId);
}

module.exports = { generateReply, clearHistory, getHistory };
