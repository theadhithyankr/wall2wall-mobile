# Wall2Wall App Setup Guide

## Repository
- **GitHub Repository**: https://github.com/theadhithyankr/Wall2Wall.git

## Prerequisites

Before running this app, make sure you have the following installed on your system:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** package manager (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

### For Mobile Development
- **Expo CLI** - Will be installed automatically
- **Expo Go app** on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### For iOS Development (Mac only)
- **Xcode** (latest version)
- **iOS Simulator** (comes with Xcode)

### For Android Development
- **Android Studio**
- **Android SDK**
- **Android Emulator** or physical Android device

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/theadhithyankr/Wall2Wall.git
cd Wall2Wall
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
# Start Expo development server
npm start

# For web development
npm run start-web
```

### 4. Run on Different Platforms

After starting the development server, you can:

**Web Browser:**
- Press `w` in the terminal, or
- Open http://localhost:8081 in your browser

**Mobile Device:**
- Install Expo Go app on your phone
- Scan the QR code displayed in the terminal

**iOS Simulator (Mac only):**
- Press `i` in the terminal
- Or run: `npm run ios`

**Android Emulator:**
- Press `a` in the terminal
- Or run: `npm run android`

## Project Structure

```
Wall2Wall/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   ├── login.tsx          # Authentication screens
│   ├── otp.tsx
│   └── ...
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Data)
│   ├── services/          # API and external services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── assets/                # Images and static assets
└── package.json
```

## Key Dependencies

This app uses the following main libraries:

- **Expo Router** - File-based navigation
- **React Native** - Mobile app framework
- **TypeScript** - Type safety
- **Lucide React Native** - Icons
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **NativeWind** - Tailwind CSS for React Native
- **Expo Location** - GPS and location services
- **React Native Gesture Handler** - Touch gestures

## Environment Setup

### Firebase Configuration (if applicable)
If the app uses Firebase, create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### Location Services
The app requires location permissions. Make sure to:
1. Enable location services on your device
2. Grant location permissions when prompted

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npm start -- --clear
```

**Node modules issues:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Expo CLI issues:**
```bash
npm install -g @expo/cli@latest
```

**iOS Simulator not opening:**
- Make sure Xcode is installed and updated
- Open Xcode and accept license agreements
- Try: `sudo xcode-select --install`

**Android emulator issues:**
- Make sure Android Studio is installed
- Create and start an Android Virtual Device (AVD)
- Check that Android SDK is properly configured

### Performance Tips

1. **Use physical devices** for better performance than simulators
2. **Enable Hermes** (already configured in newer Expo versions)
3. **Clear cache** if experiencing bundle issues
4. **Restart Metro bundler** if hot reload stops working

## Development Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Run on specific platforms
npm run ios
npm run android
npm run start-web

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## Building for Production

### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Local Build
```bash
# For web
npm run build-web

# For native platforms, use EAS Build or Expo Application Services
```

## Support

If you encounter any issues:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review the [React Native documentation](https://reactnative.dev/docs/getting-started)
3. Search for solutions in the project's issue tracker
4. Make sure all dependencies are up to date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple platforms
5. Submit a pull request

---

**Happy coding! 🚀**