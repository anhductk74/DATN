// API Configuration
export const API_CONFIG = {
  // Change to your computer's IP address when testing on physical device
  // Find IP: ipconfig (Windows) or ifconfig (Mac/Linux)
  BASE_URL: 'http://10.0.2.2:8080/api', // For Android Emulator
  // BASE_URL: 'http://localhost:8080/api', // For iOS Simulator or Web
  // BASE_URL: 'http://YOUR_IP:8080/api', // For physical device (replace YOUR_IP)
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Google OAuth Configuration
export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: 'your_google_client_id',
  // Add more OAuth config as needed
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Smart Mall',
  APP_VERSION: '1.0.0',
  CURRENCY: 'VND',
};

export default {
  API_CONFIG,
  GOOGLE_OAUTH_CONFIG,
  APP_CONFIG,
};
