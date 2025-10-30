const { Bot, InlineKeyboard } = require('grammy');
const { TELEGRAM_BOT_TOKEN } = require('./_env');

const bot = new Bot(TELEGRAM_BOT_TOKEN);

bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard()
    .text('Nouveau projet', 'new_project').row()
    .text('Aide', 'help');
  await ctx.reply('Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?', { reply_markup: kb });
});

bot.callbackQuery('help', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('✅ Bot en ligne (réponse directe).');
});

bot.callbackQuery('new_project', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('1/5 • Envoie le titre du projet (un seul message).');
});

bot.on('message', async (ctx) => {
  if (ctx.chat?.type === 'private' && !ctx.message.text?.startsWith('/')) {
    await ctx.reply('👋 Reçu.');
  }
});

module.exports = { bot };
