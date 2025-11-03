// src/components/ui/Badge.jsx
import { CALENDARS, COLORS } from '../../constants';

export const Badge = ({ type, children }) => {
  const color = COLORS[type] || 'bg-gray-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white ${color}`}>
      <span className="w-2 h-2 rounded-full bg-white/70"></span>
      {children}
    </span>
  );
};