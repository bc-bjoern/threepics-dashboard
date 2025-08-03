import { useEffect, useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function RebootIndicator() {
  const [rebootRequired, setRebootRequired] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchRebootStatus = () => {

      fetch(`${backendUrl}/api/reboot-required`)
        .then(async res => {
          const contentType = res.headers.get('Content-Type') || '';

          const text = await res.text();

          if (contentType.includes('application/json')) {
            try {
              const data = JSON.parse(text);
              setRebootRequired(data.rebootRequired === true);
            } catch (err) {
              console.error('[RebootIndicator] ❌ JSON parse error:', err);
              setRebootRequired(false);
            }
          } else {
            console.warn('[RebootIndicator] ⚠️ Unexpected response type – not JSON.');
            setRebootRequired(false);
          }
        })
        .catch(err => {
          console.error('[RebootIndicator] ❌ Fetch failed:', err);
          setRebootRequired(false);
        });
    };

    fetchRebootStatus(); // initial call
    const interval = setInterval(fetchRebootStatus, 10000); // every 10 seconds
    return () => clearInterval(interval); // cleanup
  }, []);

  if (!rebootRequired) return null;

  return (
    <>
      <div
        onClick={() => setShowPopup(true)}
        style={{
          width: 12,
          height: 12,
          position: 'fixed',
          bottom: '3em',
          left: '12vw',
          borderRadius: '50%',
          backgroundColor: 'red',
          boxShadow: '0 0 4px rgba(255,0,0,0.7)',
          animation: 'pulse 1.2s infinite ease-in-out',
          cursor: 'pointer',
        }}
        title="Reboot required"
      />

      {showPopup && (
        <div
          onClick={() => setShowPopup(false)}
          style={{
            position: 'fixed',
            bottom: '3em',
            left: '1em',
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: '0.9rem',
            maxWidth: '250px',
            zIndex: 100,
            cursor: 'pointer',
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          Reboot required, go to setup and press <strong>Reboot</strong>.
        </div>
      )}
    </>
  );
}

export default RebootIndicator;

