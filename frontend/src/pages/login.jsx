import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Card } from 'react-bootstrap';
import Logo from '../assets/logo-2.png';
import { login } from '../services/api';
import './auth.css';

function Login() {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ userID, password });
      localStorage.setItem('mitr-token', response.data.token);
      localStorage.setItem('mitr-user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
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
              <h4 className="text-white mt-3">Login to <span className="text-gradient">MITR</span></h4>
            </div>
            {error && <div className="error-message">{error}</div>}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="loginUserID">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter user ID"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" className="w-100 text-dark fw-bold auth-btn neon-btn">
                Login
              </Button>
            </Form>
            <div className="text-center mt-4">
              <p className="text-light">
                Don't have an account? <Link to="/signup" className="auth-link">Signup</Link>
              </p>
              <p className="text-light">
                Forgot password? <Link to="/forgot-password" className="auth-link">Reset</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;