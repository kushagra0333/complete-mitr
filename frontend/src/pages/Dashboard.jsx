import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceCard from '../components/DeviceCard';
import { getProfile, linkDevice } from '../services/api';
import './dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [devicePassword, setDevicePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Memoized fetch function with error handling
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser({
        ...response.data.user,
        devices: response.data.user.devices || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Optimized device linking with validation
  const handleLinkDevice = useCallback(async () => {
    try {
      setError('');
      const trimmedId = deviceId.trim();
      const trimmedPassword = devicePassword.trim();

      // Client-side validation
      if (!trimmedId || !trimmedPassword) {
        throw new Error('Device ID and password are required');
      }
      if (!/^[A-Za-z0-9]+$/.test(trimmedId)) {
        throw new Error('Device ID must be alphanumeric');
      }
      if (trimmedPassword.length < 6) {
        throw new Error('Device password must be at least 6 characters');
      }

      // API call
      await linkDevice({
        deviceId: trimmedId,
        devicePassword: trimmedPassword,
      });

      // Optimized profile update - only fetch if needed
      const profileResponse = await getProfile();
      setUser({
        ...profileResponse.data.user,
        devices: profileResponse.data.user.devices || [],
      });

      // Reset form
      setShowLinkModal(false);
      setDeviceId('');
      setDevicePassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to link device');
    }
  }, [deviceId, devicePassword]);

  // Early return for loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Early return if no user data
  if (!user) {
    return (
      <div className="dashboard">
        <div className="error-message">Failed to load user data</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-overlay"></div>

      <div className="dashboard-content">
        {/* User Profile Section */}
        <div className="user-profile-card">
          <h3 className="gradient-text">User Profile</h3>
          <div className="profile-details">
            <p><span>User ID:</span> {user.userID}</p>
            <p><span>Email:</span> {user.email}</p>
            <p><span>Devices Connected:</span> {user.deviceIds.length}</p>
            <p><span>Account Created:</span> {new Date(user.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Devices Section */}
        <div className="devices-section">
          <div className="devices-header">
            <h3 className="gradient-text">Your Devices</h3>
            <div className="device-actions">
              <button 
                className="glow-button" 
                onClick={() => setShowLinkModal(true)}
                aria-label="Add new device"
              >
                Add Device
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="devices-grid">
            {user.devices.length > 0 ? (
              user.devices.map(device => (
                <DeviceCard 
                  key={device._id} 
                  device={device} 
                  onClick={() => navigate(`/device/${device._id}`)}
                />
              ))
            ) : (
              <div className="no-devices">
                <p>No devices connected yet</p>
                <button 
                  className="glow-button"
                  onClick={() => setShowLinkModal(true)}
                >
                  Connect Your First Device
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Device Modal - Only rendered when needed */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="gradient-text">Link New Device</h3>
              <button 
                className="close-button" 
                onClick={() => { 
                  setShowLinkModal(false); 
                  setError(''); 
                }}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="deviceId">Device ID</label>
                <input
                  id="deviceId"
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="Enter device ID (e.g., MITRDEVX5T9K2)"
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="devicePassword">Device Password</label>
                <input
                  id="devicePassword"
                  type="password"
                  value={devicePassword}
                  onChange={(e) => setDevicePassword(e.target.value)}
                  placeholder="Enter device password (e.g., s3C4rT9z1Q)"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-button" 
                onClick={() => { 
                  setShowLinkModal(false); 
                  setError(''); 
                }}
              >
                Cancel
              </button>
              <button 
                className="glow-button" 
                onClick={handleLinkDevice}
                disabled={!deviceId.trim() || !devicePassword.trim()}
              >
                Link Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;