# Smart Campus Safety System 🛡️

> A comprehensive real-time student safety and emergency monitoring platform for educational institutions.

![Tech Stack](https://img.shields.io/badge/React-18.3.1-blue)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)

## 🚀 Features

### 🎯 Core Features
- ✅ **Real-time GPS Tracking** - Live student location monitoring with Google Maps
- ✅ **SOS Emergency System** - Instant emergency alerts with one-click activation
- ✅ **Multi-Role Dashboards** - Separate interfaces for Admin, Students, Parents, and Security
- ✅ **Fall Detection** - Automatic alert when fall is detected via accelerometer
- ✅ **Geo-Fencing** - Safe zone monitoring with automatic exit alerts
- ✅ **Health Monitoring** - Real-time heart rate and vital signs tracking
- ✅ **Push Notifications** - Firebase Cloud Messaging for instant alerts
- ✅ **Device Management** - Monitor and manage all connected IoT devices
- ✅ **Analytics Dashboard** - Comprehensive data visualization and reports

### 👥 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system access, user management, analytics, emergency response |
| **Student** | Personal dashboard, SOS button, location sharing, emergency contacts |
| **Parent** | Child tracking, safety alerts, activity logs, schedule monitoring |
| **Security** | Emergency response, incident management, live monitoring |

## 🏗️ Tech Stack

### Frontend
- **React 18.3.1** + **TypeScript**
- **Tailwind CSS v4** - Modern utility-first CSS
- **React Router v7** - Client-side routing
- **Formik + Yup** - Form handling and validation
- **Motion** - Smooth animations
- **Recharts** - Data visualization
- **@react-google-maps/api** - Maps integration

### Backend & Services
- **Firebase Authentication** - Secure user authentication
- **Firestore Database** - Real-time NoSQL database
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Hosting** - Web app hosting
- **Google Maps API** - Location services

### IoT/Hardware
- **ESP32** - WiFi-enabled microcontroller
- **GPS Module (NEO-6M)** - Location tracking
- **Pulse Sensor** - Heart rate monitoring
- **MPU6050** - Accelerometer for fall detection

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Firebase account
- Google Cloud account (for Maps API)
- (Optional) ESP32 and sensors for hardware integration

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-campus-safety.git
cd smart-campus-safety

# Install dependencies
pnpm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password)
3. Create **Firestore Database**
4. Get your Firebase config from Project Settings

5. Update `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 3. Google Maps Setup

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API, Geocoding API, Places API
3. Update `src/pages/LiveTracking.tsx`:

```typescript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
```

### 4. Run Development Server

```bash
pnpm run dev
```

Visit `http://localhost:5173`

## 📁 Project Structure

```
smart-campus-safety/
├── src/
│   ├── app/
│   │   └── App.tsx              # Main app with routing
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── StatCard.tsx         # Dashboard cards
│   │   └── ProtectedRoute.tsx   # Route guards
│   ├── config/
│   │   └── firebase.ts          # Firebase config
│   ├── contexts/
│   │   └── AuthContext.tsx      # Auth state management
│   ├── pages/
│   │   ├── LandingPage.tsx      # Public homepage
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Registration
│   │   ├── AdminDashboard.tsx   # Admin panel
│   │   ├── StudentDashboard.tsx # Student panel
│   │   ├── ParentDashboard.tsx  # Parent panel
│   │   └── LiveTracking.tsx     # GPS tracking map
│   └── styles/
│       ├── theme.css            # Tailwind theme
│       └── fonts.css            # Font imports
├── package.json
├── tsconfig.json
├── DOCUMENTATION.md             # Full documentation
└── README.md
```

## 🎨 UI Theme

The application uses a **dark blue professional theme** with:

- **Primary Colors**: Dark blue gradients (#0a1628, #152238, #1a2f4a)
- **Accent Colors**: Blue (#3b82f6), Green (#10b981), Red (#ef4444)
- **Effects**: Glassmorphism, backdrop blur, neon indicators
- **Typography**: Professional, clean, hierarchical
- **Animations**: Smooth Motion animations for interactions

## 🔐 Authentication

### User Registration

```typescript
// Example signup
await signup(
  "student@campus.edu",
  "SecurePass123!",
  "student",
  {
    name: "John Doe",
    phone: "+1234567890",
    studentId: "STU2023001"
  }
);
```

### Role-Based Access

Routes are protected based on user roles:

```typescript
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 📊 Database Schema

### Key Collections

**users** - User accounts and profiles
```json
{
  "uid": "user123",
  "email": "student@campus.edu",
  "role": "student",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**liveLocations** - Real-time GPS data
```json
{
  "studentId": "STU2023001",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "battery": 87,
  "timestamp": "2026-05-16T10:30:00Z"
}
```

**alerts** - Emergency notifications
```json
{
  "type": "SOS",
  "studentId": "STU2023001",
  "location": { "latitude": 40.7128, "longitude": -74.0060 },
  "status": "active",
  "severity": "high"
}
```

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete database design.

## 🤖 IoT Integration

### Hardware Setup

Connect to ESP32:
1. GPS Module → UART2 (TX: GPIO 16, RX: GPIO 17)
2. Pulse Sensor → GPIO 34 (ADC)
3. MPU6050 → I2C (SDA: GPIO 21, SCL: GPIO 22)

### Data Flow

```
Sensors → ESP32 → WiFi → Firebase → React Dashboard
```

ESP32 sends data every 5 seconds via HTTP PUT to Firestore. React receives real-time updates via `onSnapshot()` listeners.

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete Arduino code and wiring diagrams.

## 🗺️ Google Maps Features

- **Live Markers** - Real-time student locations
- **Info Windows** - Detailed student info on click
- **Safe Zones** - Circular geo-fences with custom styling
- **Custom Map Theme** - Dark mode to match UI
- **Emergency Indicators** - Blinking red markers for alerts
- **Clustering** - Group nearby markers for performance

## 📱 Push Notifications

Firebase Cloud Messaging sends alerts for:
- ⚠️ SOS emergency activation
- 🚨 Fall detection events
- 🔋 Low battery warnings
- 📍 Safe zone exit alerts
- ❤️ Abnormal heart rate detected

## 🧪 Testing

### Test Accounts

**Admin:**
- Email: `admin@campus.edu`
- Password: `Admin123!`

**Student:**
- Email: `student@campus.edu`
- Password: `Student123!`

**Parent:**
- Email: `parent@campus.edu`
- Password: `Parent123!`

(Create these accounts via signup page)

## 🚀 Deployment

### Firebase Hosting

```bash
# Build for production
pnpm run build

# Deploy to Firebase
firebase deploy
```

### Vercel

```bash
# Deploy with Vercel
vercel
```

## 📚 Documentation

For comprehensive documentation, see:
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Complete setup guide
- [Firebase Setup](./DOCUMENTATION.md#firebase-setup-guide)
- [IoT Integration](./DOCUMENTATION.md#iot-hardware-integration)
- [Database Design](./DOCUMENTATION.md#database-design)
- [API Architecture](./DOCUMENTATION.md#api-architecture)

## 🛠️ Development

### Available Scripts

```bash
pnpm run dev       # Start development server
pnpm run build     # Build for production
pnpm run preview   # Preview production build
```

### Environment Variables

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

## 🎓 Final Year Project (FYP)

This project is designed as a comprehensive Final Year Project demonstrating:

- ✅ Full-stack web development (React + Firebase)
- ✅ Real-time systems and WebSockets
- ✅ IoT hardware integration
- ✅ GPS and location services
- ✅ Authentication and security
- ✅ Role-based access control
- ✅ Data visualization and analytics
- ✅ Mobile-responsive design
- ✅ Production-ready code quality

## 📄 License

MIT License - feel free to use for educational purposes.

## 🤝 Contributing

This is a student project. Feel free to fork and modify for your own FYP!

## 📧 Contact

For questions or support:
- GitHub Issues: [Create an issue](https://github.com/yourusername/smart-campus-safety/issues)
- Email: your.email@example.com

---

**Built with ❤️ for campus safety**

*Smart Campus Safety System - Making educational institutions safer through technology*
