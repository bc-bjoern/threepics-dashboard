import { useState, useEffect } from 'react';
import axios from 'axios';

// Language Loader
import { useTranslation } from 'react-i18next';
import LanguageLoader from './LanguageLoader';
import './i18n';

// Components
import MessageManager from './components/MessageManager';
import SettingsModal from './components/SettingsModal';
import MediaDisplay from './components/MediaDisplay';
import ClickZones from './components/ClickZones';
import MediaFooter from './components/MediaFooter';

// Hooks
import useMedia from './hooks/useMedia';
import useCursorControl from './hooks/useCursorControl';

function App() {
  useCursorControl();
  const { t } = useTranslation();

  const [settingsMenu, setSettingsMenu] = useState('anmeldung');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleSettings = () => {
    setSettingsOpen(prev => !prev);
  };

  const [orientation, setOrientation] = useState("landscape");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    axios.get(`${backendUrl}/api/setup`)
      .then((response) => {
        if (response.data?.orientation) {
          setOrientation(response.data.orientation);
        }
      })
      .catch((error) => {
        console.error("❌ Fehler beim Laden der Setup-Daten:", error.message);
      });
  }, []);


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
      <LanguageLoader />
      <div
        className="app-wrapper"
        style={{
          transform: orientation === 'portrait' ? 'rotate(90deg)' : 'none',
          transformOrigin: 'center center',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
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
              onMediaEnd={() => {
                // Nur bei Video-Ende ausgeführt
                if (currentMedia?.type === 'video') {
                  handleNext();
                }
              }}
            />
            {currentMedia.subtitle && (
            <MediaFooter subtitle={currentMedia.subtitle} type={currentMedia.type} />
            )}
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
      </div>
    </>
  );
}

export default App;
