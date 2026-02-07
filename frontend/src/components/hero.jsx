// Hero.js
import React, { useEffect, useRef } from 'react';
import './hero.css';
import heroImg from '../assets/hero.png'; // Replace with your actual image

const Hero = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;

      if (imageRef.current) {
        imageRef.current.style.transform = `translate(${x}px, ${y}px) rotateY(${x / 3}deg) rotateX(${y / 3}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">MITR</h1>
        <p className="hero-desc">Your personal SOS companion in danger or distress.</p>
        <blockquote className="hero-quote">Because help should be just a word away</blockquote>
      </div>

      <div className="hero-image-container">
        <img ref={imageRef} src={heroImg} alt="MITR Device" className="hero-image" />
      </div>
    </section>
  );
};

export default Hero;
