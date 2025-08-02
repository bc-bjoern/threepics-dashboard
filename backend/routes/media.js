import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.resolve(__dirname, '../downloads');

router.get('/', (req, res) => {
  console.log('[Backend] GET /media called');

  const media = [];

  try {
    const imagesDir = path.join(MEDIA_DIR, 'images');
    const videosDir = path.join(MEDIA_DIR, 'videos');

    function listFiles(dir) {
      if (!fs.existsSync(dir)) {
        console.log(`[Backend] Verzeichnis nicht gefunden: ${dir}`);
        return [];
      }
      return fs.readdirSync(dir).map(file => path.join(dir, file));
    }

    const images = listFiles(imagesDir).map(f => ({ type: 'image', path: f }));
    const videos = listFiles(videosDir).map(f => ({ type: 'video', path: f }));

    media.push(...images, ...videos);

    // console.log(`[Backend] Gefundene Medien: ${media.length}`);
    // media.forEach(m => console.log(m)); 

    const mediaForClient = media.map(m => {
      const relativePath = path.relative(MEDIA_DIR, m.path).replace(/\\/g, '/');
      const baseName = path.basename(m.path, path.extname(m.path));
      const textFilePath = path.join(MEDIA_DIR, 'texts', `${baseName}.txt`);

      let subtitle = '';
      if (fs.existsSync(textFilePath)) {
        const raw = fs.readFileSync(textFilePath, 'utf-8');
        const lines = raw.split('\n');
        const textIndex = lines.indexOf('[Text]');
        if (textIndex !== -1) {
          const endIndex = lines.findIndex(
          (line, idx) => idx > textIndex && line.startsWith('[')
        );
        subtitle = lines
          .slice(textIndex + 1, endIndex === -1 ? lines.length : endIndex)
          .join('\n')
          .trim();
        }
      }

      return {
        type: m.type,
        url: '/downloads/' + relativePath,
        subtitle,
      };
    });

    // console.log('URLs für Client:');
    // mediaForClient.forEach(m => console.log(m));

    res.json(mediaForClient);
  } catch (err) {
    console.error('[Backend] Fehler beim Lesen der Medien:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Medien' });
  }
});

router.delete('/', (req, res) => {
  const { url } = req.body;  // z.B. '/downloads/images/bild1.jpg'

  if (!url) {
    return res.status(400).json({ error: 'Keine URL angegeben' });
  }

  // Pfad auf Server ermitteln (safe!)
  const filePath = path.join(MEDIA_DIR, url.replace('/downloads/', ''));

  if (!filePath.startsWith(MEDIA_DIR)) {
    return res.status(400).json({ error: 'Ungültiger Dateipfad' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('[Backend] Fehler beim Löschen der Datei:', err);
      return res.status(500).json({ error: 'Datei konnte nicht gelöscht werden' });
    }

    console.log(`[Backend] Datei gelöscht: ${filePath}`);
    res.json({ message: 'Datei erfolgreich gelöscht' });
  });

  // inside your router.delete handler, after file deletion success:
  const filename = path.basename(filePath); // get just the filename with extension

  execFile('python3', ['scripts/mark_to_delete.py', filename], (error, stdout, stderr) => {
    if (error) {
      console.error('Error running mark_to_delete.py:', error);
      return; // or handle error
    }
    console.log('mark_to_delete.py output:', stdout);
  });
});

export default router;
