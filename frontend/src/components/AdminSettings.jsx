import React, { useEffect, useState } from 'react';

const AdminSettings = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [localIp, setLocalIp] = useState('Lade...');

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
        <strong>Internetverbindung:</strong> {isOnline ? 'Verbunden' : 'Nicht verbunden'}<br />
        <strong>Lokale IP-Adresse:</strong> {localIp}
      </div>

      <button
        onClick={restartSystem}
        style={{
          padding: '0.5rem 1rem',
          marginRight: '1rem',
          cursor: 'pointer',
        }}
      >
        Neustart
      </button>

      <button
        onClick={restartServices}
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        Neu laden
      </button>
    </div>
  );
};

export default AdminSettings;
