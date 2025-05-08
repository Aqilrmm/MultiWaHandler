require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const Session = require('./db/models/Session');
const { syncWithDatabase } = require('./bots/botManager');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/send-message', require('./routes/send'));
app.use('/init-wa', require('./routes/qr'));        // Untuk inisialisasi WA
app.use('/get-qr', require('./routes/qr'));         // Untuk ambil QR
app.use('/session-status', require('./routes/status'));
app.use('/qr-page', require('./routes/qrPage'));    // (jika ada HTML untuk scan)

// DB Sync dan Server Start
console.log('🚀 Starting WhatsApp bot server...');
sequelize.sync().then(() => {
  console.log('🗃️ Database siap. Sinkronisasi sesi...');
  syncWithDatabase();

  app.listen(PORT, () => {
    console.log(`🌐 Server berjalan di http://localhost:${PORT}`);
  });
});

