import chokidar from 'chokidar';
import path from 'path';
import { WebSocketServer } from 'ws';

// WebSocket-Server starten (z. B. auf Port 8081)
const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('🟢 Frontend verbunden via WebSocket.');
});

// Funktion zum Starten des Watchers
export function startWatcher(downloadsPath) {
  const watcher = chokidar.watch(downloadsPath, {
    ignoreInitial: true,
    persistent: true,
    depth: 3,
  });

  watcher.on('add', (filepath) => { 
    console.log('🆕 Neue Datei erkannt:', filepath);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'new-file', path: filepath }));
      }
    });
  });

  watcher.on('unlink', (filepath) => {
    console.log('❌ Datei gelöscht:', filepath);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'file-deleted', path: filepath }));
      }
    });
  });

}
