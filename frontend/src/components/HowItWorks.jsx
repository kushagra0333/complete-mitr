import React from "react";
import {
  FaShoppingCart,
  FaUser,
  FaMobileAlt,
  FaInfoCircle,
  FaHistory,
  FaMapMarkedAlt,
  FaArrowDown,
} from "react-icons/fa";
import "./HowItWorks.css";

const steps = [
  {
    icon: <FaShoppingCart className="step-icon" />,
    title: "Buy Device",
    description: "Purchase MITR from our website or app.",
  },
  {
    icon: <FaUser className="step-icon" />,
    title: "Login / Signup",
    description: "Create an account or log in using Gmail.",
  },
  {
    icon: <FaMobileAlt className="step-icon" />,
    title: "Add Device",
    description: "Connect your MITR device to the dashboard.",
  },
  {
    icon: <FaInfoCircle className="step-icon" />,
    title: "View Device Details",
    description: "Click the device card to see current status and settings.",
  },
  {
    icon: <FaHistory className="step-icon" />,
    title: "Trigger History",
    description: "See a complete list of all SOS trigger events.",
  },
  {
    icon: <FaMapMarkedAlt className="step-icon" />,
    title: "Map Visualization",
    description: "View triggered events with GPS trail on an interactive map.",
  },
];
const HowItWorks = () => {
  return (
    <section className="howitworks-section">
      <div className="howitworks-container">
        <div className="howitworks-header">
          <h5 className="section-subtitle">How It Works</h5>
          <h2 className="section-title">MITR SOS User Journey</h2>
          <p className="section-desc">
            Understand each step from purchase to real-world usage.
          </p>
        </div>

        <div className="timeline">
          {steps.map((step, index) => (
            <div className="timeline-step" key={index}>
              <div className="icon-circle">{step.icon}</div>
              <h4 className="step-title">{index + 1}. {step.title}</h4>
              <p className="step-desc">{step.description}</p>
              {index !== steps.length - 1 && (
                <div className="arrow-icon">
                  <FaArrowDown />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
