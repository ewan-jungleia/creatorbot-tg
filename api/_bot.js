const { Bot } = require('grammy');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  await ctx.reply('✅ Bot en ligne.');
});

bot.on('message', async (ctx) => {
  await ctx.reply('👋 Reçu.');
});

module.exports = bot;
