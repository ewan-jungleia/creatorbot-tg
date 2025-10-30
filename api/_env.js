function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}
module.exports = {
  TELEGRAM_BOT_TOKEN: required('TELEGRAM_BOT_TOKEN'),
  OPENAI_API_KEY:     required('OPENAI_API_KEY'),
  WEBHOOK_SECRET:     required('WEBHOOK_SECRET'),
  ADMIN_TELEGRAM_ID:  required('ADMIN_TELEGRAM_ID'),
  SUPABASE_URL:       required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_STORAGE_BUCKET:   required('SUPABASE_STORAGE_BUCKET'),
};
