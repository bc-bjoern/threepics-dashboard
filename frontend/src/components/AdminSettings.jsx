import React from 'react';

const AdminSettings = () => {
  const restartSystem = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/system/reboot', { method: 'POST' });
      const text = await response.text();
      alert(text);
    } catch (error) {
      alert('Fehler beim Neustart');
    }
  };

  const restartServices = async () => {
    try {
      const response = await fetch('/api/system/restart-services', { method: 'POST' });
      const text = await response.text();
      alert(text);
    } catch (error) {
      alert('Fehler beim Dienst-Neustart');
    }
  };

  return (
    <div>
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
