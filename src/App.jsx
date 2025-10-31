import React, { useState, useEffect, useMemo } from 'react';
import { AuthComponent } from './components/AuthComponent';

// --- Add this inside your App.jsx, after imports ---
const SeverityBadge = ({ severity }) => {
  const colors = {
    High: 'bg-orange-500 text-white',
    Medium: 'bg-blue-500 text-white',
    Low: 'bg-green-500 text-white'
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colors[severity] || 'bg-gray-400 text-white'}`}>
      {severity}
    </span>
  );
};

// --- Helper Functions for Date Manipulation ---
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
const getStartOfWeek = (date) => { // Assuming week starts on Monday
    const result = new Date(date);
    const day = result.getDay(); // 0 = Sunday, 1 = Monday, ...
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    result.setDate(diff);
    result.setHours(0, 0, 0, 0); // Start of the day
    return result;
};
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const formatDateTime = (date) => new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
const formatDayHeader = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
const formatDayNumber = (date) => new Date(date).getDate();

// --- NEW HELPER: Formats a Date object to YYYY-MM-DDTHH:MM:SS (local time) ---
const formatLocalDateTime = (date) => {
  const pad = (num) => String(num).padStart(2, '0');
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
};


// --- AI & Logic Helpers ---
const BUFFER_MS = 15 * 60 * 1000;

const getEventSeverity = (title) => {
    const lowerCaseTitle = (title || '').toLowerCase();
    if (/\b(client|interview|deadline|presentation|review|qbr)\b/.test(lowerCaseTitle)) return 'High';
    if (/\b(planning|apollo|brainstorm|session|workshop)\b/.test(lowerCaseTitle)) return 'Medium';
    if (/\b(standup|sync|catch-up|team|internal|follow up)\b/.test(lowerCaseTitle)) return 'Low';
    return 'Medium';
};

const getConflictId = (eventA, eventB) => [eventA.id, eventB.id].sort().join('|');

// --- API Helper ---
const API_BASE_URL = 'https://unified-availability-api.onrender.com';


// --- Gemini API Call Helper ---
const callGeminiAPI = async (prompt, token) => {
    if (!token) return "Authentication token is missing.";
    console.log("Calling Gemini API via backend...");
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/suggest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ prompt }),
        });
        if (!response.ok) {
            let errorMessage = `API call failed with status: ${response.status}`;
            const errorText = await response.text();
            try { const errorData = JSON.parse(errorText); errorMessage = errorData.message || errorMessage; }
            catch (e) { console.error("Non-JSON error response from backend AI:", errorText); errorMessage = `Server returned an unexpected response (status: ${response.status}). Check server logs.`; }
            throw new Error(errorMessage);
        }
        const result = await response.json();
        console.log("Gemini API backend response:", result);
        return result.suggestion || "Sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Backend AI Suggestion call error:", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return "Could not connect to the backend server for AI suggestion. Is it running?";
        }
        return error.message || "An error occurred while contacting the AI.";
    }
};

// --- SVG Icons ---
const GoogleIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.9999 12.2273C21.9999 11.4545 21.9317 10.7045 21.7953 10H12.2272V14.1136H17.7613C17.534 15.4432 16.8522 16.5909 15.8181 17.3182V19.8864H19.3408C21.034 18.25 21.9999 15.5455 21.9999 12.2273Z" fill="#4285F4"></path><path d="M12.2272 22C15.1476 22 17.6022 21.0114 19.3408 19.8864L15.8181 17.3182C14.8294 17.9659 13.6249 18.3636 12.2272 18.3636C9.52261 18.3636 7.2158 16.6364 6.35216 14.3182H2.70444V16.9659C4.44307 20.2159 8.01125 22 12.2272 22Z" fill="#34A853"></path><path d="M6.35227 14.3182C6.10227 13.6136 5.96591 12.8636 5.96591 12.0909C5.96591 11.3182 6.10227 10.5682 6.35227 9.86364V7.21591H2.70455C2.02273 8.52273 1.63636 9.98864 1.63636 11.5909C1.63636 13.1932 2.02273 14.6591 2.70455 15.9659L6.35227 14.3182Z" fill="#FBBC05"></path><path d="M12.2272 5.63636C13.7158 5.63636 15.2272 6.17045 16.3635 7.23864L19.4146 4.18182C17.6022 2.5 15.1476 1.18182 12.2272 1.18182C8.01125 1.18182 4.44307 3.78409 2.70444 7.21591L6.35216 9.86364C7.2158 7.54545 9.52261 5.63636 12.2272 5.63636Z" fill="#EA4335"></path></svg>);
const OutlookIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.2 3H5.2C4.4 3 4.1 3.5 4.1 4.2L4 20.1C4 20.8 4.4 21.1 5.1 21.1H18.8C19.6 21.1 20 20.8 20 20V8.2C20 7.4 19.6 7.1 18.9 7.1H13.1C12.3 7.1 12.1 6.8 12.1 6V4.1C12.1 3.5 12.5 3 13.2 3Z" fill="#0072C6"></path><path d="M12.1 6H13.2C12.5 6 12.1 6.3 12.1 7V6Z" fill="#0072C6"></path></svg>);
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2"><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


// --- Safe JSON Parse ---
const safeJsonParse = (item) => {
    if (!item) return null;
    try {
        const parsed = JSON.parse(item);
        if (typeof parsed === 'object' && parsed !== null && parsed.id && parsed.email) {
             return parsed;
        }
        console.warn("Parsed item from localStorage is not a valid user object:", parsed);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        return null;
    } catch (e) {
        console.error("Failed to parse JSON from localStorage:", item, e);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
        return null;
    }
};

// --- Main Application Component ---
export default function App() {
    // --- State Management ---
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem('authUser')));
    
    // --- State for Weekly View ---
    const [viewStartDate, setViewStartDate] = useState(getStartOfWeek(new Date()));

    const [allEvents, setAllEvents] = useState([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(!!token);
    const [fetchError, setFetchError] = useState('');
    const [isGoogleConnected, setGoogleConnected] = useState(false);
    const [isOutlookConnected, setOutlookConnected] = useState(false);
    const [showBoundaryModal, setShowBoundaryModal] = useState(false);
    const [showEventDetail, setShowEventDetail] = useState(null);
    const [unresolvedConflicts, setUnresolvedConflicts] = useState([]);
    const [ignoredConflicts, setIgnoredConflicts] = useState([]);

    // --- Dark Mode Effect ---
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    // --- Resilient Data Fetching ---
    const fetchUserData = async (currentToken) => {
        if (!currentToken) { console.log("fetchUserData aborted: No token."); return; }
        setFetchError('');
        console.log("fetchUserData called.");

        let meOk = false;
        if (!isLoadingEvents) setIsLoadingEvents(true);
        try {
            console.log("Fetching /api/me...");
            const meResponse = await fetch(`${API_BASE_URL}/api/me`, { headers: { Authorization: `Bearer ${currentToken}` } });
             console.log("/api/me status:", meResponse.status);
             if (!meResponse.ok) {
                 const text = await meResponse.text();
                 try { const jsonData = JSON.parse(text); throw new Error(jsonData.message || `Failed to fetch user, status: ${meResponse.status}`); }
                 catch(e){ throw new Error(`Failed to fetch user, received non-JSON response (status ${meResponse.status}): ${text.substring(0, 100)}...`); }
             }
            const meData = await meResponse.json();
            console.log("/api/me data:", meData);
            setGoogleConnected(meData.isGoogleConnected);
            setOutlookConnected(meData.isOutlookConnected);
            meOk = true;
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                 setFetchError("Could not connect to the backend server to get user details. Is it running?");
             } else { setFetchError(error.message); }
            handleLogout();
            setIsLoadingEvents(false);
            return;
        }

        if (meOk) {
            // Loading is already true
            try {
                console.log("Fetching /api/events...");
                const eventsResponse = await fetch(`${API_BASE_URL}/api/events`, { headers: { Authorization: `Bearer ${currentToken}` } });
                 console.log("/api/events status:", eventsResponse.status);
                 if (!eventsResponse.ok){
                     const text = await eventsResponse.text();
                     try { const jsonData = JSON.parse(text); throw new Error(jsonData.message || `Failed to fetch events, status: ${eventsResponse.status}`); }
                     catch(e){ throw new Error(`Failed to fetch events, received non-JSON response (status ${eventsResponse.status}): ${text.substring(0, 100)}...`); }
                 }
                const eventsData = await eventsResponse.json();
                console.log("/api/events data received (raw):", eventsData);

                // --- Robust Date Parsing ---
                const parsedEvents = Array.isArray(eventsData)
                    ? eventsData.map(e => {
                        const start = e.start ? new Date(e.start) : null;
                        const end = e.end ? new Date(e.end) : null;
                        if (!start || !end || isNaN(start) || isNaN(end)) {
                             console.warn(`Invalid date found (start: ${e.start}, end: ${e.end}), skipping event:`, e.title);
                             return null;
                        }
                        return {...e, start, end };
                      }).filter(Boolean)
                    : [];
                 console.log(`Parsed ${parsedEvents.length} valid events.`);
                 setAllEvents(parsedEvents);
            } catch (error) {
                 console.error("Failed to fetch events:", error);
                 if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                     setFetchError("Could not connect to the backend server to get events. Is it running?");
                 } else { setFetchError(error.message); }
                 setAllEvents([]);
            }
            finally {
                console.log("Finished fetching events, setting loading to false.");
                setIsLoadingEvents(false);
            }
        } else {
             console.log("/api/me failed, setting loading false.");
             setIsLoadingEvents(false);
         }
    };

    // --- Initial Load & OAuth Redirect Handler ---
    useEffect(() => {
        console.log("Initial App Load Effect - Checking token...");
        const initialToken = localStorage.getItem('authToken');
        let initialUser = user;

        if (initialToken) {
            console.log("Token found on load.");
            if (!initialUser) {
                 const storedUser = localStorage.getItem('authUser');
                 if (storedUser) {
                     try {
                         console.log("Setting user from localStorage on initial load.");
                         initialUser = safeJsonParse(storedUser);
                         if(initialUser) setUser(initialUser);
                         else throw new Error("Parsed user from localStorage is null/invalid");
                     } catch (e) {
                         console.error("Failed to parse stored user, logging out.", e);
                         handleLogout(); return;
                     }
                 } else {
                     console.warn("Token exists but no user in localStorage. Logging out.");
                     handleLogout(); return;
                 }
             }
             // Data fetch is now handled by the [token, user] useEffect
        } else {
             console.log("No token found on load.");
             if (user) setUser(null);
             setIsLoadingEvents(false);
        }

        const handleFocus = () => {
             console.log("Window focused - Checking token...");
            const currentToken = localStorage.getItem('authToken');
            if (currentToken) {
                console.log("Token found on focus, fetching user data...");
                 let currentUserOnFocus = user;
                 if (!currentUserOnFocus) {
                     const authUserJSON = localStorage.getItem('authUser');
                     if (authUserJSON) {
                         try {
                             const authUser = safeJsonParse(authUserJSON);
                             if(authUser) {
                                 console.log("Setting user state from localStorage on focus");
                                 currentUserOnFocus = authUser;
                                 setUser(authUser);
                                 setToken(currentToken);
                             } else throw new Error("Parsed user from localStorage is null");
                         } catch (e) { console.error("Failed to parse stored user on focus", e); handleLogout(); return; }
                     } else { console.warn("Token exists on focus but no user in localStorage. Logging out."); handleLogout(); return; }
                 }
                 if (currentUserOnFocus) fetchUserData(currentToken);
            } else {
                 console.log("No token found on focus.");
                 if (user || token) { console.log("Logging out because token disappeared on focus."); handleLogout(); }
            }
        };
        console.log("Adding focus event listener.");
        window.addEventListener('focus', handleFocus);
        return () => {
             console.log("Removing focus event listener.");
             window.removeEventListener('focus', handleFocus);
        };
    }, []); // Run only on mount


    // --- useEffect to fetch data when token/user changes ---
    useEffect(() => {
        // Only run if token and user are *both* set
        if (token && user) {
            console.log("Token or User updated, fetching user data (useEffect [token, user])...");
            fetchUserData(token);
        } else {
             console.log("Token or User is missing in useEffect [token, user], skipping fetch.");
             if (!token && !user) setIsLoadingEvents(false);
         }
    }, [token, user]); // Run whenever token or user state changes


    // --- Process Events for Current View (Weekly) ---
    const processedEvents = useMemo(() => {
        console.log("ProcessedEvents Memo - Running. Input events:", allEvents?.length);
        if (!Array.isArray(allEvents)) { console.log("ProcessedEvents - allEvents not array"); return [];}
        const viewEndDate = addDays(viewStartDate, 7); // End of the week

        // Filter events within the current week view
        const validEvents = allEvents.filter(e =>
            e.start instanceof Date && e.end instanceof Date && !isNaN(e.start) && !isNaN(e.end) &&
            e.start < viewEndDate && e.end > viewStartDate
        );
        console.log(`ProcessedEvents - Found ${validEvents.length} valid events in date range.`);

        const eventsWithSeverity = validEvents.map(e => ({...e, severity: getEventSeverity(e.title)}));
        eventsWithSeverity.forEach(e => e.isConflict = false);

        // De-duplicate boundary events
        const uniqueEvents = [];
        const boundaryKeys = new Set();
        for (const event of eventsWithSeverity) {
            if (event.isBoundary) { const key = `${event.title}|${event.start.getTime()}|${event.end.getTime()}`; if (!boundaryKeys.has(key)) { boundaryKeys.add(key); uniqueEvents.push(event); } }
            else { uniqueEvents.push(event); }
        }

        // Detect conflicts
        for (let i = 0; i < uniqueEvents.length - 1; i++) {
            for (let j = i + 1; j < uniqueEvents.length; j++) {
                const [eventA, eventB] = [uniqueEvents[i], uniqueEvents[j]];
                if (eventA.start < eventB.end && eventA.end > eventB.start && !ignoredConflicts.includes(getConflictId(eventA, eventB))) { eventA.isConflict = true; eventB.isConflict = true; }
            }
        }
        console.log("ProcessedEvents Memo - Returning events:", uniqueEvents.length);
        return uniqueEvents.sort((a,b) => a.start - b.start);
     }, [allEvents, ignoredConflicts, viewStartDate]); // Re-run when viewStartDate changes

    // --- Conflict Detection Effect (Now depends on processedEvents) ---
     useEffect(() => {
        if (!Array.isArray(processedEvents)) { setUnresolvedConflicts([]); return; }
        const conflicts = [];
        for (let i = 0; i < processedEvents.length - 1; i++) {
            for (let j = i + 1; j < processedEvents.length; j++) {
                const [eventA, eventB] = [processedEvents[i], processedEvents[j]];
                 if (eventA.isConflict && eventB.isConflict && eventA.start < eventB.end && eventA.end > eventB.start) {
                     const conflictId = getConflictId(eventA, eventB);
                     if (!ignoredConflicts.includes(conflictId) && !unresolvedConflicts.some(pair => getConflictId(pair[0], pair[1]) === conflictId)) {
                         conflicts.push([eventA, eventB]);
                     }
                 }
            }
        }
        if (conflicts.length > 0) {
            console.log(`Adding ${conflicts.length} new unresolved conflicts.`);
            setUnresolvedConflicts(prev => {
                const existingIds = new Set(prev.map(pair => getConflictId(pair[0], pair[1])));
                const newConflicts = conflicts.filter(pair => !existingIds.has(getConflictId(pair[0], pair[1])));
                return [...prev, ...newConflicts];
            });
        }
     }, [processedEvents, ignoredConflicts]);


    // --- Authentication Handlers ---
    const handleLoginSuccess = (newToken, newUser) => {
        console.log("handleLoginSuccess setting state:", { newToken, newUser });
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        setUser(newUser);
        setToken(newToken);
        setGoogleConnected(false);
        setOutlookConnected(false);
    };
    const handleLogout = () => {
        console.log("handleLogout called.");
        localStorage.removeItem('authToken'); localStorage.removeItem('authUser');
        setToken(null); setUser(null); setAllEvents([]);
        setGoogleConnected(false); setOutlookConnected(false);
        setFetchError('');
        setShowEventDetail(null);
        setShowBoundaryModal(false);
        setUnresolvedConflicts([]);
    };

    // --- Connection Handler ---
    const handleConnect = async (provider) => {
        setFetchError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/connect/${provider}`, { headers: { Authorization: `Bearer ${token}` }});
            if (!response.ok) {
                const text = await response.text();
                try { const jsonData = JSON.parse(text); throw new Error(jsonData.message || `Connect request failed, status: ${response.status}`); }
                catch(e){ throw new Error(`Connect request failed, received non-JSON response (status ${response.status}): ${text.substring(0,100)}...`); }
            }
            const data = await response.json();
            if (data.url) window.location.href = data.url;
            else throw new Error("Backend did not provide a connection URL.");
        } catch (error) {
             console.error(`Error connecting to ${provider}:`, error);
              if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                 setFetchError("Could not connect to the backend server to initiate connection. Is it running?");
             } else { setFetchError(`Error starting connection: ${error.message}`); }
        }
    };

    // --- FIXED: handleCreateBoundary with UTC ISO strings ---
const handleCreateBoundary = async (boundary) => {
    setShowBoundaryModal(false);
    setIsLoadingEvents(true);
    setFetchError('');

    // Get user's timezone (e.g., "America/Los_Angeles")
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(`Creating boundary block in timezone: ${userTimeZone}`);

    // Convert local Date objects to UTC ISO strings
    const startUTC = boundary.start.toISOString(); // e.g., "2025-10-28T16:00:00.000Z"
    const endUTC = boundary.end.toISOString();

    try {
        const response = await fetch(`${API_BASE_URL}/api/events/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: boundary.title,
                start: startUTC,       // ← UTC ISO string
                end: endUTC,           // ← UTC ISO string
                timeZone: userTimeZone // ← For reference (optional, but helpful)
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            let errorMessage = `Failed to create block, status: ${response.status}`;
            try {
                const jsonData = JSON.parse(text);
                errorMessage = jsonData.message || errorMessage;
            } catch (e) {
                errorMessage = `Server error: ${text.substring(0, 100)}...`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Block creation result:', result);

        if (result.createdEvents && Array.isArray(result.createdEvents)) {
            const newParsedEvents = result.createdEvents.map(e => ({
                ...e,
                start: new Date(e.start),  // Safe: should be UTC ISO
                end: new Date(e.end),
                isBoundary: true
            }));

            // Optimistically add to UI
            setAllEvents(prev => [...prev, ...newParsedEvents]);
        } else {
            console.warn("Backend did not return createdEvents. Falling back to full refresh.");
            fetchUserData(token); // Full refresh fallback
        }
    } catch (error) {
        console.error("Error creating boundary:", error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            setFetchError("Could not connect to the backend server to create block. Is it running?");
        } else {
            setFetchError(`Error creating block: ${error.message}`);
        }
    } finally {
        setIsLoadingEvents(false);
    }
};
    
    // --- FIX: Full Backend Delete Function ---
    const handleDeleteEvent = async (eventToDelete) => {
        if (!eventToDelete || !eventToDelete.id || !eventToDelete.calendar) {
            console.error("Invalid event data for deletion:", eventToDelete);
            setFetchError("Cannot delete event: Invalid data.");
            return;
        }
        console.log(`Deleting event: ${eventToDelete.title} (${eventToDelete.id}) from ${eventToDelete.calendar}`);
        
        const originalEvents = [...allEvents]; // Store for revert
        // Optimistic UI update
        setAllEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
        if(showEventDetail) setShowEventDetail(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventToDelete.calendar.toLowerCase()}/${encodeURIComponent(eventToDelete.id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            const responseText = await response.text(); // Read body once
            if (!response.ok) {
                let errorMessage = `Failed to delete event, status: ${response.status}`;
                 const contentType = response.headers.get("content-type");
                 if (contentType && contentType.includes("application/json")) {
                     try { const errorData = JSON.parse(responseText); errorMessage = errorData.message || errorMessage; }
                     catch (e) { /* Ignore parsing error */ }
                 } else {
                     const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
                     errorMessage = titleMatch ? `${titleMatch[1]} (status ${response.status})` : `Received non-JSON response (status ${response.status})`;
                 }
                throw new Error(errorMessage);
            }
             console.log('Delete result:', responseText);
        } catch (error) {
            console.error("Error deleting event:", error);
            setFetchError(`Error deleting event: ${error.message}. Reverting calendar.`);
            setAllEvents(originalEvents); // Revert
        }
    };
    
    // --- FIX: Full Backend Update Function ---
    const handleUpdateEventTime = async (eventToMove, newStart) => {
        const duration = eventToMove.end.getTime() - eventToMove.start.getTime();
        const newEnd = new Date(newStart.getTime() + duration);
        const originalEvents = [...allEvents];
        
        console.log(`Rescheduling event: ${eventToMove.title} (${eventToMove.id}) to ${newStart}`);
        setAllEvents(prev => prev.map(e => e.id === eventToMove.id ? { ...e, start: newStart, end: newEnd } : e));

        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventToMove.calendar.toLowerCase()}/${encodeURIComponent(eventToMove.id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ 
                    start: formatLocalDateTime(newStart),
                    end: formatLocalDateTime(newEnd),
                    timeZone: userTimeZone
                }),
            });
            
            const responseText = await response.text();
            if (!response.ok) {
                 let errorMessage = `Failed to update event, status: ${response.status}`;
                 const contentType = response.headers.get("content-type");
                 if (contentType && contentType.includes("application/json")) {
                     try { const errorData = JSON.parse(responseText); errorMessage = errorData.message || errorMessage; }
                     catch (e) { /* Ignore */ }
                 } else {
                     const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
                     errorMessage = titleMatch ? `${titleMatch[1]} (status ${response.status})` : `Received non-JSON response (status ${response.status})`;
                 }
                throw new Error(errorMessage);
            }
            console.log('Update result:', responseText);
        } catch (error) {
             console.error("Error rescheduling event:", error);
             setFetchError(`Error rescheduling event: ${error.message}. Reverting changes.`);
             setAllEvents(originalEvents);
        }
    };

    // --- FIX: Hook up conflict resolution to new backend functions ---
    const handleResolveConflict = (toRemove) => {
        console.log(`Resolving conflict: Deleting "${toRemove.title}"`);
        handleDeleteEvent(toRemove); // Call the main delete handler
        setUnresolvedConflicts(p => p.slice(1));
    };
    
    const handleReschedule = (toMove, newStart) => {
        console.log(`Resolving conflict: Rescheduling "${toMove.title}"`);
        handleUpdateEventTime(toMove, newStart); // Call the main update handler
        setUnresolvedConflicts(p => p.slice(1));
    };

    const handleIgnoreConflict = (conflictId) => { setIgnoredConflicts(p => [...p, conflictId]); };


    // --- Render Auth Screen if not logged in ---
     console.log("Rendering check - Before return: Token:", token, "User:", user);
     if (!token || !user) {
         console.log("Rendering AuthComponent");
         return <AuthComponent onLoginSuccess={handleLoginSuccess} />;
     }

    // --- Main App Components ---
    const Onboarding = () => ( <div className="text-center p-10 border rounded-lg bg-white dark:bg-gray-800/50 mb-8 shadow-sm dark:border-gray-700"><h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Welcome, {user?.email || 'User'}</h2><p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Connect your calendars to see your unified availability.</p></div>);
    const Header = () => ( <header className="p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 dark:border-gray-700"><div className="container mx-auto flex justify-between items-center"><div className="flex items-center gap-4"><div className="flex items-center gap-3"><CalendarIcon /><h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Unified Availability</h1></div><div className="flex items-center gap-2"><button onClick={() => setViewStartDate(prev => addDays(prev, -7))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><ChevronLeftIcon /></button><button onClick={() => setViewStartDate(getStartOfWeek(new Date()))} className="px-4 py-2 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Today</button><button onClick={() => setViewStartDate(prev => addDays(prev, 7))} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><ChevronRightIcon /></button></div><span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">{viewStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {addDays(viewStartDate, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><div className="flex items-center gap-3"><span className="text-sm text-gray-600 dark:text-gray-400 hidden lg:block">{user?.email || ''}</span>{isGoogleConnected ? (<button className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-lg"><GoogleIcon /> Connected</button>) : (<button onClick={() => handleConnect('google')} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><GoogleIcon /> Connect Google</button>)}{isOutlookConnected ? (<button className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-lg"><OutlookIcon /> Connected</button>) : (<button onClick={() => handleConnect('outlook')} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><OutlookIcon /> Connect Outlook</button>)}<button onClick={() => setShowBoundaryModal(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"><PlusIcon /> Create Block</button><button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{theme === 'light' ? <MoonIcon/> : <SunIcon />}</button><button onClick={handleLogout} title="Logout" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><LogoutIcon/></button></div></div></header>);
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
    const BoundaryModal = ({ onClose }) => {
        const [title, setTitle] = useState(''); const [date, setDate] = useState(new Date().toISOString().split('T')[0]); const [startTime, setStartTime] = useState('09:00'); const [endTime, setEndTime] = useState('10:00'); const [error, setError] = useState(''); const [isSuggesting, setIsSuggesting] = useState(false); const [isCreating, setIsCreating] = useState(false);
        const handleSubmit = async (e) => {
             e.preventDefault(); setError(''); if (!title || !date || !startTime || !endTime) { setError('All fields required.'); return; } const start = new Date(`${date}T${startTime}`), end = new Date(`${date}T${endTime}`); if (start >= end) { setError('End time must be after start.'); return; } if (processedEvents.some(event => (start < new Date(event.end.getTime() + BUFFER_MS)) && (new Date(end.getTime() + BUFFER_MS) > event.start))) { setError('Time is too close to an existing event (15 min buffer).'); return; } setIsCreating(true); await handleCreateBoundary({ title, start, end }); setIsCreating(false);
        };
        const handleSuggestTitle = async () => {
            setIsSuggesting(true); setError(''); const prompt = "Suggest three concise, professional calendar event titles for a block of personal focus time. Examples: 'Deep Work', 'Strategic Planning', 'No Meetings'. Return as a comma-separated list."; const suggestions = await callGeminiAPI(prompt, token); const firstSuggestion = suggestions.split(',')[0].replace(/"/g, '').trim(); if (firstSuggestion && !firstSuggestion.toLowerCase().includes('error') && !firstSuggestion.toLowerCase().includes('sorry')) { setTitle(firstSuggestion); } else { console.error("AI Title Suggestion failed:", suggestions); setError(suggestions); } setIsSuggesting(false);
        };
        return ( <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4"><div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md"><h3 className="text-2xl font-bold mb-6 dark:text-white">Create Temporal Boundary</h3><form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><div className="flex gap-2 mt-1"><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder='"Family Time"' className="flex-grow bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 dark:text-white" /><button type="button" onClick={handleSuggestTitle} disabled={isSuggesting || isCreating} className="px-3 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 transition-colors">✨ {isSuggesting ? '...' : 'Suggest'}</button></div></div><div><label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label><input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} disabled={isCreating} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 dark:text-white disabled:opacity-50" /></div><div className="flex gap-4"><div className="flex-1"><label htmlFor="start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label><input type="time" id="start" value={startTime} onChange={e => setStartTime(e.target.value)} disabled={isCreating} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 dark:text-white disabled:opacity-50" /></div><div className="flex-1"><label htmlFor="end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label><input type="time" id="end" value={endTime} onChange={e => setEndTime(e.target.value)} disabled={isCreating} className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 dark:text-white disabled:opacity-50" /></div></div>{error && <p className="text-red-500 text-sm bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}<div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} disabled={isCreating} className="px-5 py-2.5 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">Cancel</button><button type="submit" disabled={isCreating} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800">{isCreating ? 'Creating...' : 'Create Block'}</button></div></form></div></div>);
    };
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
    const ConflictResolutionModal = ({ conflicts, onResolve, onReschedule, onIgnore }) => {
        const [isResolving, setIsResolving] = useState(false); const [aiSuggestion, setAiSuggestion] = useState(null);
        const currentConflict = conflicts[0];
        if (!currentConflict) return null;
        let [eventA, eventB] = currentConflict;

        // 3. ADD THIS HELPER
    const formatConflictTime = (date) => {
        return new Date(date).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const findNextSlots = (toReschedule, allEvents, count = 3) => { const slots = []; const duration = toReschedule.end.getTime() - toReschedule.start.getTime(); const requiredDuration = duration + (2 * BUFFER_MS); let searchStart = new Date(); const sorted = [...allEvents].filter(e => e.id !== toReschedule.id).sort((a,b) => a.start - b.start); for (let i = 0; i < 14; i++) { let dayStart = new Date(searchStart); dayStart.setDate(dayStart.getDate() + i); dayStart.setHours(9, 0, 0, 0); let dayEnd = new Date(dayStart); dayEnd.setHours(17, 0, 0, 0); let lastEventEnd = dayStart; for(const event of sorted.filter(e => e.start.toDateString() === dayStart.toDateString())) { if (event.start.getTime() - lastEventEnd.getTime() >= requiredDuration) { slots.push(new Date(lastEventEnd.getTime() + BUFFER_MS)); if (slots.length >= count) return slots; } lastEventEnd = new Date(Math.max(lastEventEnd.getTime(), event.end.getTime())); } if (dayEnd.getTime() - lastEventEnd.getTime() >= requiredDuration) { slots.push(new Date(lastEventEnd.getTime() + BUFFER_MS)); if (slots.length >= count) return slots; } } return slots; };
        const handleGetAiSuggestion = () => { setIsResolving(true); setAiSuggestion(null); setTimeout(() => { const severityMap = { 'High': 3, 'Medium': 2, 'Low': 1 }; let toKeep = severityMap[eventA.severity] >= severityMap[eventB.severity] ? eventA : eventB; let toReschedule = toKeep === eventA ? eventB : eventA; const nextSlots = findNextSlots(toReschedule, processedEvents); setAiSuggestion({ toKeep, toReschedule, nextSlots }); setIsResolving(false); }, 1500); };

        return ( 
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-500">Scheduling Conflict Detected</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You have an overlap on {formatDate(eventA.start)}. Choose one to keep, or let AI find a new time.</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {[eventA, eventB].map(event => (
                                <div key={event.id} className="border dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 flex flex-col justify-between"><div>
                                            <h4 className="font-bold text-lg flex items-center gap-2 dark:text-white">
                                                {event.calendar === 'Google' ? <GoogleIcon/> : <OutlookIcon/>}
                                                {event.title}
                                            </h4>
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    {formatTime(event.start)} - {formatTime(event.end)}
                                                </p>
                                                <p className="text-sm font-semibold mt-2 dark:text-gray-400">
                                                    Severity: <SeverityBadge severity={event.severity} />
                                                </p>
                                            </div>
                                            <button onClick={() => onResolve(event === eventA ? eventB : eventA)} className="mt-4 w-full px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Keep This</button>
                                                        </div>))}
            </div>
            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
            <button
                onClick={handleGetAiSuggestion}
                disabled={isResolving}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 dark:disabled:bg-purple-800 transition-colors"
                >
                {isResolving ? (
                <>Analyzing...</>
                ) : (
                <>
                    <SparklesIcon className="w-5 h-5 mr-2" /> Get AI Suggestions
                </>
                )}
            </button>
                <button onClick={() => onIgnore(getConflictId(eventA, eventB))} className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Ignore for now</button>
                {aiSuggestion && (<div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 rounded-lg text-sm space-y-3">
                <p><strong>Suggestion:</strong> Keep "{aiSuggestion.toKeep.title}". Here are some open slots for "{aiSuggestion.toReschedule.title}":</p>
                {aiSuggestion.nextSlots?.length > 0 ? (<div className="flex flex-col gap-2 pt-2">{aiSuggestion.nextSlots.map((slot, i) => (<button key={i} onClick={() => onReschedule(aiSuggestion.toReschedule, slot)} className="w-full text-left px-4 py-2 font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700">Reschedule to: {formatDateTime(slot)}</button>))}
                <button onClick={() => setAiSuggestion(null)} className="w-full mt-2 px-4 py-2 font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                </div>) : (<p className="pt-2">I couldn't find open slots with a 15-min buffer in the next 2 weeks.</p>)}</div>)}</div></div></div>);
    };

    // --- Main Render (Simplified Logic) ---
    const renderMainContent = () => {
        console.log("renderMainContent called. State:", { fetchError, isLoadingEvents, isGoogleConnected, isOutlookConnected, processedEventsLength: Array.isArray(processedEvents) ? processedEvents.length : 'N/A' });
        if (fetchError) {
            return <div className="p-4 m-4 text-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{fetchError}</div>;
        }
        if (isLoadingEvents) {
            return <div className="text-center p-20 text-gray-500 dark:text-gray-400">Loading your calendar...</div>;
        }
        // After loading and no error:
        if (!isGoogleConnected && !isOutlookConnected) {
             return <div className="p-4"><Onboarding /></div>;
        }
        // At least one calendar is connected
        if (Array.isArray(processedEvents) && processedEvents.length > 0) {
            return <Calendar />;
        } else {
             // Show "No events" only if loading is finished and no error occurred
             return <div className="text-center p-10 text-gray-500 dark:text-gray-400">No upcoming events found in your connected calendars for the next 30 days.</div>;
        }
    };

    return (
        <div className={`bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col`}>
            {token && user && <Header />}
            <main className="container mx-auto flex-grow overflow-auto">
                {renderMainContent()}
            </main>
            {showBoundaryModal && <BoundaryModal onClose={() => setShowBoundaryModal(false)} />}
            {showEventDetail && <EventDetailModal event={showEventDetail} onClose={() => setShowEventDetail(null)} />}
            {Array.isArray(unresolvedConflicts) && unresolvedConflicts.length > 0 && <ConflictResolutionModal conflicts={unresolvedConflicts} onResolve={handleResolveConflict} onReschedule={handleReschedule} onIgnore={handleIgnoreConflict} />}
        </div>
    );
}

