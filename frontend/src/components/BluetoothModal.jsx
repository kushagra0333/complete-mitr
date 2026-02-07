import { useState, useEffect } from 'react';
import { Button, Spinner, Alert, ListGroup, Form, Modal } from 'react-bootstrap';
import { FaBluetooth, FaCheck, FaTimes, FaTrash, FaSearch } from 'react-icons/fa';
import BluetoothService from '../services/bluetooth';
import { updateEmergencyContacts, updateTriggerWords } from '../services/api.js';
import './BluetoothModal.css';

function BluetoothModal({ show, onHide, onSubmit, initialData }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [connection, setConnection] = useState(null);
  const [settings, setSettings] = useState({
    emergencyContacts: initialData?.emergencyContacts?.map(({ name, phone }) => ({ name, phone })) || [],
    triggerWords: initialData?.triggerWords || []
  });
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [newWord, setNewWord] = useState('');
  const [bluetoothSupported, setBluetoothSupported] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  useEffect(() => {
    if (show) {
      setBluetoothSupported('bluetooth' in navigator);
      if ('bluetooth' in navigator) {
        checkBluetoothAvailability();
      }
    }
  }, [show]);

  useEffect(() => {
    return () => {
      if (connection?.disconnect) {
        connection.disconnect();
      }
    };
  }, [connection]);

  const checkBluetoothAvailability = async () => {
    setStatus('checking');
    setError('');
    try {
      const isAvailable = await BluetoothService.checkAvailability();
      if (!isAvailable) {
        setError('Bluetooth is not available. Ensure Bluetooth is enabled.');
      }
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleScanDevices = async () => {
    if (!('bluetooth' in navigator)) {
      setError('Web Bluetooth API is not supported in your browser');
      return;
    }

    setStatus('scanning');
    setError('');
    try {
      const device = await BluetoothService.scanDevices();
      setDevices([device]);
      setSelectedDeviceId(device.id);
      setStatus('idle');
    } catch (err) {
      if (err.message.includes('User cancelled')) {
        setError('Device selection cancelled');
        setDevices([]);
        setSelectedDeviceId('');
      } else {
        setError(err.message || 'Failed to scan for devices');
      }
      setStatus('idle');
    }
  };

  const handleConnect = async () => {
    if (!selectedDeviceId) {
      setError('Please select a device first');
      return;
    }

    setStatus('connecting');
    setError('');
    try {
      const selectedDevice = devices.find(d => d.id === selectedDeviceId);
      const conn = await BluetoothService.connect(selectedDevice.name);
      setConnection(conn);
      setStatus('connected');
    } catch (err) {
      setError(err.message || 'Failed to connect to device');
      setStatus('error');
    }
  };

  const handleDisconnect = () => {
    if (connection?.disconnect) {
      connection.disconnect();
    }
    setConnection(null);
    setStatus('idle');
  };

  const handleAddContact = () => {
    if (settings.emergencyContacts.length >= 3) {
      setError('Maximum 3 emergency contacts allowed');
      return;
    }
    if (!newContact.name || !newContact.phone) {
      setError('Both name and phone are required');
      return;
    }
    if (!/^\+?[\d\s\-()]{10,}$/.test(newContact.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setSettings(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
    setNewContact({ name: '', phone: '' });
    setError('');
  };

  const handleAddWord = () => {
    const trimmedWord = newWord.trim();
    if (!trimmedWord) {
      setError('Trigger word cannot be empty');
      return;
    }
    if (settings.triggerWords.includes(trimmedWord)) {
      setError('This trigger word already exists');
      return;
    }

    setSettings(prev => ({
      ...prev,
      triggerWords: [...prev.triggerWords, trimmedWord]
    }));
    setNewWord('');
    setError('');
  };

  const handleRemoveContact = (index) => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveWord = (index) => {
    setSettings(prev => ({
      ...prev,
      triggerWords: prev.triggerWords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setStatus('saving');
      setError('');

      if (!initialData?.deviceId) {
        throw new Error('Device ID is required');
      }

      // Prepare text payload (JSON-formatted)
      const textPayload = {
        emergency_contact: settings.emergencyContacts.map(c => c.phone),
        trigger_word: settings.triggerWords
      };
      const textContent = JSON.stringify(textPayload, null, 2);

      // Ensure emergencyContacts only includes name and phone
      const sanitizedEmergencyContacts = settings.emergencyContacts.map(({ name, phone }) => ({
        name,
        phone
      }));

      // Pass to parent component for backend and BLE updates
      await onSubmit({
        emergencyContacts: sanitizedEmergencyContacts,
        triggerWords: settings.triggerWords,
        deviceConnection: connection,
        textContent
      });
      onHide();
    } catch (err) {
      console.error('Submission failed:', err);
      setError(`Failed to save settings: ${err.message}`);
      setStatus('error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBluetooth className="me-2" />
          BLE Device Settings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <div className="mb-4">
          <h5>BLE Device Connection</h5>
          
          {!bluetoothSupported ? (
            <Alert variant="warning">
              Web Bluetooth is not supported in your browser. Try Chrome, Edge, or Opera on desktop or Android.
            </Alert>
          ) : (
            <>
              <Button 
                variant="primary" 
                onClick={handleScanDevices}
                disabled={status === 'scanning' || status === 'connecting' || status === 'saving'}
                className="mb-3 neon-btn"
              >
                <FaSearch className="me-2" />
                Scan for BLE Devices
              </Button>

              {devices.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Device</Form.Label>
                  <Form.Select 
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                  >
                    <option value="">Select a device</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name || 'Unknown Device'} ({device.id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}

              {status === 'connected' ? (
                <Alert variant="success" className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FaCheck className="me-2" />
                    Connected to: <strong className="ms-1">{connection?.device?.name || 'Unknown Device'}</strong>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleDisconnect}
                  >
                    <FaTimes className="me-1" />
                    Disconnect
                  </Button>
                </Alert>
              ) : status === 'scanning' || status === 'connecting' ? (
                <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">
                    {status === 'scanning' ? 'Scanning for BLE devices...' : 'Connecting to device...'}
                  </p>
                </div>
              ) : (
                <Button 
                  variant="success" 
                  onClick={handleConnect}
                  disabled={!selectedDeviceId || status === 'saving'}
                  className="w-100 neon-btn"
                >
                  <FaBluetooth className="me-2" />
                  Connect to Selected Device
                </Button>
              )}
            </>
          )}
        </div>

        <div className="mb-4">
          <h5>Emergency Contacts</h5>
          <p className="text-muted small mb-2">Add up to 3 emergency contacts</p>
          
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Contact name"
              value={newContact.name}
              onChange={(e) => setNewContact({...newContact, name: e.target.value})}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Phone number with country code"
              value={newContact.phone}
              onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
            />
          </Form.Group>
          
          <Button 
            variant="outline-primary" 
            onClick={handleAddContact}
            disabled={!newContact.name || !newContact.phone || settings.emergencyContacts.length >= 3}
            className="w-100 neon-btn"
          >
            Add Contact
          </Button>
          
          {settings.emergencyContacts.length > 0 && (
            <ListGroup className="mt-3">
              {settings.emergencyContacts.map((contact, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{contact.name || 'Contact ' + (index + 1)}</strong>: {contact.phone}
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveContact(index)}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        <div className="mb-4">
          <h5>Trigger Words</h5>
          <p className="text-muted small mb-2">Add words that will trigger emergency alerts</p>
          
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              type="text"
              placeholder="New trigger word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            />
            <Button 
              variant="outline-primary" 
              onClick={handleAddWord}
              disabled={!newWord.trim()}
              className="neon-btn"
            >
              Add
            </Button>
          </div>
          
          {settings.triggerWords.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {settings.triggerWords.map((word, index) => (
                <span key={index} className="badge bg-primary d-flex align-items-center py-2">
                  {word}
                  <button 
                    className="btn-close btn-close-white ms-2" 
                    style={{ fontSize: '0.5rem' }}
                    onClick={() => handleRemoveWord(index)}
                    aria-label={`Remove ${word}`}
                  />
                </span>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mt-2">
              No trigger words added yet
            </Alert>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={status === 'saving'}
          className="neon-btn"
        >
          {status === 'saving' ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BluetoothModal;