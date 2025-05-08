// Import modul yang dibutuhkan
const express = require('express');
const router = express.Router();
const { initClient, getQR, qrcodes } = require('../bots/botManager'); // Import fungsi dari botManager.js

// ============================
// Endpoint POST / (inisialisasi client WhatsApp)
// ============================
router.post('/', async (req, res) => {
  const { userId } = req.body;

  // Cek apakah userId dikirim
  if (!userId) return res.status(400).json({ error: 'userId wajib diisi' });

  try {
    // Panggil fungsi untuk inisialisasi client WhatsApp
    await initClient(userId);

    // Tunggu QR code muncul, maksimal 5 detik (loop 10x @500ms)
    let attempts = 0;
    while (!qrcodes[userId] && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    // Jika QR tersedia, kirimkan informasi QR endpoint
    if (qrcodes[userId]) {
      res.json({ 
        message: 'Client diinisialisasi',
        qrAvailable: true,
        qrEndpoint: `/get-qr/${userId}`,   // endpoint untuk ambil QR-nya
        qrPage: `/qr-page/${userId}`       // (opsional) kalau kamu punya halaman web QR
      });
    } else {
      // QR tidak tersedia dalam waktu 5 detik
      res.json({ 
        message: 'Client diinisialisasi tapi QR belum tersedia, coba refresh',
        qrAvailable: false
      });
    }

  } catch (err) {
    console.error('❌ Error initializing client:', err);
    res.status(500).json({ error: err.message });
  }
});


// ============================
// Endpoint GET /:userId (ambil QR Code berdasarkan userId)
// ============================
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  // Ambil QR code dari memori
  const qr = getQR(userId);

  if (!qr) {
    // Tidak ada QR (mungkin user sudah login atau tidak ditemukan)
    return res.status(404).json({ error: 'QR tidak ditemukan atau sudah login' });
  }

  if (qr.expired) {
    // QR sudah kadaluarsa (lebih dari 1 menit)
    return res.status(410).json({ error: 'QR expired' });
  }

  // Kirimkan QR code dalam format JSON
  res.json(qr);
});

module.exports = router;
