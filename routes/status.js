const express = require('express');
const router = express.Router();
const { getClient, getAllClients } = require('../bots/botManager');

router.get('/:userId', (req, res) => {
  const client = getClient(req.params.userId);
  if (!client) return res.json({ active: false });

  res.json({ active: true });
});

router.get('/', (req, res) => {
  res.json({ activeSessions: getAllClients() });
});

module.exports = router;
