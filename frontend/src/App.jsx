import { useState } from 'react';

// Components
import MessageManager from './components/MessageManager';
import SettingsModal from './components/SettingsModal';
import MediaDisplay from './components/MediaDisplay';
import ClickZones from './components/ClickZones';
import MediaFooter from './components/MediaFooter';

// Hooks
import useMedia from './hooks/useMedia';

function App() {
  const [settingsMenu, setSettingsMenu] = useState('wlan');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleSettings = () => {
    setSettingsOpen(prev => !prev);
  };

  const {
    media,
    loading,
    error,
    currentIndex,
    currentMedia,
    handlePrev,
    handleNext,
    transitionEffect,
    transitionDuration,
  } = useMedia();

  const noMedia = media.length === 0;

  if (loading) return <div>Lade Medien...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {/* Click Zones ganz oben */}
      <ClickZones
        onPrev={handlePrev}
        onNext={handleNext}
        onSettingsToggle={toggleSettings}
      />

      <div
        style={{
          width: 'calc(100vw - 5vw)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '10%',
          boxSizing: 'border-box',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {noMedia ? (
          <div style={{ color: 'gray', marginTop: 50 }}>
            Keine Medien gefunden. Bitte Setup öffnen.
          </div>
        ) : (
          <>
            <MediaDisplay
              currentMedia={currentMedia}
              currentIndex={currentIndex}
              transitionEffect={transitionEffect}
              transitionDuration={transitionDuration}
            />
            <MediaFooter subtitle={currentMedia.subtitle} type={currentMedia.type} />
          </>
        )}

        <MessageManager />

        <SettingsModal
          isOpen={settingsOpen}
          onClose={toggleSettings}
          settingsMenu={settingsMenu}
          setSettingsMenu={setSettingsMenu}
        />
      </div>
    </>
  );
}

export default App;
