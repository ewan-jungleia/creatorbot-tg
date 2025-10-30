const { Bot } = require('grammy');
const env = require('./_env');
const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
bot.on('message', async (ctx) => { await ctx.reply('✅ Bot en ligne.'); });
module.exports = bot;
