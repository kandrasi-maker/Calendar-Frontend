const EventDetailModal = ({ event, onClose }) => {
        const [agenda, setAgenda] = useState(''); const [isPreparing, setIsPreparing] = useState(false); const [isDeleting, setIsDeleting] = useState(false);
        const handlePrepare = async () => { setIsPreparing(true); setAgenda(''); const prompt = `Create a concise 3-point agenda for a meeting titled "${event.title}". Use bullet points.`; const result = await callGeminiAPI(prompt, token); setAgenda(result); setIsPreparing(false); };
        
        const onDeleteConfirm = async () => {
             if (window.confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)){
                 setIsDeleting(true);
                 await handleDeleteEvent(event); // Call the main handler
                 // Modal will be closed by main handler setting showEventDetail(null)
             }
         };

        if (!event) return null;
        return ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"><div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg"><div className="flex items-start justify-between mb-4 pb-4 border-b dark:border-gray-700"><div className="flex-1"><h3 className="text-xl sm:text-2xl font-bold dark:text-white flex items-center gap-3">{event.calendar === 'Google' ? <GoogleIcon /> : <OutlookIcon />}{event.title || "Untitled Event"}</h3><p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-1">{formatDate(event.start)}</p><p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{formatTime(event.start)} - {formatTime(event.end)}</p></div><button onClick={onClose} disabled={isPreparing || isDeleting} className="p-2 ml-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"><XIcon/></button></div><div className="mb-6"><button onClick={handlePrepare} disabled={isPreparing || isDeleting} className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 transition-colors"><SparklesIcon/> {isPreparing ? 'Generating Agenda...' : '✨ Prepare for Meeting'}</button>{agenda && (<div className={`mt-4 p-4 rounded-lg text-sm space-y-2 ${agenda.toLowerCase().includes('error') ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'}`}><h4 className="font-bold">Suggested Agenda:</h4><div className="whitespace-pre-wrap">{agenda}</div></div>)}</div><div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button onClick={onDeleteConfirm} disabled={isDeleting || isPreparing} className="flex items-center justify-center gap-1 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 transition-colors"><TrashIcon /> {isDeleting ? 'Deleting...' : 'Delete Event'}</button>
            <button onClick={onClose} disabled={isDeleting || isPreparing} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">Close</button>
        </div></div></div>);
    };