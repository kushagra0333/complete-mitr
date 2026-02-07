// Signup.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import Logo from '../assets/logo-2.png';
import { signupInitiate, signupComplete } from '../services/api';
import './auth.css';

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    userID: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    try {
      await signupInitiate({
        name: formData.name,
        userID: formData.userID,
        email: formData.email,
      });
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
  };
  
const handleComplete = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  try {
    const response = await signupComplete({
      name: formData.name,
      userID: formData.userID,
      email: formData.email,
      otp: formData.otp,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
    
    // Check if response exists and has data
    if (response && response.data) {
      localStorage.setItem('mitr-token', response.data.token);
      localStorage.setItem('mitr-user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } else {
      setError('Invalid response from server');
    }
  } catch (err) {
    setError(err.message || 'Invalid OTP');
  }
};
  return (
    <div className="auth-background">
      <div className="auth-overlay-glow" />
      <Container className="auth-container">
        <Card className="auth-card glass-effect animate-slide-up">
          <Card.Body>
            <div className="text-center mb-4">
              <img src={Logo} alt="MITR Logo" className="auth-logo glow-pulse" />
              <h4 className="text-white mt-3">
                Create Your <span className="text-gradient">MITR</span> Account
              </h4>
            </div>
            {error && <div className="error-message">{error}</div>}
            {step === 1 ? (
              <Form onSubmit={handleInitiate}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="signupName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="signupUserID">
                      <Form.Label>User ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="userID"
                        placeholder="Choose a user ID"
                        value={formData.userID}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="signupEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" className="w-100 text-dark fw-bold auth-btn neon-btn">
                  Send OTP
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleComplete}>
                <Form.Group className="mb-3" controlId="signupOTP">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="signupPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="signupConfirmPassword">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" className="w-100 text-dark fw-bold auth-btn neon-btn">
                  Complete Signup
                </Button>
              </Form>
            )}
            <div className="text-center mt-4">
              <p className="text-light">
                Already have an account? <Link to="/login" className="auth-link">Login</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Signup;