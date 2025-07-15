// routes/system.js
import express from 'express';
import { exec } from 'child_process';
import os from 'os';
import dns from 'dns';

const router = express.Router();

// Internet-Verbindungsprüfung
router.get('/online', (req, res) => {
  dns.lookup('google.com', (err) => {
    if (err && err.code === 'ENOTFOUND') {
      return res.json({ online: false });
    } else {
      return res.json({ online: true });
    }
  });
});

// Reboot-Route
router.post('/reboot', (req, res) => {
  exec('sudo reboot', (err, stdout, stderr) => {
    if (err) {
      console.error('[System] Fehler bei reboot:', stderr);
      return res.status(500).send('Fehler beim Neustart');
    }
    res.send('System-Neustart wurde ausgelöst.');
  });
});

// Service-Neustart-Route
router.post('/restart-services', (req, res) => {
  const command = 'sudo systemctl restart threepics-frontend.service && sudo systemctl restart getty@tty1.service';

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error('[System] Fehler beim Dienst-Neustart:', stderr);
      return res.status(500).send('Fehler beim Dienst-Neustart');
    }
    res.send('Dienste wurden erfolgreich neugestartet.');
  });
});

router.get('/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let ip = 'Unbekannt';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
  }

  res.json({ ip });
});


export default router;

