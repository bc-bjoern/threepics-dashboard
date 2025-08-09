import React from 'react';

const ClickZones = ({ onPrev, onNext, onSettingsToggle, orientation }) => {
  const isPortrait = orientation === 'portrait';

  // Styles für portrait
  const portraitStyles = {
    topClick: {
      position: 'fixed',
      top: '20vh',
      width: '20vh',
      height: '60%',
      right: '0vh',
      cursor: 'pointer',
      zIndex: 101,
      backgroundColor: 'transparent',
    },
    prevClick: {
      position: 'fixed',
      left: 0,
      width: '100%',
      height: '20vh',
      cursor: 'pointer',
      zIndex: 100,
      backgroundColor: 'transparent',
    },
    nextClick: {
      position: 'fixed',
      bottom: '0vh',
      width: '100%',
      height: '20vh',
      cursor: 'pointer',
      zIndex: 100,
      backgroundColor: 'transparent',
    },
  };

  // Styles für landscape (original)
  const landscapeStyles = {
    topClick: {
      position: 'fixed',
      top: 0,
      left: '35vw',
      width: '30vw',
      height: '10vh',
      cursor: 'pointer',
      zIndex: 101,
      backgroundColor: 'transparent',
    },
    prevClick: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '10vw',
      height: '100vh',
      cursor: 'pointer',
      zIndex: 100,
      backgroundColor: 'transparent',
    },
    nextClick: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '10vw',
      height: '100vh',
      cursor: 'pointer',
      zIndex: 100,
      backgroundColor: 'transparent',
    },
  };

  const styles = isPortrait ? portraitStyles : landscapeStyles;

  return (
    <>
    {/* Top zone */}
      <div onClick={onSettingsToggle} style={styles.topClick} />

      {/* Previous zone */}
      <div onClick={onPrev} style={styles.prevClick} />

      {/* Next zone */}
      <div onClick={onNext} style={styles.nextClick} />
    </>
  );
};

export default ClickZones;

