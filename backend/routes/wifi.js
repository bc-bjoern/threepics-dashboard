import express from 'express';
import { exec } from 'child_process';
import { execFile } from 'child_process';

const router = express.Router();

/**
 * Ermittelt das erste verfügbare WLAN-Interface (z. B. wlan0)
 */
function getWifiInterface(callback) {
  exec('nmcli -t -f DEVICE,TYPE device', (err, stdout, stderr) => {
    if (err) {
      console.error('[WIFI] Fehler beim Auslesen der Interfaces:', stderr);
      return callback(new Error('Konnte Netzwerk-Interfaces nicht abrufen'));
    }

    const lines = stdout.split('\n');
    for (const line of lines) {
      const [device, type] = line.split(':');
      if (type === 'wifi' && device) {
        console.log(`[WIFI] WLAN-Interface gefunden: ${device}`);
        return callback(null, device);
      }
    }

    callback(new Error('Kein WLAN-Interface gefunden'));
  });
}

/**
 * Gibt verfügbare WLAN-Netzwerke zurück
 */
router.get('/wifi', (req, res) => {
  getWifiInterface((err, iface) => {
    if (err) return res.status(500).json({ error: err.message });

    const cmd = `nmcli -t -f SSID,SIGNAL device wifi list ifname ${iface}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('[WIFI] Fehler beim Abrufen der WLANs:', stderr);
        return res.status(500).json({ error: 'WLAN-Suche fehlgeschlagen' });
      }

      const networks = stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [ssid, signal] = line.split(':');
          return { ssid, signal: Number(signal) };
        });

      res.json(networks);
    });
  });
});

/**
 * Verbindet sich mit dem gewünschten WLAN
 */
router.post('/wifi/connect', (req, res) => {
  const { ssid, password } = req.body;

  if (!ssid || !password) {
    return res.status(400).json({ error: 'SSID und Passwort sind erforderlich' });
  }

  getWifiInterface((err, iface) => {
    if (err) return res.status(500).json({ error: err.message });

    const args = ['nmcli', 'device', 'wifi', 'connect', ssid, 'password', password, 'ifname', iface];
    execFile('sudo', args, (err, stdout, stderr) => {
      if (err) {
        console.error(`[WIFI] Verbindungsfehler mit "${ssid}":`, stderr);
        return res.status(500).json({ error: stderr.trim() });
      }

      console.log(`[WIFI] Erfolgreich verbunden mit "${ssid}"`);
      res.json({ message: `Erfolgreich verbunden mit "${ssid}"` });
    });

  });
});

/**
 * Führt einen frischen WLAN-Scan durch und listet alle verfügbaren Netzwerke
 */
router.get('/wifi/scan', (req, res) => {
  getWifiInterface((err, iface) => {
    if (err) return res.status(500).json({ error: err.message });

    // Frischen Scan anstoßen
    const scanCmd = `sudo nmcli device wifi rescan ifname ${iface}`;
    exec(scanCmd, (err) => {
      if (err) {
        console.error('[WIFI] Fehler beim Rescan:', err);
        return res.status(500).json({ error: 'Scan fehlgeschlagen' });
      }

      // Danach Liste abrufen
      const listCmd = `nmcli -t -f SSID,SIGNAL device wifi list ifname ${iface}`;
      exec(listCmd, (err, stdout, stderr) => {
        if (err) {
          console.error('[WIFI] Fehler beim Abrufen der WLANs:', stderr);
          return res.status(500).json({ error: 'WLAN-Suche fehlgeschlagen' });
        }

        const networks = stdout
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const [ssid, signal] = line.split(':');
            return { ssid, signal: Number(signal) };
          });

        res.json(networks);
      });
    });
  });
});


export default router;

