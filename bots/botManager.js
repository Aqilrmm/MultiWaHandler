const { Client, LocalAuth } = require('whatsapp-web.js');
const Session = require('../db/models/Session');
const path = require('path');
const messageHandler = require('../handlers/messageHandler');

const clients = {};
const qrcodes = {};

async function initClient(userId) {
  const authPath = path.join(__dirname, '../../sessions', userId);
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: authPath }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    qrcodes[userId] = qr; // Simpan QR untuk akses lewat API
    console.log(`🔐 [${userId}] QR tersedia`);
  });

  client.on('ready', () => {
    console.log(`✅ [${userId}] WA siap`);
  });

  client.on('message', (msg) => messageHandler(client, msg, userId));

  await client.initialize();
  clients[userId] = client;
  await Session.findOrCreate({ where: { userId } });
}

function getClient(userId) {
  return clients[userId];
}

function getQR(userId) {
  return qrcodes[userId] || null;
}

function getAllClients() {
  return Object.keys(clients);
}

module.exports = { initClient, getClient, getQR, getAllClients };
