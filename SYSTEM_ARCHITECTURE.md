# Smart Campus Safety System - System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT TIER (Frontend)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Landing    │  │     Auth     │  │  Dashboards  │          │
│  │     Page     │  │    Pages     │  │  (Role-based)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │         React 18.3 + TypeScript + Tailwind       │          │
│  │         React Router 7 + Formik + Motion         │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / WebSocket
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND TIER (Firebase)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐     │
│  │   Firebase     │  │   Firestore    │  │   Firebase   │     │
│  │     Auth       │  │    Database    │  │  Cloud MSG   │     │
│  └────────────────┘  └────────────────┘  └──────────────┘     │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐     │
│  │   Functions    │  │    Storage     │  │   Hosting    │     │
│  │  (Serverless)  │  │   (Media)      │  │    (CDN)     │     │
│  └────────────────┘  └────────────────┘  └──────────────┘     │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API / MQTT
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DEVICE TIER (IoT/Hardware)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │                    ESP32 Module                   │          │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │          │
│  │  │   GPS    │  │  Pulse   │  │ Accelerometer│   │          │
│  │  │ Module   │  │  Sensor  │  │   (MPU6050)  │   │          │
│  │  └──────────┘  └──────────┘  └──────────────┘   │          │
│  │                                                   │          │
│  │  ┌──────────────────────────────────────────┐   │          │
│  │  │        WiFi/MQTT Communication           │   │          │
│  │  └──────────────────────────────────────────┘   │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Google     │  │    Email     │  │     SMS      │         │
│  │   Maps API   │  │   Service    │  │   Gateway    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Real-time Location Tracking Flow

```
┌─────────────┐
│  GPS Module │ ──> Reads Latitude/Longitude every 5 seconds
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    ESP32    │ ──> Processes GPS data + Battery + Heart Rate
└──────┬──────┘
       │
       ↓ WiFi (HTTP POST/PUT)
┌─────────────┐
│  Firebase   │ ──> Stores in /liveLocations/{studentId}
│  Firestore  │
└──────┬──────┘
       │
       ↓ Real-time Listener (onSnapshot)
┌─────────────┐
│    React    │ ──> Updates map markers in real-time
│  Dashboard  │
└─────────────┘
```

### 2. SOS Emergency Alert Flow

```
┌─────────────┐
│   Student   │ ──> Presses SOS button in dashboard
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    React    │ ──> Triggers emergency alert function
│    App      │
└──────┬──────┘
       │
       ↓ Firebase SDK
┌─────────────┐
│  Firestore  │ ──> Creates alert document in /alerts
│  Database   │      {type: "SOS", status: "active", ...}
└──────┬──────┘
       │
       ├──> Trigger 1: Cloud Function
       │              ↓
       │    ┌─────────────┐
       │    │   Send FCM  │ ──> Push notification to:
       │    │Notification │      - Parents
       │    └─────────────┘      - Admin
       │                          - Security
       │
       ├──> Trigger 2: Admin Dashboard
       │              ↓
       │    ┌─────────────┐
       │    │  Real-time  │ ──> Alert appears in
       │    │   Update    │      emergency panel
       │    └─────────────┘      with location
       │
       └──> Trigger 3: SMS Gateway (optional)
                      ↓
            ┌─────────────┐
            │  Send SMS   │ ──> Text message to
            │   Alert     │      emergency contacts
            └─────────────┘
```

### 3. Authentication & Authorization Flow

```
┌──────────────┐
│     User     │
│ (Login Form) │
└──────┬───────┘
       │
       ↓ Formik + Yup Validation
┌──────────────┐
│   Frontend   │ ──> Validates email format, password strength
│  Validation  │
└──────┬───────┘
       │
       ↓ Firebase Auth SDK
┌──────────────┐
│   Firebase   │ ──> Verifies credentials
│     Auth     │      Returns JWT token
└──────┬───────┘
       │
       ↓ Fetch user role from Firestore
┌──────────────┐
│  Firestore   │ ──> GET /users/{uid}
│   Database   │      Returns {role, name, permissions}
└──────┬───────┘
       │
       ↓ Store in AuthContext
┌──────────────┐
│    React     │ ──> Sets currentUser & userData
│   Context    │
└──────┬───────┘
       │
       ↓ Route Protection
┌──────────────┐
│  Protected   │ ──> Checks role
│    Route     │      Redirects based on:
└──────┬───────┘      - Admin → /dashboard/admin
       │              - Student → /dashboard/student
       │              - Parent → /dashboard/parent
       ↓
┌──────────────┐
│  Dashboard   │
│    Loaded    │
└──────────────┘
```

### 4. Geo-fencing (Safe Zone) Flow

```
┌─────────────┐
│  Admin      │ ──> Defines safe zone
│  Dashboard  │      {name, center, radius}
└──────┬──────┘
       │
       ↓ Save to Firestore
┌─────────────┐
│ /safeZones  │ ──> Stores zone definition
└──────┬──────┘
       │
       ↓ Real-time sync to map
┌─────────────┐
│  Google     │ ──> Renders circular geo-fence
│    Maps     │      on tracking map
└──────┬──────┘
       │
       ↓ Check on location update
┌─────────────┐
│  Firebase   │ ──> When student location updates:
│  Function   │      1. Calculate distance from center
│  (Cloud)    │      2. If distance > radius:
└──────┬──────┘         - Create alert
       │                 - Send notification
       │
       ↓ Alert created
┌─────────────┐
│  /alerts    │ ──> {type: "safe_zone_exit", ...}
│ Collection  │
└──────┬──────┘
       │
       ↓ Notify stakeholders
┌─────────────┐
│  Parents &  │ ──> Receive push notification
│   Admin     │      "Student exited safe zone"
└─────────────┘
```

## 🗄️ Database Architecture

### Firestore Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── uid: string
│       ├── email: string
│       ├── role: "admin" | "student" | "parent" | "security"
│       ├── name: string
│       ├── phone: string
│       ├── studentId?: string
│       ├── parentOf?: string[]
│       └── createdAt: timestamp
│
├── students/
│   └── {studentId}/
│       ├── uid: string (ref to users)
│       ├── fullName: string
│       ├── grade: string
│       ├── deviceId: string
│       ├── parentId: string
│       ├── emergencyContacts: array
│       └── status: "active" | "inactive"
│
├── liveLocations/
│   └── {studentId}/
│       ├── location: {lat, lng}
│       ├── accuracy: number
│       ├── timestamp: timestamp
│       ├── battery: number
│       ├── heartRate?: number
│       ├── speed?: number
│       └── inSafeZone: boolean
│
├── alerts/
│   └── {alertId}/
│       ├── type: "SOS" | "fall" | "zone_exit" | "battery"
│       ├── studentId: string
│       ├── location: {lat, lng}
│       ├── timestamp: timestamp
│       ├── status: "active" | "acknowledged" | "resolved"
│       ├── severity: "high" | "medium" | "low"
│       └── resolvedBy?: string
│
├── devices/
│   └── {deviceId}/
│       ├── type: "ESP32"
│       ├── assignedTo: string (studentId)
│       ├── status: "online" | "offline"
│       ├── battery: number
│       ├── firmwareVersion: string
│       └── lastSync: timestamp
│
├── safeZones/
│   └── {zoneId}/
│       ├── name: string
│       ├── center: {lat, lng}
│       ├── radius: number (meters)
│       ├── type: "campus" | "building"
│       ├── active: boolean
│       └── alertOnExit: boolean
│
└── notifications/
    └── {notificationId}/
        ├── userId: string
        ├── title: string
        ├── message: string
        ├── type: "alert" | "info" | "warning"
        ├── read: boolean
        ├── timestamp: timestamp
        └── data: object
```

### Indexes Required

```javascript
// Composite indexes for efficient queries
{
  collection: "alerts",
  fields: [
    { fieldPath: "status", mode: "ASCENDING" },
    { fieldPath: "timestamp", mode: "DESCENDING" }
  ]
}

{
  collection: "liveLocations",
  fields: [
    { fieldPath: "studentId", mode: "ASCENDING" },
    { fieldPath: "timestamp", mode: "DESCENDING" }
  ]
}

{
  collection: "notifications",
  fields: [
    { fieldPath: "userId", mode: "ASCENDING" },
    { fieldPath: "read", mode: "ASCENDING" },
    { fieldPath: "timestamp", mode: "DESCENDING" }
  ]
}
```

## 🔐 Security Architecture

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || hasRole('admin');
    }
    
    // Students collection
    match /students/{studentId} {
      allow read: if isAuthenticated();
      allow create: if hasRole('admin');
      allow update, delete: if hasRole('admin') || hasRole('security');
    }
    
    // Live locations - Anyone authenticated can read
    match /liveLocations/{locationId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated(); // Devices write here
    }
    
    // Alerts - Restricted write access
    match /alerts/{alertId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if hasRole('admin') || hasRole('security');
    }
    
    // Devices - Admin only
    match /devices/{deviceId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
    
    // Safe zones - Admin can modify
    match /safeZones/{zoneId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
    
    // Notifications - User can read their own
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

### API Key Security

```env
# Environment variables (never commit to git)
VITE_FIREBASE_API_KEY=restricted_key
VITE_GOOGLE_MAPS_API_KEY=restricted_key

# Restrictions:
# - HTTP referrers only from your domain
# - API key restrictions to specific APIs
# - Rate limiting enabled
# - Usage quotas set
```

## 🌐 API Architecture

### REST Endpoints (Firebase Functions)

```typescript
// BASE URL: https://us-central1-{project-id}.cloudfunctions.net

// Authentication
POST   /api/auth/signup          # Create new user
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/reset-password  # Password reset

// Students
GET    /api/students             # List all students (admin)
GET    /api/students/:id         # Get student details
POST   /api/students             # Create student (admin)
PUT    /api/students/:id         # Update student (admin)
DELETE /api/students/:id         # Delete student (admin)

// Locations
GET    /api/locations            # Get all live locations (admin/security)
GET    /api/locations/:studentId # Get student location
PUT    /api/locations/:studentId # Update location (device)

// Alerts
GET    /api/alerts               # Get all alerts (admin/security)
GET    /api/alerts/:id           # Get alert details
POST   /api/alerts               # Create alert
PUT    /api/alerts/:id           # Update alert (resolve/acknowledge)
DELETE /api/alerts/:id           # Delete alert (admin)

// Notifications
POST   /api/notifications/send   # Send push notification
GET    /api/notifications/:userId # Get user notifications

// Safe Zones
GET    /api/safe-zones           # List safe zones
POST   /api/safe-zones           # Create zone (admin)
PUT    /api/safe-zones/:id       # Update zone (admin)
DELETE /api/safe-zones/:id       # Delete zone (admin)
```

### WebSocket/Real-time Connections

```typescript
// Firestore real-time listeners

// Listen to location updates
const unsubscribe = onSnapshot(
  collection(db, 'liveLocations'),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        updateMarker(change.doc.data());
      }
    });
  }
);

// Listen to alerts
const alertsListener = onSnapshot(
  query(
    collection(db, 'alerts'),
    where('status', '==', 'active'),
    orderBy('timestamp', 'desc')
  ),
  (snapshot) => {
    const activeAlerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAlerts(activeAlerts);
  }
);
```

## 🔌 IoT Communication Protocol

### MQTT Architecture (Alternative to HTTP)

```
┌──────────────┐
│    ESP32     │
│   (Client)   │
└──────┬───────┘
       │
       ↓ MQTT over WiFi
┌──────────────┐
│     MQTT     │ ──> Topic: campus/student/{studentId}/location
│    Broker    │      Payload: {lat, lng, battery, heartRate}
│  (HiveMQ)    │
└──────┬───────┘
       │
       ↓ Subscribe
┌──────────────┐
│   Firebase   │ ──> Cloud Function subscribes to topics
│   Function   │      Processes and stores in Firestore
└──────────────┘
```

### Message Format

```json
// Location update from ESP32
{
  "deviceId": "ESP32-001",
  "studentId": "STU2023001",
  "timestamp": 1684234567890,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5
  },
  "sensors": {
    "battery": 87,
    "heartRate": 72,
    "temperature": 36.5,
    "acceleration": {
      "x": 0.05,
      "y": 0.02,
      "z": 9.81
    }
  },
  "status": "normal"
}
```

## 📊 Analytics & Monitoring

### Metrics Tracked

```typescript
interface SystemMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  
  // Device metrics
  totalDevices: number;
  onlineDevices: number;
  batteryAlerts: number;
  
  // Safety metrics
  todayAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  
  // Location metrics
  studentsInSafeZone: number;
  safeZoneViolations: number;
}
```

### Logging Strategy

```typescript
// Firebase Analytics events

// Track SOS activation
logEvent(analytics, 'sos_activated', {
  studentId: 'STU2023001',
  location: {lat: 40.7128, lng: -74.0060},
  timestamp: Date.now()
});

// Track alert resolution
logEvent(analytics, 'alert_resolved', {
  alertId: 'alert123',
  responseTime: 120, // seconds
  resolvedBy: 'admin_uid'
});

// Track safe zone entry/exit
logEvent(analytics, 'safe_zone_event', {
  type: 'exit',
  studentId: 'STU2023001',
  zoneId: 'zone1'
});
```

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│         Firebase Hosting (CDN)          │
│  ┌────────────────────────────────┐    │
│  │   Static Files (React Build)   │    │
│  └────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │
               ↓ HTTPS
┌─────────────────────────────────────────┐
│      Load Balancer (Auto-scaling)       │
└──────────────┬──────────────────────────┘
               │
     ┌─────────┴─────────┐
     ↓                   ↓
┌──────────┐      ┌──────────┐
│ Firebase │      │  Cloud   │
│ Services │      │Functions │
└──────────┘      └──────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: smart-campus-safety
```

---

## Summary

This architecture provides:
- ✅ **Scalability** - Firebase auto-scales to handle load
- ✅ **Real-time** - WebSocket connections for instant updates
- ✅ **Security** - Multi-layer security with Firebase rules
- ✅ **Reliability** - 99.95% uptime SLA with Firebase
- ✅ **Flexibility** - Modular design allows easy feature additions
- ✅ **Cost-effective** - Pay-as-you-go pricing model

Perfect for a **Final Year Project** demonstrating modern full-stack development, real-time systems, and IoT integration!
