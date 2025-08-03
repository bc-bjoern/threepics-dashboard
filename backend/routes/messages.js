import express from 'express';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const messagesDir = path.join(__dirname, '../downloads', 'messages');

// Alle Nachrichten-Dateien abrufen
router.get('/', (req, res) => {
  fs.readdir(messagesDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Fehler beim Lesen des Nachrichtenverzeichnisses.' });

    const txtFiles = files.filter(file => file.endsWith('.txt')).sort();
    res.json(txtFiles);
  });
});

// Eine einzelne Nachricht abrufen
router.get('/:filename', (req, res) => {
  const filePath = path.join(messagesDir, req.params.filename);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Nachricht nicht gefunden.' });

    // Entferne die Zeile mit [Text] am Anfang
    const lines = data.split('\n');
    if (lines[0].trim() === '[Text]') {
      lines.shift(); // erste Zeile entfernen
    }
    const cleanedText = lines.join('\n').trim();

    res.json({ filename: req.params.filename, text: cleanedText });
  });
});

// Eine Nachricht löschen
router.delete('/:filename', (req, res) => {
  const filePath = path.join(messagesDir, req.params.filename);

  fs.unlink(filePath, err => {
    if (err) return res.status(404).json({ error: 'Nachricht konnte nicht gelöscht werden.' });

    res.json({ success: true });
  });
});

export default router;
