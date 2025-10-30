import { Bot, InlineKeyboard } from 'grammy';
import { env } from './utils/env';
import { logger } from './utils/logger';

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command('start', async (ctx) => {
  const kb = new InlineKeyboard()
    .text('Nouveau projet', 'new_project')
    .row()
    .text('Aide', 'help');
  await ctx.reply('Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?', { reply_markup: kb });
});

bot.callbackQuery('help', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('Flow: 1) Titre 2) Budget STOP 3) Alerte 4) Prompt 5) Fichiers 6) Analyse 7) Validation 8) Secrets 9) Dev/Tests 10) Livraison 11) Vérif finale');
});

bot.callbackQuery('new_project', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('Envoie le titre du projet en un message.');
});

bot.catch((err) => {
  logger.error({ err }, 'Bot error');
});
