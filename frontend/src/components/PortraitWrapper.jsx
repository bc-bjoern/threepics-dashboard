// PortraitWrapper.jsx
import React from 'react';

const PortraitWrapper = ({ orientation, children }) => {
  const isPortrait = orientation === 'portrait';

  const style = {
    width: '100vh',
    height: '100vw',
    transform: 'rotate(90deg)',
    transformOrigin: 'center',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'black',
  };

  return isPortrait ? <div style={style}>{children}</div> : <>{children}</>;
};

export default PortraitWrapper;

