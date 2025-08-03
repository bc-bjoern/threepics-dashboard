import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const deviceFile = path.resolve('config/device.json');

router.get('/', (req, res) => {
  try {
    const data = fs.readFileSync(deviceFile, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Device info not available' });
  }
});

export default router;

