import React from 'react';

const ClickZones = ({ onPrev, onNext, onSettingsToggle, orientation }) => {
  const isPortrait = orientation === 'portrait';
  return (
    <>
      {/* Top center area for opening settings */}
      <div
        onClick={onSettingsToggle}
        style={{
          position: 'fixed',
          top: isPortrait ? '35vh' : 0,
          left: isPortrait ? 0 : '35vw',
          width: isPortrait ? '10vw' : '30vw',
          height: isPortrait ? '30vh' : '10vh',
          cursor: 'pointer',
          zIndex: 101,
          // backgroundColor: 'transparent',
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
        }}
      />

      {/* Left area for previous media */}
      <div
        onClick={onPrev}
        style={{
          position: 'fixed',
          ottom: isPortrait ? 0 : 'auto',
          top: isPortrait ? 'auto' : 0,
          left: isPortrait ? 0 : 0,
          width: isPortrait ? '100vw' : '10vw',
          height: isPortrait ? '10vh' : '100vh',
          cursor: 'pointer',
          zIndex: 100,
          // backgroundColor: 'transparent',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
        }}
      />

      {/* Right area for next media */}
      <div
        onClick={onNext}
        style={{
          position: 'fixed',
          top: isPortrait ? 0 : 0,
          bottom: isPortrait ? 'auto' : 'auto',
          right: isPortrait ? 0 : 0,
          width: isPortrait ? '100vw' : '10vw',
          height: isPortrait ? '10vh' : '100vh',
          cursor: 'pointer',
          zIndex: 100,
          // backgroundColor: 'transparent',
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
        }}
      />
    </>
  );
};

export default ClickZones;

