import { Telegraf, Markup, Composer } from 'telegraf';

import db, { saveUser, isUserAdmin, toggleUserAdmin } from './db.js';

const { BOT_TOKEN, APP_URL } = process.env;

if (!BOT_TOKEN) {
  throw new Error('"BOT_TOKEN" env var is required!');
}

if (!APP_URL) {
  throw new Error('"APP_URL" env var is required!');
}

const bot = new Telegraf(BOT_TOKEN);

bot.start(ctx => {
  saveUser({ id: ctx.from.id, isAdmin: false });

  return ctx.reply('👋', Markup.inlineKeyboard([
    Markup.button.webApp('Open', `${APP_URL}/bot-hello?name=${ctx.from.first_name}`),
  ]));
});

bot.command('adminhello', Composer.acl(
  (ctx) => isUserAdmin(ctx.from.id),
  async (ctx) => {
    try {
      const { payload } = ctx;
      const firstSpaceIndex = payload.indexOf(' ');

      if (firstSpaceIndex === -1) {
        throw new Error('Not valid input. Example: "<telegram_id> <text>"');
      }

      const id = payload.slice(0, firstSpaceIndex);
      const text = payload.slice(firstSpaceIndex);

      await ctx.telegram.sendMessage(id, text);
    } catch (error) {
      if (error?.response?.error_code) {
        return ctx.reply(error.response.description);
      }

      return ctx.reply(error.message || 'Oops! Something went wrong...');
    }
  },
));

// only for demo purposes
bot.command('admintoggle', (ctx) => {
  const isAdmin = toggleUserAdmin(ctx.from.id);

  return ctx.reply(`Done, ${isAdmin ? 'you are Admin!' : 'you are NOT Admin!'}`);
});

bot.launch();

process.once('exit', () => db.close());
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));