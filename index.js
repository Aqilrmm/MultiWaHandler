require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const Session = require('./db/models/Session');

const app = express();
app.use(bodyParser.json());

app.use('/send-message', require('./routes/send'));
app.use('/init-wa', require('./routes/qr'));
app.use('/get-qr', require('./routes/qr'));
app.use('/session-status', require('./routes/status'));

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log('🗃️ Database siap');
  app.listen(PORT, () => {
    console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  });
});
