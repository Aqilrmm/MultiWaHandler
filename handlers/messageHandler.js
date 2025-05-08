const axios = require('axios');

module.exports = async (client, msg, userId) => {
  console.log(`📩 [${userId}] ${msg.from}: ${msg.body}`);

  try {
    await axios.post('http://sc-machine:80', {
      number: msg.from,
      message: msg.body
    });
    console.log('✅ Terkirim ke PHP');
  } catch (err) {
    console.error('❌ Gagal kirim:', err.message);
  }

  if (msg.body.toLowerCase() === 'halo') {
    msg.reply('Hai! Ada yang bisa dibantu?');
  }
};
