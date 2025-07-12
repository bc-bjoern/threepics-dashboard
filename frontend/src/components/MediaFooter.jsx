import React from 'react';

export default function MediaFooter({ subtitle, type }) {
  if (!(type === 'image' || type === 'video')) return null;

  return (
    <div
      style={{
        background: 'black',
        color: 'white',
        fontSize: '1.8rem',
        fontWeight: 'bold',      
        fontFamily: 'Bitter, serif',
        padding: '10px 20px',
        borderRadius: 0,
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        boxSizing: 'border-box',
        height: '2.5em',
        whiteSpace: 'pre-line',
        textAlign: 'center',
        zIndex: 20,
        margin: 0,
      }}
    >
      {subtitle || ''}
    </div>
  );
}

