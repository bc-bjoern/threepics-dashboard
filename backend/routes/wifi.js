import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/save-wifi', (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid) {
    return res.status(400).json({ error: 'SSID fehlt' });
  }

  const wifiData = { ssid, password };

  const filePath = path.join(__dirname, '../config/', 'wlan.json');
  fs.writeFile(filePath, JSON.stringify(wifiData, null, 2), (err) => {
    if (err) {
      console.error('Fehler beim Schreiben der wlan.json:', err);
      return res.status(500).json({ error: 'Speichern fehlgeschlagen' });
    }
    res.json({ message: 'WLAN-Daten gespeichert' });
  });
});

export default router;
