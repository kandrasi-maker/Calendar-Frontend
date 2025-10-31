const Calendar = () => {
        console.log("Rendering Calendar Component");
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const days = Array.from({ length: 7 }, (_, i) => addDays(viewStartDate, i));
        const hourHeight = 60;

        const getEventStyle = (event) => {
            if (!(event.start instanceof Date) || !(event.end instanceof Date) || isNaN(event.start) || isNaN(event.end)) {
                 console.error("Invalid date passed to getEventStyle:", event);
                 return { display: 'none' };
             }
            const startHour = event.start.getHours();
            const startMinute = event.start.getMinutes();
            const endTime = event.end > event.start ? event.end : new Date(event.start.getTime() + 60*60*1000);
            const durationMinutes = (endTime.getTime() - event.start.getTime()) / (1000 * 60);
            if (durationMinutes <= 0) { console.warn("Event has zero or negative duration, setting min height:", event); }
            const top = (startHour + startMinute / 60) * hourHeight;
            const height = Math.max(15, (Math.max(0, durationMinutes) / 60) * hourHeight);
            const maxHeight = (24 * hourHeight) - top;
            const style = { top: `${top}px`, height: `${Math.min(height, maxHeight)}px` };
            return style;
        };

         const getEventColor = (event) => {
            if (event.isConflict) return 'bg-red-500/90 hover:bg-red-600/90 dark:bg-red-600/70 dark:hover:bg-red-500/70 border border-red-400/50';
            if (event.isBoundary) return 'bg-gray-500/90 hover:bg-gray-600/90 dark:bg-gray-600/70 dark:hover:bg-gray-500/70 border border-gray-400/50';
            if (event.severity === 'High') return 'bg-orange-500/90 hover:bg-orange-600/90 dark:bg-orange-600/70 dark:hover:bg-orange-500/70 border border-orange-400/50';
            if (event.severity === 'Medium') return 'bg-blue-500/90 hover:bg-blue-600/90 dark:bg-blue-600/70 dark:hover:bg-blue-500/70 border border-blue-400/50';
            if (event.severity === 'Low') return 'bg-green-500/90 hover:bg-green-600/90 dark:bg-green-600/70 dark:hover:bg-green-500/70 border border-green-400/50';
            return 'bg-blue-500/90 hover:bg-blue-600/90';
        };

        return (
            <div className="flex flex-col p-4 sm:p-6">
                {/* Header Row */}
                <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] border-b border-gray-200 dark:border-gray-700 sticky top-[65px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="w-16 sm:w-20 border-r border-gray-200 dark:border-gray-700"></div> {/* Spacer */}
                    {days.map((day, index) => {
                        const isToday = new Date().toDateString() === day.toDateString();
                        return (
                            <div key={index} className="text-center py-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                <div className={`text-xs font-semibold uppercase ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatDayHeader(day)}</div>
                                <div className={`mt-1 text-2xl font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}>{formatDayNumber(day)}</div>
                            </div>
                        );
                     })}
                </div>

                {/* Main Grid Area */}
                <div className="flex flex-grow overflow-auto relative">
                    {/* Time Column */}
                    <div className="w-16 sm:w-20 border-r border-gray-200 dark:border-gray-700 shrink-0">
                        {hours.map(hour => (
                            <div key={hour} className="h-[60px] relative text-right pr-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="absolute -top-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                                     {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns & Events Grid */}
                    <div className="grid grid-cols-7 flex-grow relative">
                         {/* Background Hour Lines */}
                         {hours.map(hour => (
                             <div key={`line-${hour}`} className="col-span-7 h-[60px] border-b border-gray-100 dark:border-gray-800 pointer-events-none"></div>
                         ))}

                        {/* Event Rendering Area (Overlay) */}
                        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                             {days.map((day, dayIndex) => {
                                 const eventsForDay = processedEvents.filter(event => event.start instanceof Date && event.start.toDateString() === day.toDateString());
                                 return (
                                    <div key={dayIndex} className="relative border-r border-gray-200 dark:border-gray-700 last:border-r-0 h-full">
                                        {eventsForDay.map(event => (
                                                <div
                                                    key={event.id}
                                                    className={`absolute left-1 right-1 p-1.5 rounded-lg text-xs font-semibold truncate text-white cursor-pointer ${getEventColor(event)} transition-colors overflow-hidden pointer-events-auto`}
                                                    style={getEventStyle(event)}
                                                    onClick={(e) => { e.stopPropagation(); setShowEventDetail(event); }}
                                                    title={`${event.title} (${event.severity})\n${formatTime(event.start)} - ${formatTime(event.end)}`}
                                                >
                                                    <div className="font-bold">{event.title}</div>
                                                    <div className="text-[10px]">{formatTime(event.start)} - {formatTime(event.end)}</div>
                                                    {event.isConflict && <WarningIcon />}
                                                    {event.isBoundary && '🔒'}
                                                </div>
                                            ))}
                                    </div>
                                 );
                             })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };