// src/components/VirtualKeyboard.jsx
import { useState, useEffect, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import "react-simple-keyboard/build/css/index.css";

export default function VirtualKeyboard({ input, onChange, onInputFocus }) {
  const [layoutName, setLayoutName] = useState("default");
  const keyboardRef = useRef();

  const onKeyPress = (button) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
    }
  };

  useEffect(() => {
    keyboardRef.current?.setInput(input);
  }, [input]);

  return (
    <Keyboard
      keyboardRef={r => (keyboardRef.current = r)}
      layoutName={layoutName}
      onChange={onChange}
      onKeyPress={onKeyPress}
      layout={{
        default: [
          "1 2 3 4 5 6 7 8 9 0 {bksp}",
          "q w e r t z u i o p",
          "a s d f g h j k l @ .",
          "y x c v b n m - _",
          "{shift} {space} {enter}"
        ],
        shift: [
          "! \" § $ % & / ( ) = {bksp}",
          "Q W E R T Z U I O P",
          "A S D F G H J K L * +",
          "Y X C V B N M ; : '",
          "{shift} {space} {enter}"
        ],
      }}
      display={{
        "{bksp}": "⌫",
        "{enter}": "↵",
        "{space}": "␣",
        "{shift}": "⇧",
      }}
    />
  );
}

