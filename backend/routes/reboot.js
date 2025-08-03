import { Router } from 'express';
import fs from 'fs';

const router = Router();
const FLAG_PATH = '/opt/threepics/threepics-dashboard/.reboot_required';

router.get('/reboot-required', (req, res) => {
  const exists = fs.existsSync(FLAG_PATH);
  res.json({ rebootRequired: exists });
});

export default router;
