// src/components/MessageManager.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import MessagePopup from './MessagePopup';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [currentMsgText, setCurrentMsgText] = useState('');
  const [msgPopupOpen, setMsgPopupOpen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Nachrichten abrufen alle 5 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${backendUrl}/api/messages`)
        .then(res => {
          setMessages(prev => {
            const newMessages = res.data;
            if (JSON.stringify(prev) !== JSON.stringify(newMessages)) {
              return newMessages;
            }
            return prev;
          });
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Nachrichten initial laden
  useEffect(() => {
    axios.get(`${backendUrl}/api/messages`)
      .then(res => setMessages(res.data))
      .catch(console.error);
  }, []);

  // Einzelne Nachricht laden
  useEffect(() => {
    if (msgPopupOpen && messages.length > 0) {
      const filename = messages[currentMsgIndex];
      setLoadingMsg(true);
      axios.get(`${backendUrl}/api/messages/${filename}`)
        .then(res => setCurrentMsgText(res.data.text))
        .catch(() => setCurrentMsgText('Fehler beim Laden der Nachricht.'))
        .finally(() => setLoadingMsg(false));
    } else {
      setCurrentMsgText('');
    }
  }, [msgPopupOpen, currentMsgIndex, messages]);

  const openMsgPopup = () => {
    if (messages.length > 0) {
      setCurrentMsgIndex(0);
      setMsgPopupOpen(true);
    }
  };

  const closeMsgPopup = () => setMsgPopupOpen(false);

  const showNextMsg = () => {
    setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
  };

  const deleteCurrentMsg = () => {
    if (messages.length === 0) return;
    const filename = messages[currentMsgIndex];
    axios.delete(`${backendUrl}/api/messages/${filename}`)
      .then(() => {
        const newMessages = messages.filter((_, i) => i !== currentMsgIndex);
        setMessages(newMessages);
        if (newMessages.length === 0) setMsgPopupOpen(false);
        else setCurrentMsgIndex(prev => prev % newMessages.length);
      })
      .catch(() => alert('Fehler beim Löschen der Nachricht'));
  };

  return (
    <>
      {messages.length > 0 && (
        <button
          onClick={openMsgPopup}
          style={{
            position: 'fixed',
            bottom: '1em',
            right: '1em',
            height: '3em',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            zIndex: 1000,
          }}
          title="Neue Nachricht"
          aria-label="Neue Nachricht"
        >
          💬
        </button>
      )}

      <MessagePopup
        msgPopupOpen={msgPopupOpen}
        closeMsgPopup={closeMsgPopup}
        currentMsgIndex={currentMsgIndex}
        messages={messages}
        loadingMsg={loadingMsg}
        currentMsgText={currentMsgText}
        deleteCurrentMsg={deleteCurrentMsg}
        showNextMsg={showNextMsg}
      />
    </>
  );
}

