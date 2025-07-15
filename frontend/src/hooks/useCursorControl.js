 import { useEffect } from 'react';

const useCursorControl = () => {
  useEffect(() => {
    // Cursor anfangs verstecken
    document.body.classList.add("hide-cursor");

    const showCursor = () => {
      document.body.classList.remove("hide-cursor");
      document.body.classList.add("show-cursor");

      // Nach 10 Sekunden Cursor wieder verstecken
      const timeout = setTimeout(() => {
        document.body.classList.remove("show-cursor");
        document.body.classList.add("hide-cursor");
      }, 10000);

      return () => clearTimeout(timeout);
    };

    window.addEventListener("keydown", showCursor);

    return () => {
      window.removeEventListener("keydown", showCursor);
    };
  }, []);
};

export default useCursorControl;
