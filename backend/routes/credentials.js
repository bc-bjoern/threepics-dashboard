import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const router = express.Router();

// __dirname für ESM definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/save-credentials', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort sind erforderlich.' });
  }

  try {
    // Django Login Endpoint aufrufen
    const response = await axios.post('https://three-pics.com/api/login/', { email, password }, {
      headers: { 'Content-Type': 'application/json', "Accept-Encoding": "gzip" }
    });

    const { client_id, client_secret } = response.data;

    // Ordner config prüfen und ggf. anlegen
    const configDir = path.join(__dirname, '../config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Pfad für die credentials.json
    const credentialsPath = path.join(configDir, 'credentials.json');

    // JSON schreiben
    fs.writeFileSync(credentialsPath, JSON.stringify({ client_id, client_secret }, null, 2));

    console.log('[Backend] Credentials gespeichert:', credentialsPath);

    res.json({ message: 'Credentials erfolgreich gespeichert.', client_id, client_secret });
  } catch (error) {
    console.error('[Backend] Fehler beim Login bei Django:', error.response?.data || error.message);
    res.status(500).json({ error: 'Fehler beim Login oder Speichern der Credentials.' });
  }
});

export default router;
