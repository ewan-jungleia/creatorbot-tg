const { supabase } = require('./_db');

module.exports = async (req, res) => {
  try {
    const { error } = await supabase.from('sessions').select('id').limit(1);
    if (error && !/does not exist/i.test(error.message)) {
      return res.status(200).json({ ok: false, error: error.message });
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e) });
  }
};
