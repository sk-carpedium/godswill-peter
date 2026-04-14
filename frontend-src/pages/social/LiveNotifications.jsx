import React from 'react';
import LiveNotificationManager from '../components/notifications/LiveNotificationManager';

export default function LiveNotifications() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Auto Notifications</h1>
        <p className="text-slate-600 mt-2">Automatically notify followers about scheduled posts, stories, reels, shorts, videos & live streams across all platforms</p>
      </div>
      <LiveNotificationManager />
    </div>
  );
}