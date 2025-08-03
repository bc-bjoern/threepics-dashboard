import React from 'react';
import WlanSettings from './WlanSettings';
import OAuthSettings from './OAuthSettings';
import MediaManagement from './MediaManagement';
import AdminSettings from './AdminSettings';  
import { useTranslation } from 'react-i18next';

const SettingsModal = ({ isOpen, onClose, settingsMenu, setSettingsMenu }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '2.5rem',
          borderRadius: '10px',
          width: '90%',
	  minHeight: '500px', 
	  height: 'auto',
          maxWidth: '900px',
          boxSizing: 'border-box',
          textAlign: 'center',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>{t('settings')}</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
        <button
          onClick={() => setSettingsMenu('anmeldung')}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontWeight: settingsMenu === 'anmeldung' ? 'bold' : 'normal',
            backgroundColor: settingsMenu === 'anmeldung' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          {t('login')}
        </button>
        <button
          onClick={() => setSettingsMenu('wlan')}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontWeight: settingsMenu === 'wlan' ? 'bold' : 'normal',
            backgroundColor: settingsMenu === 'wlan' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          {t('wlan')}
        </button>
        <button
          onClick={() => setSettingsMenu('media')}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontWeight: settingsMenu === 'media' ? 'bold' : 'normal',
            backgroundColor: settingsMenu === 'media' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          {t('media')}
        </button>
        <button
          onClick={() => setSettingsMenu('admin')}
          style={{
            flex: 1,
            padding: '0.5rem',
            fontWeight: settingsMenu === 'admin' ? 'bold' : 'normal',
            backgroundColor: settingsMenu === 'admin' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          {t('admin')}
        </button>
      </div>


        {settingsMenu === 'wlan' && <WlanSettings />}
        {settingsMenu === 'anmeldung' && <OAuthSettings />}
        {settingsMenu === 'media' && <MediaManagement />}
        {settingsMenu === 'admin' && <AdminSettings />}

        <button
          onClick={onClose}
          style={{
            marginTop: '2rem',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
