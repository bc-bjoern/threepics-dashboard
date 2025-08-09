import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.join(__dirname, 'config');

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}
const credentialsPath = path.join(configDir, 'credentials.json');
// ensure credentials.json
if (!fs.existsSync(credentialsPath)) {
  console.log(`📄 Creating empty credentials.json at ${credentialsPath}`);
  fs.writeFileSync(credentialsPath, '{}\n', 'utf8');
} else {
  console.log(`✅ credentials.json already exists: ${credentialsPath}`);
}

await import('./watchers/credentials.js');

import express from 'express';
import cors from 'cors';

import mediaRouter from './routes/media.js';
import { startCronJob } from './jobs/cronjob.js';
import wifiRouter from './routes/wifi.js';
import credentialsRouter from './routes/credentials.js';
import messagesRouter from './routes/messages.js';
import systemRouter from './routes/system.js';
import setupRouter from './routes/setup.js';
import deviceRouter from './routes/device.js';
import rebootRoute from './routes/reboot.js';
import brightnessRouter from './routes/brightness.js';


import { startWatcher } from './watchers/watch-downloads.js';
import os from 'os';
import crypto from 'crypto';

const devicePath = path.join(__dirname, 'config', 'device.json');
if (!fs.existsSync(devicePath)) {
  const deviceData = {
    device_id: crypto.randomUUID?.() || String(Date.now()) + Math.random(),
    hostname: os.hostname(),
    created_at: new Date().toISOString()
  };
  fs.writeFileSync(devicePath, JSON.stringify(deviceData, null, 2), 'utf8');
  console.log('🆕 Generated device.json');
}

const downloadsPath = path.resolve(__dirname, 'downloads');
startWatcher(downloadsPath);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// router 
app.use('/api/device', deviceRouter);
app.use('/media', mediaRouter);
app.use('/api', wifiRouter);
app.use('/api', credentialsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/system', systemRouter);
app.use('/api', setupRouter);
app.use('/api', rebootRoute);
app.use('/api/system', brightnessRouter);

// Statischer Pfad korrekt mounten
app.use('/downloads', express.static(path.resolve(__dirname, 'downloads')));

// Cronjob starten
startCronJob();

app.listen(PORT, () => {
  console.log(`[Backend] Server läuft auf http://localhost:${PORT}`);
});
