// KeyFeatures.jsx
import React from 'react';
import {
  FaMicrophoneAlt,
  FaMapMarkerAlt,
  FaSms,
  FaBatteryFull,
  FaMobileAlt,
  FaBell,
} from 'react-icons/fa'; // Changed FaChargingStation to FaBell for new icon

import './Feature.css';

const features = [
  {
    icon: <FaMicrophoneAlt className="feature-icon" />,
    title: "Voice-Triggered SOS",
    description: "Activate emergency alerts with custom voice commands silently and instantly.",
  },
  {
    icon: <FaMapMarkerAlt className="feature-icon" />,
    title: "Live GPS Tracking",
    description: "Real-time location tracking during emergencies, constantly updating.",
  },
  {
    icon: <FaSms className="feature-icon" />,
    title: "SMS + WhatsApp Alerts",
    description: "Sends alerts via SMS and WhatsApp to emergency contacts automatically.",
  },
  {
    icon: <FaBatteryFull className="feature-icon" />,
    title: "Long Battery Life",
    description: "Reliable performance with extended battery life for everyday use.",
  },
  {
    icon: <FaMobileAlt className="feature-icon" />,
    title: "Web App Controlled Setup",
    description: "Full device control via website — manage contacts, triggers, and settings.",
  },
  {
    icon: <FaBell className="feature-icon" />,
    title: "Emergency Hardware Button",
    description: "Trigger SOS instantly with a dedicated physical button, even without voice.",
  },
];

const KeyFeatures = () => {
  return (
    <section className="feature-section">
      <div className="feature-container">
        <div className="feature-header">
          <h5 className="section-subtitle">Key Features</h5>
          <h2 className="section-title">
            Why Choose <span className="text-gradient">MITR</span>?
          </h2>
          <p className="section-desc">
            Our powerful features ensure your safety and peace of mind, every day.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="icon-wrapper">{feature.icon}</div>
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
