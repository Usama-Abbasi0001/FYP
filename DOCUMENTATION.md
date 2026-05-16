# Smart Campus Safety System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Firebase Setup Guide](#firebase-setup-guide)
5. [Database Design](#database-design)
6. [Google Maps Integration](#google-maps-integration)
7. [IoT/Hardware Integration](#iot-hardware-integration)
8. [API Architecture](#api-architecture)
9. [Authentication Flow](#authentication-flow)
10. [Deployment Guide](#deployment-guide)

---

## Project Overview

The **Smart Campus Safety System** is a comprehensive real-time student safety and emergency monitoring platform that combines:
- IoT devices (ESP32, GPS modules, sensors)
- Real-time location tracking
- Emergency SOS system
- Parent monitoring dashboard
- Admin control panel

### Key Features
- ✅ Real-time GPS tracking with Google Maps
- ✅ SOS emergency alerts
- ✅ Fall detection and health monitoring
- ✅ Safe zone geo-fencing
- ✅ Multi-role authentication (Admin, Student, Parent, Security)
- ✅ Live device monitoring
- ✅ Firebase real-time database sync
- ✅ Push notifications via FCM

---

## Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router v7** - Routing
- **Formik + Yup** - Form validation
- **Recharts** - Data visualization
- **Motion (Framer Motion)** - Animations
- **@react-google-maps/api** - Maps integration

### Backend
- **Firebase Authentication** - User management
- **Firestore Database** - NoSQL database
- **Firebase Cloud Messaging (FCM)** - Push notifications
- **Firebase Storage** - File storage

### IoT/Hardware
- **ESP32** - Microcontroller
- **GPS Module (NEO-6M/7M)** - Location tracking
- **Pulse Sensor** - Heart rate monitoring
- **MPU6050** - Accelerometer (fall detection)
- **MQTT/HTTP** - Communication protocol

---

## Project Structure

```
smart-campus-safety/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Main app with routing
│   │   └── components/             # Reusable components
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx
│   │       └── ...
│   ├── components/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── StatCard.tsx            # Dashboard stat cards
│   │   └── ProtectedRoute.tsx      # Route protection
│   ├── config/
│   │   └── firebase.ts             # Firebase configuration
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── pages/
│   │   ├── LandingPage.tsx         # Public landing page
│   │   ├── Login.tsx               # Login page
│   │   ├── Signup.tsx              # Registration page
│   │   ├── ForgotPassword.tsx      # Password reset
│   │   ├── AdminDashboard.tsx      # Admin panel
│   │   ├── StudentDashboard.tsx    # Student panel
│   │   ├── ParentDashboard.tsx     # Parent panel
│   │   └── LiveTracking.tsx        # GPS tracking map
│   ├── styles/
│   │   ├── theme.css               # Tailwind theme
│   │   └── fonts.css               # Font imports
│   └── imports/                    # Figma imports
├── package.json
├── tsconfig.json
└── DOCUMENTATION.md
```

---

## Firebase Setup Guide

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `smart-campus-safety`
4. Enable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** authentication
4. (Optional) Enable additional providers (Google, etc.)

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Start in **Test Mode** (for development)
4. Choose your region (e.g., `us-central1`)
5. Click "Enable"

### Step 4: Enable Cloud Messaging

1. Go to **Cloud Messaging**
2. Note your **Server Key** and **Sender ID**
3. These will be used for push notifications

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon `</>`
4. Register your app name: `Smart Campus Safety Web`
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "smart-campus-safety.firebaseapp.com",
  projectId: "smart-campus-safety",
  storageBucket: "smart-campus-safety.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

6. Replace the values in `src/config/firebase.ts`

### Step 6: Configure Firestore Security Rules

In Firestore, go to **Rules** tab and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || request.auth.token.role == 'security');
    }
    
    // Live locations
    match /liveLocations/{locationId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Alerts
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.token.role in ['admin', 'security'];
    }
  }
}
```

---

## Database Design

### Firestore Collections

#### 1. **users** Collection
Stores all user account information.

```javascript
{
  uid: "user123",                    // Auto-generated
  email: "student@campus.edu",
  role: "student",                   // admin | student | parent | security
  name: "John Doe",
  phone: "+1234567890",
  studentId: "STU2023001",          // For students only
  parentOf: ["student_uid1"],        // For parents only
  createdAt: "2026-05-16T10:00:00Z",
  emailVerified: true,
  profilePhoto: "url_to_photo"
}
```

#### 2. **students** Collection
Detailed student profiles.

```javascript
{
  studentId: "STU2023001",
  uid: "user123",                    // Reference to users collection
  fullName: "John Doe",
  grade: "10th Grade",
  section: "A",
  deviceId: "ESP32-001",
  parentId: "parent_uid",
  emergencyContacts: [
    {
      name: "Parent",
      phone: "+1234567890",
      relation: "Father"
    }
  ],
  status: "active",                  // active | inactive | suspended
  safeZones: ["zone1", "zone2"]
}
```

#### 3. **liveLocations** Collection
Real-time GPS coordinates.

```javascript
{
  studentId: "STU2023001",
  deviceId: "ESP32-001",
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  accuracy: 10,                      // meters
  timestamp: "2026-05-16T10:30:00Z",
  battery: 87,                       // percentage
  speed: 0,                          // km/h
  heading: 0,                        // degrees
  inSafeZone: true
}
```

#### 4. **alerts** Collection
Emergency and safety alerts.

```javascript
{
  alertId: "alert123",
  type: "SOS",                       // SOS | fall_detected | safe_zone_exit | low_battery
  studentId: "STU2023001",
  studentName: "John Doe",
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  timestamp: "2026-05-16T10:45:00Z",
  status: "active",                  // active | acknowledged | resolved
  severity: "high",                  // high | medium | low
  resolvedBy: "admin_uid",
  resolvedAt: "2026-05-16T11:00:00Z",
  notes: "Student assisted by security"
}
```

#### 5. **devices** Collection
IoT device registry.

```javascript
{
  deviceId: "ESP32-001",
  type: "ESP32",
  assignedTo: "STU2023001",
  status: "online",                  // online | offline | maintenance
  battery: 87,
  firmwareVersion: "1.2.0",
  lastSync: "2026-05-16T10:30:00Z",
  sensors: {
    gps: true,
    heartRate: true,
    accelerometer: true
  }
}
```

#### 6. **safeZones** Collection
Geo-fenced safe areas.

```javascript
{
  zoneId: "zone1",
  name: "Main Campus",
  center: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  radius: 500,                       // meters
  type: "campus",                    // campus | building | outdoor
  active: true,
  alertOnExit: true
}
```

#### 7. **notifications** Collection
Push notification logs.

```javascript
{
  notificationId: "notif123",
  userId: "user123",
  title: "Low Battery Alert",
  message: "Your child's device battery is low (12%)",
  type: "warning",
  read: false,
  timestamp: "2026-05-16T10:45:00Z",
  data: {
    studentId: "STU2023001",
    battery: 12
  }
}
```

### Database Relationships

```
users (1) -----> (1) students
users (1) -----> (N) liveLocations
students (1) --> (1) devices
students (1) --> (N) alerts
students (N) --> (N) safeZones
```

---

## Google Maps Integration

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

### Step 2: Restrict API Key (Security)

1. Click on your API key
2. Under **Application restrictions**, select **HTTP referrers**
3. Add your domains:
   ```
   localhost:*
   yourdomain.com/*
   ```
4. Under **API restrictions**, select **Restrict key**
5. Choose the APIs you enabled

### Step 3: Add API Key to Project

Replace in `src/pages/LiveTracking.tsx`:

```typescript
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
```

### How Real-time Tracking Works

1. **Device sends GPS data** → ESP32 reads GPS coordinates
2. **HTTP POST to Firebase** → Device sends data to Firestore
3. **Firestore triggers update** → Real-time listener detects change
4. **React receives update** → `onSnapshot()` callback fires
5. **Map updates marker** → Google Maps API moves marker

```typescript
// Example: Real-time location listener
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'liveLocations'),
    (snapshot) => {
      const locations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudentLocations(locations);
    }
  );
  
  return () => unsubscribe();
}, []);
```

---

## IoT/Hardware Integration

### Hardware Components

1. **ESP32 DevKit**
   - WiFi enabled microcontroller
   - Connects sensors to cloud
   - Cost: ~$5-10

2. **GPS Module (NEO-6M)**
   - Provides latitude/longitude
   - Cost: ~$10-15

3. **Pulse Sensor**
   - Monitors heart rate
   - Cost: ~$5-8

4. **MPU6050 Accelerometer**
   - Detects falls/impacts
   - Cost: ~$3-5

5. **Battery**
   - 3.7V Li-Po battery
   - Capacity: 2000mAh+
   - Cost: ~$5-10

### Wiring Diagram

```
ESP32 Connections:
├── GPS Module (NEO-6M)
│   ├── VCC → 3.3V
│   ├── GND → GND
│   ├── TX → RX2 (GPIO 16)
│   └── RX → TX2 (GPIO 17)
├── Pulse Sensor
│   ├── VCC → 3.3V
│   ├── GND → GND
│   └── Signal → GPIO 34 (ADC)
├── MPU6050 Accelerometer
│   ├── VCC → 3.3V
│   ├── GND → GND
│   ├── SDA → GPIO 21
│   └── SCL → GPIO 22
└── Battery
    ├── + → VIN
    └── - → GND
```

### ESP32 Arduino Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <MPU6050.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase endpoint
const char* firebaseUrl = "https://smart-campus-safety.firebaseio.com/liveLocations/STU2023001.json";

// GPS
TinyGPSPlus gps;
HardwareSerial GPS_Serial(2);

// MPU6050
MPU6050 mpu;

// Variables
float latitude = 0.0;
float longitude = 0.0;
int heartRate = 0;
float accelX, accelY, accelZ;
int batteryLevel = 100;

void setup() {
  Serial.begin(115200);
  GPS_Serial.begin(9600, SERIAL_8N1, 16, 17);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  
  // Initialize MPU6050
  Wire.begin();
  mpu.initialize();
}

void loop() {
  // Read GPS
  while (GPS_Serial.available() > 0) {
    if (gps.encode(GPS_Serial.read())) {
      if (gps.location.isValid()) {
        latitude = gps.location.lat();
        longitude = gps.location.lng();
      }
    }
  }
  
  // Read accelerometer
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);
  accelX = ax / 16384.0;
  accelY = ay / 16384.0;
  accelZ = az / 16384.0;
  
  // Detect fall (simple threshold)
  float magnitude = sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ);
  bool fallDetected = (magnitude > 3.0); // Adjust threshold
  
  // Read heart rate (simplified)
  heartRate = analogRead(34) / 10; // Simplified calculation
  
  // Read battery
  batteryLevel = map(analogRead(35), 0, 4095, 0, 100);
  
  // Send data to Firebase
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(firebaseUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{";
    payload += "\"latitude\":" + String(latitude, 6) + ",";
    payload += "\"longitude\":" + String(longitude, 6) + ",";
    payload += "\"heartRate\":" + String(heartRate) + ",";
    payload += "\"battery\":" + String(batteryLevel) + ",";
    payload += "\"fallDetected\":" + String(fallDetected ? "true" : "false") + ",";
    payload += "\"timestamp\":\"" + String(millis()) + "\"";
    payload += "}";
    
    int httpCode = http.PUT(payload); // Use PUT to update
    
    if (httpCode > 0) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data");
    }
    
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}
```

### Data Flow

```
┌─────────────┐
│   Sensors   │
│  (GPS, HR,  │
│   Accel.)   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    ESP32    │
│ (WiFi/MQTT) │
└──────┬──────┘
       │ HTTP POST
       ↓
┌─────────────┐
│   Firebase  │
│  Firestore  │
└──────┬──────┘
       │ Real-time
       │ Listener
       ↓
┌─────────────┐
│   React     │
│  Dashboard  │
└─────────────┘
```

---

## API Architecture

### Authentication APIs

```typescript
// Signup
POST /auth/signup
Body: { email, password, role, name, phone }
Response: { user, token }

// Login
POST /auth/login
Body: { email, password }
Response: { user, token }

// Password Reset
POST /auth/reset-password
Body: { email }
Response: { success: true }
```

### Device APIs

```typescript
// Update Live Location
PUT /liveLocations/{studentId}
Body: { latitude, longitude, battery, timestamp }
Headers: { Authorization: "Bearer device_token" }

// Send Alert
POST /alerts
Body: { type, studentId, location, severity }
Response: { alertId, status }
```

### Tracking APIs

```typescript
// Get Student Location
GET /liveLocations/{studentId}
Response: { latitude, longitude, timestamp, battery }

// Get All Students (Admin only)
GET /liveLocations
Response: [{ studentId, location, status }]
```

### Notification APIs

```typescript
// Send Push Notification
POST /notifications/send
Body: { userId, title, message, data }

// Get User Notifications
GET /notifications/user/{userId}
Response: [{ title, message, timestamp, read }]
```

---

## Authentication Flow

```
User Registration:
1. User fills signup form
2. Frontend validates with Yup
3. Firebase creates user account
4. User document created in Firestore
5. Email verification sent
6. Redirect to login

User Login:
1. User enters credentials
2. Firebase authenticates
3. Fetch user data from Firestore
4. Store in AuthContext
5. Redirect based on role:
   - Admin → /dashboard/admin
   - Student → /dashboard/student
   - Parent → /dashboard/parent

Protected Routes:
1. Check if user is authenticated
2. Check if user has required role
3. Allow or redirect to login
```

---

## Deployment Guide

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Select:
# - Hosting
# - Use existing project: smart-campus-safety
# - Public directory: dist
# - Single-page app: Yes

# Build the project
pnpm run build

# Deploy
firebase deploy
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
# Project will be available at: https://your-project.vercel.app
```

### Environment Variables

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## Conclusion

This documentation covers the complete setup and architecture of the Smart Campus Safety System. For additional support:

- Firebase Docs: https://firebase.google.com/docs
- Google Maps API: https://developers.google.com/maps
- ESP32 Reference: https://docs.espressif.com/

**Project Status**: Production-ready prototype for Final Year Project (FYP)
