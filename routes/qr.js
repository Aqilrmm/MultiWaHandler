const express = require('express');
const router = express.Router();
const { initClient, getQR } = require('../bots/botManager');

router.post('/', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId wajib diisi' });

  try {
    await initClient(userId);
    res.json({ message: 'Client inisialisasi, silakan ambil QR melalui /get-qr/:userId' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', (req, res) => {
  const qr = getQR(req.params.userId);
  if (!qr) return res.status(404).json({ error: 'QR tidak ditemukan atau sudah login' });

  res.json({ qr });
});

module.exports = router;
