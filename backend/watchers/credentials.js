import fs from 'fs';
import { execFile } from 'child_process';
import path from 'path';

const configPath = path.resolve('config/credentials.json');

import { existsSync } from 'fs';

let venvPython = path.resolve('.venv/bin/python3');
if (!existsSync(venvPython)) {
  console.warn('[Python Path] ⚠️ .venv nicht gefunden – verwende System-python3');
  venvPython = 'python3';
}

const getAllScript = path.resolve('scripts/get_all.py');
const getSetupScript = path.resolve('scripts/get_setup.py');
const registerDeviceScript = path.resolve('scripts/register_device.py');

console.log('👀 Watching:', configPath);

fs.watch(configPath, { persistent: true }, (eventType) => {
  if (eventType === 'change') {
    console.log(`🔁 credentials.json changed → executing scripts...`);

    execFile(venvPython, [getAllScript], (err, stdout, stderr) => {
      if (err) return console.error('❌ get_all.py failed:', err.message);
      if (stderr) console.warn('⚠️ get_all.py stderr:', stderr);
      console.log('✅ get_all.py output:', stdout);

      execFile(venvPython, [getSetupScript], (err2, stdout2, stderr2) => {
        if (err2) return console.error('❌ get_setup.py failed:', err2.message);
        if (stderr2) console.warn('⚠️ get_setup.py stderr:', stderr2);
        console.log('✅ get_setup.py output:', stdout2);

        execFile(venvPython, [registerDeviceScript], (err3, stdout3, stderr3) => {
          if (err3) return console.error('❌ register_device.py failed:', err3.message);
          if (stderr3) console.warn('⚠️ register_device.py stderr:', stderr3);
          console.log('✅ register_device.py output:', stdout3);

          execFile('sudo', ['/bin/systemctl', 'restart', 'threepics-backend.service'], (err4, stdout4, stderr4) => {

            if (err4) return console.error('❌ Restart failed:', err4.message);
            if (stderr4) console.warn('⚠️ Restart stderr:', stderr4);
            console.log('🔄 Backend restarted successfully.');
          });
        });
      });
    });
  }
});
