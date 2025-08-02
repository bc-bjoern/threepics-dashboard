import React from 'react';

function parseMessageContent(rawText) {
  const lines = rawText.split('\n');
  let name = '';
  let textLines = [];
  let isInTextBlock = false;

  for (const line of lines) {
    if (line.startsWith('[Name]')) {
      name = line.replace('[Name]', '').trim();
    } else if (line.startsWith('[Text]')) {
      isInTextBlock = true;
    } else if (isInTextBlock) {
      textLines.push(line);
    }
  }

  return {
    name,
    text: textLines.join('\n').trim(),
  };
}

function MessagePopup({
  msgPopupOpen,
  closeMsgPopup,
  currentMsgIndex,
  messages,
  loadingMsg,
  currentMsgText,
  deleteCurrentMsg,
  showNextMsg,
}) {
  if (!msgPopupOpen) return null;

  const { name, text } = parseMessageContent(currentMsgText);

  return (
    <div
      onClick={closeMsgPopup}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          minWidth: '300px',
          color:'black',
        }}
      >
        <h3>Nachricht {currentMsgIndex + 1} / {messages.length}</h3>
        {loadingMsg ? (
          <p>Lade Nachricht...</p>
        ) : (
          <div
            style={{
              marginBottom: '1rem',
              backgroundColor: '#f0f0f0',
              padding: '1rem',
              borderRadius: '4px',
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            <p><strong>Von:</strong> {name || 'Unbekannt'}</p>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {text}
            </div>
          </div>
        )}


        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={deleteCurrentMsg} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Löschen
          </button>
          {messages.length > 1 && (
            <button onClick={showNextMsg} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Nächste Nachricht
            </button>
          )}
          <button onClick={closeMsgPopup} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessagePopup;

