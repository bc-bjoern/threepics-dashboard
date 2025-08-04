// src/components/MediaDisplay.jsx
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const transitionDuration = 0.8;


const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideLeft: {
    initial: { x: '100vw', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100vw', opacity: 0 },
  },
  slideRight: {
    initial: { x: '-100vw', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100vw', opacity: 0 },
  },
  slideUp: {
    initial: { y: '100vh', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100vh', opacity: 0 },
  },
  slideDown: {
    initial: { y: '-100vh', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100vh', opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  scaleUp: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  rotateIn: {
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 180, opacity: 0 },
  },
  flipX: {
    initial: { rotateY: 180, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -180, opacity: 0 },
  },
  flipY: {
    initial: { rotateX: 180, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: -180, opacity: 0 },
  },
  blurIn: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
};

const allTransitions = Object.keys(variants);

function MediaDisplay({ currentMedia, currentIndex, transitionEffect = 'fade', transitionDuration = 0.8, onMediaEnd}) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (currentMedia?.type === 'video' && video && onMediaEnd) {
      const handleEnded = () => {
        console.log('[MediaDisplay] 🎥 Video beendet');
        onMediaEnd();
      };
      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, [currentMedia, onMediaEnd]);

  const [effect, setEffect] = useState(() =>
    transitionEffect === 'none'
      ? null
      : transitionEffect === 'random'
      ? allTransitions[Math.floor(Math.random() * allTransitions.length)]
      : variants[transitionEffect]
      ? transitionEffect
      : 'fade'
  );


  useEffect(() => {
    const resolvedEffect =
      transitionEffect === 'none'
        ? null
        : transitionEffect === 'random'
        ? allTransitions[Math.floor(Math.random() * allTransitions.length)]
        : variants[transitionEffect]
        ? transitionEffect
        : 'fade';

    setEffect(resolvedEffect);
  }, [currentIndex, transitionEffect]);


if (!currentMedia) return null;

  const mediaKey = `${currentMedia.type}-${currentMedia.url || currentIndex}`;

  const MediaContent = () => {
    if (currentMedia.type === 'image') {
      return (
        <img
          src={`${backendUrl}${currentMedia.url}`}
          alt={`Media ${currentIndex}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      );
    }

    if (currentMedia.type === 'video') {
      return (
        <video
          ref={videoRef}
          src={`${backendUrl}${currentMedia.url}`}
          autoPlay
          muted
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      );
    }

    if (currentMedia.type === 'text') {
      return (
        <p
          style={{
            fontSize: '2rem',
            color: '#ffffff',
            whiteSpace: 'pre-line',
            fontFamily: `'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji', 'Twemoji Mozilla', sans-serif`,
            WebkitFontSmoothing: 'antialiased',
            padding: 20,
            maxWidth: '80vw',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          {currentMedia.text}
        </p>
      );
    }

    return null;
  };

  if (effect === null) {
    // Kein Effekt → einfaches div
    return (
      <div
        key={mediaKey}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          zIndex: 10,
        }}
      >
        <MediaContent />
      </div>
    );
  }

  // Mit Effekt → motion.div verwenden
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mediaKey}
        initial={variants[effect].initial}
        animate={variants[effect].animate}
        exit={variants[effect].exit}
        transition={{ duration: transitionDuration }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          zIndex: 10,
          perspective: 1000,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        <MediaContent />
      </motion.div>
    </AnimatePresence>
  );
}

export default MediaDisplay;
