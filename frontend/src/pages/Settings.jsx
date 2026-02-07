import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, updateUserInfo, deleteAccount } from '../services/api';
import './settings.css';

function Settings() {
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userInfo, setUserInfo] = useState({
    name: '',
    userID: '',
  });
  const [previousUserInfo, setPreviousUserInfo] = useState({
    name: '',
    userID: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('mitr-token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Load previous user info from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('mitr-user'));
    if (user) {
      setPreviousUserInfo({
        name: user.name || user.userID || '', // Fallback to userID or empty string
        userID: user.userID || '',
      });
    }
  }, []);

  // Generate random color for avatar
  const getRandomColor = () => {
    const colors = ['#bb86fc', '#e040fb', '#ff4dda', '#6200ea', '#d81b60'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { currentPassword, newPassword, confirmPassword } = changePasswordData;

    // Basic frontend validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserInfo = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, userID } = userInfo;

    // Validate inputs
    if (!name && !userID) {
      setError('At least one field (name or user ID) must be provided');
      setLoading(false);
      return;
    }

    try {
      const payload = {};
      if (name) payload.name = name;
      if (userID) payload.userID = userID;

      const response = await updateUserInfo(payload);
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('mitr-user')),
        userID: userID || previousUserInfo.userID,
        name: name || previousUserInfo.name,
      };
      localStorage.setItem('mitr-user', JSON.stringify(updatedUser));
      setPreviousUserInfo({
        name: name || previousUserInfo.name,
        userID: userID || previousUserInfo.userID,
      });
      setUserInfo({ name: '', userID: '' });
      alert('User information updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setLoading(true);

    try {
      await deleteAccount();
      localStorage.removeItem('mitr-token');
      localStorage.removeItem('mitr-user');
      alert('Account deleted successfully');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-background">
      <div className="settings-overlay-glow" />
      <Container className="settings-container">
        <Card className="settings-card glass-effect animate-slide-up">
          <Card.Body>
            <h3 className="text-gradient">Settings</h3>
            {error && <div className="error-message">{error}</div>}

            {/* User Info Display */}
            {previousUserInfo.name && previousUserInfo.userID && (
              <div className="user-info-display mb-4">
                <div
                  className="user-avatar"
                  style={{ backgroundColor: getRandomColor() }}
                  aria-label={`Avatar for ${previousUserInfo.name}`}
                >
                  {previousUserInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="text-gradient">Current User Info</h5>
                  <p>
                    <strong>Name:</strong> {previousUserInfo.name}
                  </p>
                  <p>
                    <strong>User ID:</strong> {previousUserInfo.userID}
                  </p>
                </div>
              </div>
            )}

            {/* Update User Information */}
            <h4 className="text-gradient mt-4">Update User Information</h4>
            <Form onSubmit={handleUpdateUserInfo}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={userInfo.name}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, name: e.target.value })
                      }
                      placeholder="Enter new name"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>User ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={userInfo.userID}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, userID: e.target.value })
                      }
                      placeholder="Enter new user ID"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" className="neon-btn" disabled={loading}>
                {loading ? 'Updating...' : 'Update User Info'}
              </Button>
            </Form>

            {/* Change Password */}
            <h4 className="text-gradient mt-4">Change Password</h4>
            <Form onSubmit={handleChangePassword}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={changePasswordData.currentPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={changePasswordData.newPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={changePasswordData.confirmPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" className="neon-btn" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
              <div className="text-center mt-3">
                <p className="text-light">
                  Forgot password?{' '}
                  <Link to="/forgot-password" className="auth-link">
                    Reset Password
                  </Link>
                </p>
              </div>
            </Form>

            {/* Delete Account */}
            <h4 className="text-gradient mt-4">Delete Account</h4>
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-2"
              disabled={loading}
            >
              Delete Account
            </Button>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="delete-confirm-overlay">
                <div className="delete-confirm-box glass-effect">
                  <h5 className="text-gradient">Confirm Account Deletion</h5>
                  <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    className="me-2"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Settings;