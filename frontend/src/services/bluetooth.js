const MITR_SERVICE_UUID = 'abababab-0000-0000-0000-000000000000';
const SETTINGS_CHAR_UUID = 'abababab-0000-0000-0000-000000000000';

class BluetoothService {
  static async checkAvailability() {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth API is not supported in this browser');
    }
    return await navigator.bluetooth.getAvailability();
  }

  static async scanDevices() {
    try {
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new Error('Bluetooth is not available on this device');
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [MITR_SERVICE_UUID]
      });

      return device;
    } catch (error) {
      console.error('Bluetooth scan error:', error);
      throw error;
    }
  }

  static async connect(deviceName = null) {
    try {
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new Error('Bluetooth is not available on this device');
      }

      const options = {
        optionalServices: [MITR_SERVICE_UUID]
      };

      if (deviceName) {
        options.filters = [{ name: deviceName }];
      } else {
        options.acceptAllDevices = true;
      }

      const device = await navigator.bluetooth.requestDevice(options);
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(MITR_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(SETTINGS_CHAR_UUID);

      return { 
        device, 
        characteristic,
        disconnect: () => {
          if (server.connected) {
            server.disconnect();
          }
        }
      };
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      throw error;
    }
  }

  static async sendSettings(connection, textContent) {
    try {
      if (!connection || !connection.characteristic) {
        throw new Error('No active Bluetooth connection');
      }

      console.log('Preparing to send emergency.txt to BLE device:', textContent);
      const encoder = new TextEncoder();
      const value = encoder.encode(textContent);
      await connection.characteristic.writeValue(value);
      console.log('emergency.txt sent successfully to BLE device');
      return true;
    } catch (error) {
      console.error('Error sending emergency.txt to BLE device:', error);
      throw error;
    }
  }

  static async sendSettingsWithRetry(connection, textContent, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await this.sendSettings(connection, textContent);
        return true;
      } catch (error) {
        attempts++;
        console.warn(`Bluetooth send attempt ${attempts} failed:`, error.message);
        if (attempts === maxRetries) {
          throw new Error(`Failed to send emergency.txt after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

export default BluetoothService;