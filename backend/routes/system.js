// routes/system.js
import express from 'express';
import { exec } from 'child_process';

const router = express.Router();

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

export default router;

