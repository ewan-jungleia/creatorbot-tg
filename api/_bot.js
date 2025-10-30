const { Bot, InlineKeyboard } = require('grammy');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Bot(token);

// /start
bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard().text('Nouveau projet', 'new_project').row().text('Aide', 'help');
  await ctx.reply('Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?', { reply_markup: kb });
});

// Aide
bot.callbackQuery('help', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('Flow: 1) Titre 2) Budget STOP 3) Alerte 4) Prompt 5) Fichiers 6) Analyse 7) Validation 8) Secrets 9) Dev/Tests 10) Livraison 11) Vérif finale');
});

// Début du flux (on demandera le titre)
bot.callbackQuery('new_project', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('1/5 • Envoie le *titre du projet* en un message.', { parse_mode: 'Markdown' });
});

bot.on('message', async (ctx) => {
  // Réponse par défaut si hors flux
  await ctx.reply('👋 Reçu.');
});

module.exports = bot;
