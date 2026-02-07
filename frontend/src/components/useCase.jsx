import React from 'react';
import {
  FaChild,
  FaFemale,
  FaUserShield,
  FaWalking,
  FaMapMarkedAlt,
  FaHeadset,
} from 'react-icons/fa';
import './usecase.css';

const useCases = [
  {
    title: "For Children",
    icon: <FaChild className="icon" />,
    description:
      "Ensure your child’s safety on their way to school or in outdoor activities — even when they don’t carry a phone.",
  },
  {
    title: "For Women",
    icon: <FaFemale className="icon" />,
    description:
      "Protect yourself during commutes, while jogging, or in uncomfortable public encounters with a discreet safety solution.",
  },
  {
    title: "For Senior Citizens",
    icon: <FaUserShield className="icon" />,
    description:
      "Give elderly family members a secure way to call for help during medical emergencies or unsafe conditions at home or outside.",
  },
  {
    title: "For Travelers & Solo Workers",
    icon: <FaWalking className="icon" />,
    description:
      "Stay safe in unfamiliar places. Ideal for field agents, delivery staff, cab drivers, or anyone traveling alone.",
  },
  {
    title: "When Phones Can’t Be Used",
    icon: <FaMapMarkedAlt className="icon" />,
    description:
      "Mitr activates through voice alone — perfect in situations where phones are out of reach, confiscated, or too risky to use.",
  },
  {
    title: "24/7 Emergency Response",
    icon: <FaHeadset className="icon" />,
    description:
      "Works round the clock, silently listening for trigger words and sending alerts even if you're physically restrained or unconscious.",
  },
];

const UseCase = () => {
  return (
    <section className="usecase-section">
      <div className="usecase-container">
        <div className="usecase-header">
          <h5 className="usecase-subtitle">Real-Life Scenarios</h5>
          <h2 className="usecase-title">
            Who Needs <span className="text-gradient">MITR</span>?
          </h2>
          <p className="usecase-desc">
            From kids to commuters, MITR is your invisible ally in emergencies.
          </p>
        </div>

        <div className="usecase-grid">
          {useCases.map((item, index) => (
            <div className="usecase-card" key={index}>
              <div className="icon-wrapper">{item.icon}</div>
              <h4 className="usecase-heading">{item.title}</h4>
              <p className="usecase-text">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCase;
