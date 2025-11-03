// src/utils/date.js
export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const formatDay = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

export const formatTime = (date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });