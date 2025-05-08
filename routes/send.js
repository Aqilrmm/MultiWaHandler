const express = require('express');
const router = express.Router();
const { getClient } = require('../bots/botManager');

router.post('/', async (req, res) => {
  const { userId, number, message } = req.body;
  if (!userId || !number || !message) {
    return res.status(400).json({ error: 'userId, number, dan message wajib diisi' });
  }

  const client = getClient(userId);
  if (!client) return res.status(404).json({ error: 'Session tidak ditemukan' });

  try {
    const formatted = number.includes('@c.us') ? number : `${number}@c.us`;
    await client.sendMessage(formatted, message);
    res.json({ success: true, message: 'Pesan terkirim' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
