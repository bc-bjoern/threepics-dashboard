import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function MediaManagement() {
  const { t } = useTranslation();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${backendUrl}/media`);
      // Assign unique id based on url to avoid React key warning
      const mediaWithId = res.data.map(item => ({
        ...item,
        id: item.url,
      }));
      setMediaList(mediaWithId);
    } catch (err) {
      setError('Fehler beim Laden der Medien.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie dieses Medium wirklich löschen?')) return;
    setDeletingId(id);
    setMessage(null);
    try {
      //await axios.delete(`${backendUrl}/media/${encodeURIComponent(id)}`);
      await axios.delete(`${backendUrl}/media`, { data: { url: id } });
      setMessage('Medium erfolgreich gelöscht.');
      setMediaList(mediaList.filter(item => item.id !== id));
    } catch (err) {
      setMessage('Fehler beim Löschen des Mediums.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (mediaList.length === 0) return <p>{t('no_media')}</p>;

  return (
    <div>
      <h3>{t('manage_media')}</h3>
      {message && (
        <p style={{ color: message.includes('erfolgreich') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mediaList.map(({ id, type, url, subtitle }) => (
          <li
            key={id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid #ccc',
              paddingBottom: '0.5rem',
            }}
          >
            {type === 'image' && (
              <img
                src={`${backendUrl}${url}`}
                alt={subtitle || 'Bild'}
                style={{ height: 60, marginRight: 16, objectFit: 'cover', minWidth: 100, }}
              />
            )}
            {type === 'video' && (
              <video
                src={`${backendUrl}${url}`}
                style={{ height: 60, marginRight: 16, objectFit: 'cover', minWidth: 100, }}
                controls={false}
              />
            )}
            <div style={{ flexGrow: 1 }}>
              <p style={{ margin: 0 }}>{subtitle || '(kein Titel)'}</p>
              <small>{type.toUpperCase()}</small>
            </div>
            <button
              onClick={() => handleDelete(id)}
              disabled={deletingId === id}
              style={{
                backgroundColor: '#e74c3c',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                cursor: deletingId === id ? 'not-allowed' : 'pointer',
                borderRadius: 4,
              }}
            >
              {deletingId === id ? t('deleting') : t('delete')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

