const express = require('express');
const router = express.Router();
const { getClient, getAllClients } = require('../bots/botManager');
const Session = require('../db/models/Session');
const path = require('path');
const fs = require('fs');

// ✅ Cek status aktif session berdasarkan userId
router.get('/:userId', (req, res) => {
  const client = getClient(req.params.userId);
  if (!client) {
    return res.status(200).json({ userId: req.params.userId, active: false });
  }

  res.status(200).json({ userId: req.params.userId, active: true });
});

// ✅ Ambil semua session yang aktif
router.get('/', (req, res) => {
  const activeClients = getAllClients();
  res.status(200).json({ activeSessions: activeClients });
});

// 🗑️ Hapus session berdasarkan userId
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const client = getClient(userId);
    
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: `Session ${userId} tidak ditemukan.` 
      });
    }

    // Hentikan client WhatsApp
    await client.destroy();

    // Hapus data dari database
    await Session.destroy({ where: { userId } });

    // Hapus folder session dari file system
    const sessionPath = path.join(__dirname, '../../sessions', userId);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    res.status(200).json({ 
      success: true, 
      message: `Session ${userId} berhasil dihapus.` 
    });
  } catch (error) {
    console.error(`❌ [${userId}] Error saat menghapus session:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Gagal menghapus session ${userId}.`, 
      error: error.message 
    });
  }
});

// 🧹 Hapus semua session
router.delete('/', async (req, res) => {
  try {
    const clients = getAllClients();

    // Hentikan semua client
    for (const userId of clients) {
      const client = getClient(userId);
      if (client) {
        await client.destroy();
      }
    }

    // Hapus semua data session dari database
    await Session.destroy({ where: {} });

    // Hapus semua folder session
    const sessionsPath = path.join(__dirname, '../../sessions');
    if (fs.existsSync(sessionsPath)) {
      fs.rmSync(sessionsPath, { recursive: true, force: true });
      fs.mkdirSync(sessionsPath); // Buat ulang folder kosong
    }

    res.status(200).json({ 
      success: true, 
      message: 'Semua session berhasil dihapus.' 
    });
  } catch (error) {
    console.error(`❌ Error saat menghapus semua session:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus semua session.', 
      error: error.message 
    });
  }
});

module.exports = router;
