// Import library dan modul yang diperlukan
const { Client, LocalAuth } = require('whatsapp-web.js'); // Library utama untuk koneksi WhatsApp
const Session = require('../db/models/Session'); // Model database untuk menyimpan data session
const path = require('path');
const fs = require('fs');
const messageHandler = require('../handlers/messageHandler'); // (opsional) handler untuk pesan masuk, jika kamu pakai

// Objek untuk menyimpan data sementara di dalam aplikasi
const clients = {};   // Menyimpan instance client WhatsApp per userId
const qrcodes = {};   // Menyimpan QR code sementara per userId
const nomor = {};     // Menyimpan nomor WA yang terhubung per userId

/**
 * Inisialisasi WhatsApp client untuk user tertentu
 * Akan membuat folder session baru dan menyimpan client dalam memori
 */
async function initClient(userId) {
  // Cegah inisialisasi ulang jika client sudah aktif
  if (clients[userId]) {
    console.log(`⚠️ [${userId}] Client sudah ada, tidak akan dibuat ulang.`);
    return clients[userId];
  }
  const sessionDir = path.join(__dirname, '../../sessions', userId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  console.log(`🆕 [${userId}] Inisialisasi WA client...`);

  // Buat instance WhatsApp client dengan konfigurasi penyimpanan lokal
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '../../sessions', userId) }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  // Simpan dulu ke dalam clients sebelum event binding
  clients[userId] = client;

  // Event saat QR code baru muncul (untuk login WA)
  client.on('qr', (qr) => {
    console.log(`🔐 [${userId}] QR code baru diterima`);

    // Simpan QR code dan timestamp-nya
    qrcodes[userId] = {
      qr,
      generatedAt: Date.now()
    };

    // QR akan dianggap kadaluarsa setelah 1 menit
    setTimeout(() => {
      if (qrcodes[userId] && Date.now() - qrcodes[userId].generatedAt > 60000) {
        console.log(`⏱️ [${userId}] QR expired setelah 1 menit.`);
        delete qrcodes[userId];
      }
    }, 60000);
  });

  // Event saat client sudah siap digunakan
  client.on('ready', async () => {
    console.log(`✅ [${userId}] WhatsApp client siap.`);
    delete qrcodes[userId]; // Hapus QR dari memori karena sudah tidak diperlukan
    console.log(`❗ [${userId}] QrCode Sudah Dihapus dan user terdaftar: ${nomorHp}`);
    try {
      // Ambil informasi akun (seperti nomor WA)
      const info = client.info;
      const nomorHp = info.wid.user;
      nomor[userId] = { nomor: nomorHp, createdAt: Date.now() };
      console.log(`📱 [${userId}] Nomor HP: ${nomorHp}`);
    } catch (err) {
      console.error(`❗ [${userId}] Gagal mengambil nomor HP:`, err);
    }
  });

  // Event saat berhasil login (autentikasi sukses)
  client.on('authenticated', () => {
    console.log(`🔑 [${userId}] Berhasil login ke WhatsApp.`);
  });

  // Event saat login gagal
  client.on('auth_failure', msg => {
    console.log(`❌ [${userId}] Gagal login: ${msg}`);
  });

  // Event saat koneksi terputus
  client.on('disconnected', reason => {
    console.log(`⚡ [${userId}] Terputus: ${reason}`);
  });

  // Mulai client dan simpan session ke database
  try {
    await client.initialize();
    await Session.findOrCreate({ where: { userId } }); // Simpan session ke database
    clients[userId] = client;
    console.log(`📦 [${userId}] Client berhasil di-inisialisasi.`);
    return client;
  } catch (error) {
    console.error(`❌ [${userId}] Gagal inisialisasi:`, error);
    delete clients[userId]; // Hapus dari memori jika gagal
    throw error;
  }
}

/**
 * Ambil client WhatsApp aktif berdasarkan userId
 */
function getClient(userId) {
  return clients[userId];
}

/**
 * Ambil QR code saat ini untuk user tertentu (jika masih valid)
 */
function getQR(userId) {
  const qrInfo = qrcodes[userId];
  if (!qrInfo) return null;

  const expired = Date.now() - qrInfo.generatedAt > 60000;
  if (expired) return { expired: true };

  return { qr: qrInfo.qr };
}

/**
 * Ambil daftar semua client yang aktif
 */
function getAllClients() {
  return Object.keys(clients);
}

/**
 * Sinkronisasi dengan database: jika ada client di memori tapi tidak ada di DB, hapus
 */
async function syncWithDatabase() {
  console.log(`🔄 Sinkronisasi sesi dari database...`);

  const sessionsInDb = await Session.findAll(); // Ambil semua session di database
  const dbUserIds = sessionsInDb.map(s => s.userId);

  for (const userId of Object.keys(clients)) {
    if (!dbUserIds.includes(userId)) {
      console.log(`🗑️ [${userId}] Tidak ditemukan di DB. Menghentikan client & hapus session folder...`);
      clients[userId]?.destroy(); // Hentikan client
      delete clients[userId];
      delete qrcodes[userId];

      const folder = path.join(__dirname, '../../sessions', userId);
      fs.rmSync(folder, { recursive: true, force: true }); // Hapus folder session
    }
  }

  console.log(`✅ Sinkronisasi selesai. Active clients: ${Object.keys(clients).length}`);
}

/**
 * Ambil nomor WhatsApp yang terhubung untuk user tertentu
 */
function getNomor(userId) {
  return nomor[userId] || null;
}

// Export semua fungsi supaya bisa digunakan dari luar
module.exports = {
  initClient,
  getClient,
  getQR,
  getAllClients,
  syncWithDatabase,
  getNomor,
  qrcodes
};
