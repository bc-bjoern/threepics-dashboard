import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';

const router = express.Router();
const brightnessFile = '/sys/class/backlight/rpi_backlight/brightness';

// GET: Prüft, ob Brightness-Datei existiert
router.get('/brightness/available', (req, res) => {
  const available = fs.existsSync(brightnessFile);
  res.json({ available });
});

function setBrightnessPermissions() {
  if (!fs.existsSync(brightnessFile)) {
    console.warn(`⚠️ brightness file ${brightnessFile} does not exist, chmod skipped`);
    return;
  }

  exec('command -v sudo', (error, stdout) => {
    if (error || !stdout.trim()) {
      console.warn('⚠️ sudo is not available, chmod skipped');
      return;
    }

    exec(`sudo chmod 777 ${brightnessFile}`, (err) => {
      if (err) {
        console.error('⚠️ chmod brightness failed:', err.message);
      } else {
        console.log('✅ brightness chmod 777 set');
      }
    });
  });
}

setBrightnessPermissions();

// GET aktuelle Helligkeit
router.get('/brightness', (req, res) => {
  try {
    const value = fs.readFileSync(brightnessFile, 'utf-8');
    res.json({ brightness: parseInt(value.trim(), 10) });
  } catch (err) {
    console.error('⚠️ Cant read brightness:', err.message);
    res.status(500).json({ error: 'Cannot read brightness' });
  }
});

// POST neue Helligkeit setzen
router.post('/brightness', express.json(), (req, res) => {
  const value = parseInt(req.body.value);
  if (isNaN(value) || value < 0 || value > 255) {
    return res.status(400).json({ error: 'Invalid brightness value' });
  }

  // Sicherheits-Absicherung: sanitisiertes Schreiben über tee
  const cmd = `echo ${value} | sudo tee ${brightnessFile}`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('⚠️ Brightness write failed:', stderr || err.message);
      return res.status(500).json({ error: 'Write failed' });
    }
    res.json({ success: true, value });
  });
});

export default router;
