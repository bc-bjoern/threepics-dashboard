import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

const configPath = path.resolve('config/credentials.json');
const venvPython = path.resolve('.venv/bin/python3');
const getAllScript = path.resolve('scripts/get_all.py');
const getSetupScript = path.resolve('scripts/get_setup.py');
const restartCmd = 'sudo /bin/systemctl restart threepics-backend.service';

console.log('👀 Watching:', configPath);

fs.watch(configPath, { persistent: true }, (eventType) => {
  if (eventType === 'change') {
    console.log(`🔁 credentials.json changed → executing scripts...`);

    exec(`${venvPython} ${getAllScript}`, (err, stdout, stderr) => {
      if (err) return console.error('❌ get_all.py failed:', err.message);
      if (stderr) console.warn('⚠️ get_all.py stderr:', stderr);
      console.log('✅ get_all.py output:', stdout);

      exec(`${venvPython} ${getSetupScript}`, (err2, stdout2, stderr2) => {
        if (err2) return console.error('❌ get_setup.py failed:', err2.message);
        if (stderr2) console.warn('⚠️ get_setup.py stderr:', stderr2);
        console.log('✅ get_setup.py output:', stdout2);
      });
        exec(restartCmd, (err3, stdout3, stderr3) => {
          if (err3) return console.error('❌ Restart failed:', err3.message);
          if (stderr3) console.warn('⚠️ Restart stderr:', stderr3);
          console.log('🔄 Backend restarted successfully.');
        });
    });
  }
});

