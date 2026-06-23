"use client";

import { useState } from "react";
import { db, messaging } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [scheduledTime, setScheduledTime] = useState("");
  const [forecastTime, setForecastTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const { user, loading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("Authentication not ready. Please wait.");

    if (!forecastTime) return alert("Please select a forecast date and time.")

    if (!scheduledTime) return alert("Please select a date and time.");

    setLoading(true);
    setStatusMessage("Requesting browser notification permissions...");

    try {
      // 1. Request Browser Permissions
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatusMessage("Permission denied. Notifications cannot be sent.");
        setLoading(false);
        return;
      }

      // 2. Fetch FCM Token
      setStatusMessage("Generating push token...");
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!fcmToken) {
        throw new Error("No FCM token generated. Check your VAPID key configuration.");
      }

      // 3. Capture Device Geolocation
      setStatusMessage("Acquiring current coordinates...");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 4. Save Record to Cloud Firestore
          setStatusMessage("Scheduling alert in backend database...");
          const forecastDate = new Date(forecastTime);
          const targetDate = new Date(scheduledTime);

          await addDoc(collection(db, "weather-alerts"), {
            uid: user.uid,   
            lat: latitude,
            lon: longitude,
            fcmToken: fcmToken,
            forecastTime: Timestamp.fromDate(forecastDate),
            notificationTime: Timestamp.fromDate(targetDate),
            createdAt: Timestamp.now(),
            status: "pending",
          });

          setStatusMessage("Success! Your alert has been scheduled.");
          setScheduledTime("");
          setLoading(false);
        },
        (error) => {
          console.error(error);
          setStatusMessage("Location access denied. Could not schedule alert.");
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || "Failed to schedule alert."}`);
      setLoading(false);
    }
  };

  // Compute button label in a single independent statement instead of a nested ternary
  let buttonLabel = "Schedule Alert";
  if (authLoading) {
    buttonLabel = "Authenticating...";
  } else if (loading) {
    buttonLabel = "Processing...";
  }

    const formatDateTime = (date) => {
      return date.toISOString().slice(0, 16);
    };

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const minDateTime = formatDateTime(today);
    const maxDateTime = formatDateTime(nextWeek);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <Head>
        <title>Forewarn | Get weather alerts</title>
      </Head>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">☀️ Forewarn</h1>
        <p className="text-sm text-slate-500 mb-6">
          Pick a time. We will check the local weather conditions then send a desktop notification to your screen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="alert-time">
              Forecast Time
            </label>
            <input
              id="forecast-time"
              type="datetime-local"
              disabled={loading}
              value={forecastTime}
              min={minDateTime}
              max={maxDateTime}
              onChange={(e) => setForecastTime(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="alert-time">
              Notify Me At
            </label>
            <input
              id="alert-time"
              type="datetime-local"
              disabled={loading}
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400"
          >
            {buttonLabel}
          </button>
        </form>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200 text-center font-mono">
            {statusMessage}
          </div>
        )}
      </div>
    </main>
  );
}
