import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import VirtualKeyboard from './VirtualKeyboard';
import { useTranslation } from 'react-i18next';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function WlanSettings() {
  const { t } = useTranslation();
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiMessage, setWifiMessage] = useState(null);
  const [wifiSaving, setWifiSaving] = useState(false);

  const [wifiList, setWifiList] = useState([]);
  const [loadingScan, setLoadingScan] = useState(false);

  const [activeInput, setActiveInput] = useState('ssid');
  const keyboardRef = useRef();

  const onChange = (input) => {
    if (activeInput === 'ssid') setSsid(input);
    else if (activeInput === 'password') setWifiPassword(input);
  };

  useEffect(() => {
    if (activeInput === 'ssid') keyboardRef.current?.setInput(ssid);
    else if (activeInput === 'password') keyboardRef.current?.setInput(wifiPassword);
  }, [activeInput, ssid, wifiPassword]);

  const handleScan = async () => {
    setLoadingScan(true);
    setWifiMessage(null);
    try {
      const res = await axios.get(`${backendUrl}/api/wifi/scan`);
      setWifiList(res.data);
    } catch (err) {
      setWifiMessage('wifi_scan_error');
      console.error(err);
    } finally {
      setLoadingScan(false);
    }
  };

  const handleConnectWifi = async () => {
    if (!ssid) {
      setWifiMessage('wifi_select'); 
      return;
    }
    setWifiSaving(true);
    setWifiMessage(null);

    try {
      const res = await axios.post(`${backendUrl}/api/wifi/connect`, {
        ssid,
        password: wifiPassword,
      });
      setWifiMessage(res.data.message || 'wifi_success');
    } catch (error) {
      setWifiMessage('wifi_connect_error');
      console.error(error);
    } finally {
      setWifiSaving(false);
    }
  };

  return (
    <div>
      <h3>{t('wifi_select')}</h3>

      <button onClick={handleScan} disabled={loadingScan} style={{ marginBottom: '1rem' }}>
        {loadingScan ? t('wifi_searching') : t('wifi_rescan')} 
      </button>

      {wifiList.length > 0 && (
        <ul style={{ maxHeight: 150, overflowY: 'auto', padding: 0 }}>
          {wifiList.map((net, idx) => (
            <li
              key={idx}
              style={{
                listStyle: 'none',
                padding: '0.3rem 0.6rem',
                margin: '0.2rem 0',
                background: net.ssid === ssid ? '#ccc' : '#eee',
                cursor: 'pointer',
              }}
              onClick={() => setSsid(net.ssid)}
            >
              {net.ssid} ({net.signal}%)
            </li>
          ))}
        </ul>
      )}

      <input
        type="text"
        placeholder={t('wifi_ssid')}
        value={ssid}
        onFocus={() => setActiveInput('ssid')}
        onChange={e => setSsid(e.target.value)}
        style={{ width: '100%', marginTop: '1rem', marginBottom: '1rem', padding: '0.5rem' }}
        disabled={wifiSaving}
      />

      <input
        type="password"
        placeholder={t('wifi_password')}
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
        {wifiSaving ? t('wifi_connecting') : t('wifi_connect')}
      </button>

      {wifiMessage && <p style={{ marginTop: '1rem' }}>{t(wifiMessage)}</p>}
    </div>
  );
}
