import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import VirtualKeyboard from './VirtualKeyboard';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function OAuthSettings() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [activeInput, setActiveInput] = useState('email');

  const onChange = (input) => {
    if (activeInput === 'email') setEmail(input);
    else if (activeInput === 'password') setPassword(input);
  };

  const handleSaveCredentials = async () => {
    if (!email || !password) {
      setSaveMessage('Bitte Email und Passwort eingeben.');
      return;
    }
    setSaving(true);
    setSaveMessage(null);

    try {
      await axios.post(`${backendUrl}/api/save-credentials`, { email, password });
      setSaveMessage('Credentials erfolgreich gespeichert.');
    } catch (error) {
      setSaveMessage('Fehler beim Speichern der Credentials.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p>{t('login_title')}</p>

      <input
        type="email"
        placeholder={t('email')}
        value={email}
        onFocus={() => setActiveInput('email')}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        disabled={saving}
      />

      <input
        type="password"
        placeholder={t('password')}
        value={password}
        onFocus={() => setActiveInput('password')}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        disabled={saving}
      />

      <VirtualKeyboard
        input={activeInput === 'email' ? email : password}
        onChange={onChange}
      />

      <button
        onClick={handleSaveCredentials}
        disabled={saving}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: saving ? 'not-allowed' : 'pointer',
          marginTop: '1rem',
        }}
      >
        {saving ? t('saving') : t('save')}
      </button>

      {saveMessage && (
        <p
          style={{
            marginTop: '1rem',
            color: ['success', 'error_save'].includes(saveMessage) ? 'green' : 'red',
          }}
        >
          {t(saveMessage)}
        </p>
      )}
    </div>
  );
}
