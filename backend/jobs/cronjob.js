// cronjob.js
import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname definieren für ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..');
let pythonExecutable = path.join(backendRoot, '.venv', 'bin', 'python3');
if (!fs.existsSync(pythonExecutable)) {
  console.warn('[Python Path] ⚠️ .venv nicht gefunden – verwende System-python3');
  pythonExecutable = 'python3';
}

const getAllScriptPath = path.join(backendRoot, 'scripts', 'get_all.py');
const getSetupScriptPath = path.join(backendRoot, 'scripts', 'get_setup.py');
const configPath = path.join(backendRoot, 'config', 'setup.json');

// Hilfsfunktion zum Laden der Konfigurationsdatei
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    console.warn(`[Cronjob] ⚠️ setup.json fehlt (${configPath})`);
    return null;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Cronjob] Fehler beim Laden von setup.json:', err);
    return null;
  }
}

// Dynamischer Loop für get_all.py
function startGetAllLoop() {
  const config = loadConfig();
  if (!config) {
    console.warn('[get_all Loop] Kein gültiges setup.json gefunden. Überspringe Ausführung.');
    return;
  }

  const syncSeconds = config.sync_interval || 300;
  const intervalMs = syncSeconds * 1000;

  console.log(`[get_all Loop] Starte alle ${syncSeconds} Sekunden...`);

  const execute = () => {
    console.log('[get_all Loop] Starte get_all.py...');
    exec(`${pythonExecutable} ${getAllScriptPath}`, (error, stdout, stderr) => {
      if (error) console.error('[get_all Loop] Fehler:', error.message);
      if (stderr) console.error('[get_all Loop] STDERR:', stderr);
      if (stdout) console.log('[get_all Loop] STDOUT:\n', stdout);
    });
  };

  execute(); // erste Ausführung sofort
  setInterval(execute, intervalMs);
}

// Fester Cronjob für get_setup.py (jede volle Stunde)
function scheduleGetSetupJob() {
  cron.schedule('*/5 * * * *', () => {
    console.log('[Cronjob] Starte get_setup.py...');
    exec(`${pythonExecutable} ${getSetupScriptPath}`, (error, stdout, stderr) => {
      if (error) console.error('[Cronjob] Fehler bei get_setup.py:', error.message);
      if (stderr) console.error('[Cronjob] STDERR (get_setup.py):', stderr);
      if (stdout) console.log('[Cronjob] STDOUT (get_setup.py):\n', stdout);
    });
  });
}

// Haupt-Exportfunktion
export function startCronJob() {
  console.log('[Cronjob] Initialisiere Zeitsteuerung...');
  startGetAllLoop();
  scheduleGetSetupJob();
}
