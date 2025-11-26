# Smart Mall Mobile App

E-commerce mobile application built with React Native and Expo.

## Features

### Authentication
- **Email-based Login**: Users receive a 6-digit verification code via email
- **Registration**: Create new account with email, password, full name, and phone number
- **Secure Authentication**: JWT-based authentication system

## Getting Started

### Prerequisites
- Node.js (v20.17.0 or higher)
- npm or yarn
- Expo CLI
- Backend server running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start the app
npm start
```

### Running the App

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## Project Structure

```
smartmall-mobile-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.tsx       # Email login with verification code
│   │   └── RegisterScreen.tsx    # User registration
│   ├── navigation/
│   │   └── AppNavigator.tsx      # Navigation configuration
│   └── services/
│       └── authService.ts        # Authentication API service
├── App.tsx                       # Main app component
└── package.json
```

## API Integration

The app connects to the backend API running on `http://localhost:8080`. Make sure the backend server is running before using the app.

### Backend Endpoints Used:
- `POST /api/auth/register` - User registration
- `POST /api/auth/mobile/send-login-code` - Send verification code to email
- `POST /api/auth/mobile/verify-login-code` - Verify code and login

### Configuring API URL

Edit `src/services/authService.ts` to change the API base URL:

```typescript
const API_BASE_URL = 'http://your-api-url:8080/api/auth';
```

**Note**: For testing on physical devices or emulators, replace `localhost` with your computer's IP address.

## Screens

### Login Screen
- Enter email address
- Receive 6-digit verification code via email
- Enter verification code to login
- Option to resend code or change email
- Link to registration screen

### Registration Screen
- Email address (required)
- Full name (required)
- Phone number (optional)
- Password (minimum 6 characters)
- Confirm password
- Automatically logs in after successful registration

## Dependencies

- **React Native**: Mobile framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **Axios**: HTTP client for API requests
- **TypeScript**: Type-safe development

## Color Scheme

- Primary Color: `#2563eb` (Blue)
- Background: `#fff` (White)
- Input Background: `#f5f5f5` (Light Gray)
- Text: `#333` (Dark Gray)
- Secondary Text: `#666` (Medium Gray)
- Placeholder: `#999` (Light Gray)

## Notes

- All UI text is in English
- Email verification code expires after 5 minutes
- Passwords must be at least 6 characters long
- Email addresses must be in valid format
- Phone number is optional during registration

## Troubleshooting

### Connection Error
If you get connection errors:
1. Make sure the backend server is running
2. Check if the API_BASE_URL is correct
3. For Android emulator, use `http://10.0.2.2:8080`
4. For iOS simulator, use `http://localhost:8080`
5. For physical devices, use your computer's IP address

### Email Not Received
1. Check spam/junk folder
2. Verify email configuration in backend
3. Check backend logs for email sending errors

## Future Enhancements

- [ ] Add Google Sign-In
- [ ] Add password reset functionality
- [ ] Add user profile management
- [ ] Add biometric authentication
- [ ] Add dark mode support
- [ ] Add multi-language support
