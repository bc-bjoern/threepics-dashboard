import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function useMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const [delay, setDelay] = useState(30000); 
  const [transitionEffect, setTransitionEffect] = useState("zoom");
  const [transitionDuration, setTransitionDuration] = useState(0.8);

  useEffect(() => {
    console.log('[Frontend] Loading media from:', backendUrl);

    axios.get(`${backendUrl}/media`)
      .then(res => {
        console.log('[Frontend] Media loaded:', res.data);
        setMedia(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[Frontend] Error loading media:', err);
        setError('Error loading media');
        setLoading(false);
      });

    axios.get(`${backendUrl}/api/setup`)
      .then(res => {
        const seconds = res.data?.delay_seconds || 30;
        const effect = res.data?.transition_effect || "zoom";
        const duration = parseFloat(res.data?.transition_duration) || 0.8;
        setDelay(seconds * 1000);
        setTransitionEffect(effect);
        setTransitionDuration(duration);
      })
      .catch(err => {
        console.warn('[Frontend] ⚠️ Fehler beim Laden des Delays:', err);
      });
  }, []);

  // Wiederholtes Neuladen des Delay-Werts
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${backendUrl}/api/setup`)
        .then(res => {
          const seconds = res.data?.delay_seconds || 30;
          const effect = res.data?.transition_effect || "zoom";
          const duration = parseFloat(res.data?.transition_duration) || 0.8;
          setDelay(seconds * 1000);
          setTransitionEffect(effect);
          setTransitionDuration(duration);
          console.log(`[Frontend] ⏱ Aktualisiert: ${seconds}s – 🎞 ${effect} – ⏳ ${duration}s`);
        })
        .catch(err => {
          console.warn('[Frontend] ⚠️ Fehler beim Aktualisieren des Setups:', err);
        });
    }, 60000); // alle 60 Sekunden

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (media.length === 0 || !delay || currentIndex >= media.length) return;

    const current = media[currentIndex];
    if (!current || current.type === 'video') {
      return;
    }

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [media, delay, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8081';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[Frontend] ✅ WebSocket verbunden');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'new-file') {
        console.log('[Frontend] 🆕 Neue Datei erkannt, Medien neu laden...');
        axios.get(`${backendUrl}/media`)
          .then(res => {
            setMedia(res.data);
            setCurrentIndex(0); 
            setLoading(false);
          })
          .catch(err => {
            console.error('[Frontend] Fehler beim Neuladen der Medien:', err);
            setError('Fehler beim Neuladen');
          });
      }
      if (message.type === 'file-deleted') {
        console.log('[Frontend] ❌ Datei gelöscht erkannt, Medien neu laden...');
        axios.get(`${backendUrl}/media`)
          .then(res => {
            setMedia([...res.data]);
            setCurrentIndex(0);
            setLoading(false);
          });
      }

    };

    ws.onerror = (err) => {
      console.error('[Frontend] ❌ WebSocket-Fehler:', err);
    };

    ws.onclose = () => {
      console.warn('[Frontend] ⚠️ WebSocket geschlossen');
    };

    return () => {
      ws.close();
    };
  }, []);


  return {
    media,
    loading,
    error,
    currentIndex,
    currentMedia: media[currentIndex] || null,
    handlePrev,
    handleNext,
    transitionEffect,
    transitionDuration,
  };
}

