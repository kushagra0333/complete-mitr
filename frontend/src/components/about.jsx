import React from 'react';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import sampleImage from '../assets/product_4.png';
import './about.css';

const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        {/* Left Content */}
        <div className="about-left">
          <div className="about-tag">Welcome to mitr.com</div>
          <h2 className="about-title">
            About <span className="highlight">MITR</span>
          </h2>
          <p className="about-text">
            <strong>Mitr SOS</strong> is a smart emergency alert system designed to provide
            <strong> silent, fast, and secure help</strong> in critical situations.
            Our wearable devices use <strong>voice triggers</strong> and real-time location tracking
            to notify trusted contacts instantly—keeping you safe without drawing attention.
          </p>
          <p className="about-text">
            You can manage your device, update contacts, and customize triggers directly from our platform.
            With MITR, personal safety meets seamless technology.
          </p>
       
        </div>

        {/* Right Image */}
        <div className="about-right">
          <img src={sampleImage} alt="MITR Device" className="about-img" />
        </div>
      </div>
    </section>
  );
};

export default About;
