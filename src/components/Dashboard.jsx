// src/components/Dashboard.jsx
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, formatDay, formatTime } from '../utils/date';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { CALENDARS } from '../constants';

const mockEvents = [
  { id: 1, title: 'Team Sync', start: new Date(2025, 10, 3, 9, 0), end: new Date(2025, 10, 3, 10, 0), calendar: CALENDARS.GOOGLE },
  { id: 2, title: 'Client Call', start: new Date(2025, 10, 3, 14, 0), end: new Date(2025, 10, 3, 15, 0), calendar: CALENDARS.OUTLOOK },
  { id: 3, title: 'Focus Block', start: new Date(2025, 10, 4, 10, 0), end: new Date(2025, 10, 4, 12, 0), calendar: CALENDARS.BOUNDARY },
  // ... add more for 14 days
];

export const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date());

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = addDays(startDate, i);
      const dayEvents = mockEvents.filter(
        (e) => e.start.toDateString() === date.toDateString()
      );
      const totalMinutes = 14 * 60; // 14 hours
      const busyMinutes = dayEvents.reduce((sum, e) => sum + (e.end - e.start) / 60000, 0);
      const availability = Math.round(((totalMinutes - busyMinutes) / totalMinutes) * 100);
      return { date, events: dayEvents, availability };
    });
  }, [startDate]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">14-Day Unified View</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDate(addDays(startDate, -14))}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setStartDate(addDays(startDate, 14))}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
        {days.map((day) => (
          <Card key={day.date.toISOString()} className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatDay(day.date)}
            </div>
            <div className="text-2xl font-bold mt-1">{day.availability}%</div>

            {day.events.length === 0 ? (
              <p className="text-xs text-gray-500 mt-2">No events</p>
            ) : (
              <div className="mt-3 space-y-1">
                {day.events.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded-lg p-1"
                  >
                    <span className="truncate">{e.title}</span>
                    <Badge type={e.calendar}>
                      {formatTime(e.start)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Google Calendar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Microsoft Outlook</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Temporal Blocks</span>
        </div>
      </div>
    </div>
  );
};