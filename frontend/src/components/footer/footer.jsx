import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo-2.png";
import NoFooterPath from "./NoFooterPath";
import "./footer.css";

const Footer = () => {
  const location = useLocation();
  if (NoFooterPath().includes(location.pathname)) return null;

  return (
    <footer className="footer-hero text-light">
      <Container>
        <Row className="footer-content gy-4">
          {/* Logo & Branding */}
          <Col md={4} className="footer-section text-center text-md-start">
            <div className="footer-logo-wrapper">
              <img src={logo} alt="MITR" className="footer-hero-logo" />
              <h5 className="footer-brand-title">MITR SOS</h5>
              <p className="footer-brand-tagline">Because help should be just a word away.</p>
            </div>
          </Col>

          {/* Contact Info */}
          <Col md={4} className="footer-section text-center text-md-start">
            <h6 className="footer-heading">Contact</h6>
            <div className="footer-contact-item">
              <FaEnvelope className="footer-icon" />
              <span>mitrsos2025@gmail.com</span>
            </div>
            <div className="footer-contact-item">
              <FaPhone className="footer-icon" />
              <span>+91 93100 22664</span>
            </div>
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-icon" />
              <span>Gijhore Sector-53 Noida, UP, India</span>
            </div>
          </Col>

          {/* Navigation Links */}
          <Col md={4} className="footer-section text-center text-md-start">
            <h6 className="footer-heading">Quick Links</h6>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Signup</Link></li>
            </ul>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="text-center">
            <small className="footer-copy">
              © {new Date().getFullYear()} MITR SOS. All rights reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
