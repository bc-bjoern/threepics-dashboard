import React from 'react';
import useDevice from '../hooks/useDevice';

export default function MediaFooter({ subtitle, type, orientation }) {
  const device = useDevice();

  {device && (
    <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
      Device-ID: {device.device_id} – Hostname: {device.hostname}
    </div>
  )}

  if (!(type === 'image' || type === 'video')) return null;

  const baseStyle = {
    background: 'black',
    color: 'white',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    fontFamily: 'Bitter, serif',
    padding: '10px 20px',
    boxSizing: 'border-box',
    whiteSpace: 'pre-line',
    textAlign: 'center',
    zIndex: 20,
    margin: 0,
  };

  // Rotation & Position je nach Modus
  const style =
    orientation === 'portrait'
      ? {
          ...baseStyle,
          position: 'fixed',
          left: 0,
          top: '0%',
          transform: 'rotate(90deg) translateY(-100%)',
          transformOrigin: 'top left',
          width: '100vh', // da rotiert
          height: '2.5em',
        }
      : {
          ...baseStyle,
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100%',
          height: '2.5em',
        };

  return (
    <>
      <div style={style}>{subtitle || ''}</div>
      {device && (
        <div
          style={{
            position: 'fixed',
            bottom: orientation === 'portrait' ? 'unset' : '2.5em',
            left: orientation === 'portrait' ? 0 : 0,
            top: orientation === 'portrait' ? 0 : 'unset',
            fontSize: '0.8rem',
            color: '#ccc',
            zIndex: 10,
            padding: '0.5em',
            transform:
              orientation === 'portrait' ? 'rotate(-90deg)' : 'none',
            transformOrigin: 'left top',
          }}
        >
          Device-ID: {device.device_id} – Hostname: {device.hostname}
        </div>
      )}
    </>
  );
}
