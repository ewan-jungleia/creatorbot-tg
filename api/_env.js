function required(name){const v=process.env[name];if(!v)throw new Error(`Missing env: ${name}`);return v;}
module.exports={
  TELEGRAM_BOT_TOKEN:required('TELEGRAM_BOT_TOKEN')
};
