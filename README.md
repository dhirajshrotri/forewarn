# ☀️ Forewarn
 
A weather alert scheduling app that sends push notifications to your browser at a time you choose. Pick a time, and Forewarn will check local weather conditions and deliver a desktop notification when that moment arrives.
 
---
 
## How It Works
 
1. User selects a date and time for their alert
2. The app requests browser notification permissions and generates an FCM push token
3. The user's current geolocation is captured
4. The alert is saved to Firestore with status `pending`
5. A Google Cloud Run function runs on a schedule, queries for pending alerts that are due, fetches weather data for the saved coordinates, and sends a push notification via Firebase Cloud Messaging
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Auth | Firebase Anonymous Authentication |
| Database | Cloud Firestore |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Background Worker | Google Cloud Run (scheduled function) |
 
## Project Structure
 
```
forewarn/
├── app/
│   ├── layout.tsx        # AuthProvider wrapper, metadata
│   └── page.tsx          # Main scheduling UI
├── context/
│   └── AuthContext.tsx   # Firebase anonymous auth
├── lib/
│   └── firebase.ts       # Firebase app initialization
└── cloud-run/
    └── index.js          # Scheduled background worker
```
 
---
 
## License
 
MIT
