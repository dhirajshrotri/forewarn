importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
, 
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Config object must be hardcoded here since environment variables aren't built into public static assets natively
firebase.initializeApp({
  apiKey: "AIzaSyBZ351kDA8fhF2FQuBVoHkdhlspCCX1LKc",
  authDomain: "forewarn-51763.firebaseapp.com",
  projectId: "forewarn-51763",
  storageBucket: "forewarn-51763.firebasestorage.app",
  messagingSenderId: "598369170617",
  appId: "1:598369170617:web:3d716a5c7b8ef499f9d768"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: '/icons/weather-icon.png' // Make sure an icon exists or remove this line
  };

  globalThis.registration.showNotification(notificationTitle, notificationOptions);
});
