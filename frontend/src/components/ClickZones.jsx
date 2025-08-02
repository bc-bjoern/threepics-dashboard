// src/components/ClickZones.jsx

import React from 'react';

const ClickZones = ({ onPrev, onNext, onSettingsToggle }) => {
  return (
    <>
      {/* Top center area for opening settings */}
      <div
        onClick={onSettingsToggle}
        style={{
          position: 'fixed',
          top: 0,
          left: '35vw',
          width: '30vw',
          height: '10vh',
          cursor: 'pointer',
          zIndex: 101,
          backgroundColor: 'transparent',
        }}
      />

      {/* Left area for previous media */}
      <div
        onClick={onPrev}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '10vw',
          height: '100vh',
          cursor: 'pointer',
          zIndex: 100,
          backgroundColor: 'transparent',
        }}
      />

      {/* Right area for next media */}
      <div
        onClick={onNext}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '10vw',
          height: '100vh',
          cursor: 'pointer',
          zIndex: 100,
          backgroundColor: 'transparent',
        }}
      />
    </>
  );
};

export default ClickZones;

