// routes/setup.js

import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/setup', (req, res) => {
  const setupFile = path.resolve('config/setup.json');

  fs.readFile(setupFile, 'utf8', (err, data) => {
    if (err) {
      console.error('[Backend] ❌ Fehler beim Lesen der setup.json:', err);
      return res.status(500).json({ error: 'Setup-Datei konnte nicht geladen werden' });
    }

    try {
      const json = JSON.parse(data);
      return res.json(json);
    } catch (parseErr) {
      console.error('[Backend] ❌ Fehler beim Parsen der setup.json:', parseErr);
      return res.status(500).json({ error: 'Ungültiges JSON in setup.json' });
    }
  });
});

export default router;

