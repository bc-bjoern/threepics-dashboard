import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminSettings = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(false);
  const [localIp, setLocalIp] = useState('Lade...');
  const [brightnessAvailable, setBrightnessAvailable] = useState(false);
  const [brightness, setBrightness] = useState(128);

  useEffect(() => {
    // Verfügbarkeit prüfen
    fetch('http://localhost:3000/api/system/brightness/available')
      .then((res) => res.json())
      .then((data) => setBrightnessAvailable(data.available))
      .catch(() => setBrightnessAvailable(false));

    // Brightness laden
    fetch('http://localhost:3000/api/system/brightness')
      .then((res) => res.json())
      .then((data) => setBrightness(data.brightness))
      .catch(() => setBrightness(0));
  }, []);


  const updateBrightness = async (value) => {
    setBrightness(value);
    try {
      await fetch('http://localhost:3000/api/system/brightness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
    } catch {
      alert('⚠️ Fehler beim Setzen der Helligkeit');
    }
  };

  useEffect(() => {
    // Funktion zum aktiven Prüfen der Internetverbindung
    const checkInternet = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/system/online');
        const data = await res.json();
        setIsOnline(data.online);
      } catch {
        setIsOnline(false);
      }
    };

    // Lokale IP vom Backend laden
    const fetchLocalIp = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/system/ip');
        if (!res.ok) throw new Error('Fehler beim Laden der IP');
        const data = await res.json();
        setLocalIp(data.ip);
      } catch {
        setLocalIp('Fehler beim Laden');
      }
    };

    checkInternet();
    fetchLocalIp();

    // Eventlistener für Online/Offline Status
    const updateOnlineStatus = () => {
      // Wenn offline event kommt, direkt false setzen
      if (!navigator.onLine) {
        setIsOnline(false);
      } else {
        // Wenn online event, nochmal aktiv prüfen
        checkInternet();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const restartSystem = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/system/reboot', { method: 'POST' });
      const text = await response.text();
      alert(text);
    } catch {
      alert('Fehler beim Neustart');
    }
  };

  const restartServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/system/restart-services', { method: 'POST' });
      const text = await response.text();
      alert(text);
    } catch {
      alert('Fehler beim Dienst-Neustart');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>{t('internet_status')}:</strong> {isOnline ? t('online') : t('offline')}<br />
        <strong>{t('local_ip')}:</strong>
      </div>

      <button
        onClick={restartSystem}
        style={{
          padding: '0.5rem 1rem',
          marginRight: '1rem',
          cursor: 'pointer',
        }}
      >
        {t('restart')}
      </button>

      <button
        onClick={restartServices}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        {t('reload_services')}
      </button>

      {brightnessAvailable && (
        <div style={{ marginTop: '2rem' }}>
          <label>
            <strong>{t('brightness')}:</strong> {brightness}
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={brightness}
            onChange={(e) => updateBrightness(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}

    </div>
  );

};

export default AdminSettings;
