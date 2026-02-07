import { useNavigate } from 'react-router-dom';
import "./DeviceCard.css";
function DeviceCard({ device }) {
  const navigate = useNavigate();

  return (
    <div className="device-card" onClick={() => navigate(`/device/${device.deviceId}`)}>
      <div className="device-card-content">
        <h3 className="gradient-text">{device.deviceId}</h3>
        <div className="device-details">
          <p><span>Status:</span> {device.isTriggered ? 'Triggered' : 'Idle'}</p>
          <p><span>Emergency Contacts:</span> {(device.emergencyContacts || []).length}</p>
          <p><span>Trigger Words:</span> {(device.triggerWords || []).join(', ') || 'None'}</p>
          <p><span>Last Active:</span> {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Never'}</p>
        </div>
        <button className="view-details-button">
          View Details
        </button>
      </div>
    </div>
  );
}

export default DeviceCard;