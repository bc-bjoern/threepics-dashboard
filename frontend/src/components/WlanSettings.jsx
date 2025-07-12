import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import VirtualKeyboard from './VirtualKeyboard';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function WlanSettings() {
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiMessage, setWifiMessage] = useState(null);
  const [wifiSaving, setWifiSaving] = useState(false);

  const [activeInput, setActiveInput] = useState('ssid');
  const keyboardRef = useRef();

  const onChange = (input) => {
    if (activeInput === 'ssid') setSsid(input);
    else if (activeInput === 'password') setWifiPassword(input);
  };

  useEffect(() => {
    if (activeInput === 'ssid') {
      keyboardRef.current?.setInput(ssid);
    } else if (activeInput === 'password') {
      keyboardRef.current?.setInput(wifiPassword);
    }
  }, [activeInput, ssid, wifiPassword]);

  const handleConnectWifi = async () => {
    if (!ssid) {
      setWifiMessage('Bitte SSID eingeben.');
      return;
    }
    setWifiSaving(true);
    setWifiMessage(null);

    try {
      await axios.post(`${backendUrl}/api/save-wifi`, { ssid, password: wifiPassword });
      setWifiMessage('WLAN-Daten erfolgreich gespeichert.');
    } catch (error) {
      setWifiMessage('Fehler beim Speichern der WLAN-Daten.');
      console.error(error);
    } finally {
      setWifiSaving(false);
    }
  };

  return (
    <div>
      <p>WLAN-Einstellungen hier...</p>

      <input
        type="text"
        placeholder="SSID"
        value={ssid}
        onFocus={() => setActiveInput('ssid')}
        onChange={e => setSsid(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        disabled={wifiSaving}
      />

      <input
        type="password"
        placeholder="Passwort"
        value={wifiPassword}
        onFocus={() => setActiveInput('password')}
        onChange={e => setWifiPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        disabled={wifiSaving}
      />

      <VirtualKeyboard
        input={activeInput === 'ssid' ? ssid : wifiPassword}
        onChange={onChange}
        keyboardRef={keyboardRef}
      />

      <button
        onClick={handleConnectWifi}
        disabled={wifiSaving}
        style={{ padding: '0.5rem 1rem', cursor: wifiSaving ? 'not-allowed' : 'pointer' }}
      >
        {wifiSaving ? 'Speichert...' : 'Verbinden'}
      </button>

      {wifiMessage && <p style={{ marginTop: '1rem' }}>{wifiMessage}</p>}
    </div>
  );
}
