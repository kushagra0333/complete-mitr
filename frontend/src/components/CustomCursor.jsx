import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [showCursor, setShowCursor] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    const isTouchDevice = () =>
      'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice()) {
      setShowCursor(true);
    }
  }, []);

  useEffect(() => {
    if (!showCursor) return;

    const cursor = cursorRef.current;
    if (!cursor ) return;

    const move = (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";

    };

    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [showCursor]);

  if (!showCursor) return null;

  return (
    <>
      <div className="custom-cursor" ref={cursorRef}></div>
    </>
  );
};

export default CustomCursor;
