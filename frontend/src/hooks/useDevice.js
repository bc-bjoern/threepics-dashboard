import { useState, useEffect } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function useDevice() {
  const [device, setDevice] = useState(null);

  useEffect(() => {
    fetch(`${backendUrl}/api/device`)
      .then(res => res.json())
      .then(setDevice)
      .catch(err => console.warn('⚠️ Error loading device info:', err));
  }, []);

  return device;
}

