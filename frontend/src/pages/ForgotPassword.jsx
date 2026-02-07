import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import Logo from '../assets/logo-2.png';
import { forgotPassword, resetPassword } from '../services/api';
import './auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    try {
      await forgotPassword({ email: formData.email });
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email address.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setError('');
      alert('Password reset successfully');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Invalid OTP or reset failed. Please try again.');
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
                Reset Your <span className="text-gradient">MITR</span> Password
              </h4>
            </div>
            {error && <div className="error-message">{error}</div>}
            {step === 1 ? (
              <Form onSubmit={handleForgotPassword}>
                <Form.Group className="mb-3" controlId="forgotPasswordEmail">
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
                <Button type="submit" className="w-100 text-dark fw-bold auth-btn neon-btn">
                  Send OTP
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleResetPassword}>
                <Form.Group className="mb-3" controlId="resetPasswordEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="resetPasswordOTP">
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
                    <Form.Group className="mb-3" controlId="resetPasswordNew">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="resetPasswordConfirm">
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
                  Reset Password
                </Button>
                <Button
                  variant="secondary"
                  className="w-100 mt-2"
                  onClick={() => {
                    setStep(1);
                    setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
                    setError('');
                  }}
                >
                  Back
                </Button>
              </Form>
            )}
            <div className="text-center mt-4">
              <p className="text-light">
                Back to <Link to="/login" className="auth-link">Login</Link>
              </p>
              {step === 1 && (
                <p className="text-light">
                  Don't have an account? <Link to="/signup" className="auth-link">Signup</Link>
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ForgotPassword;