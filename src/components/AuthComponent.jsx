// --- Authentication Component ---
const AuthComponent = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true); setError(''); setMessage('');
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        console.log(`Attempting ${isLogin ? 'login' : 'registration'} for ${email}...`);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const responseText = await response.text();
            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                let errorMessage = `Request failed with status: ${response.status}`;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    try { const errorData = JSON.parse(responseText); errorMessage = errorData.message || errorMessage; }
                    catch (e) { console.warn("Could not parse JSON error response:", responseText); errorMessage = `Server returned invalid JSON error (status ${response.status}).`; }
                } else { console.error("Non-JSON error response:", responseText.substring(0, 200)); errorMessage = `Server returned an unexpected error (status ${response.status}).`; }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                 console.error("Non-JSON success response:", responseText.substring(0, 100)); throw new Error(`Server returned an unexpected success response (not JSON).`);
             }

            const data = JSON.parse(responseText);
            console.log("Parsed response data:", data);

            if (isLogin) {
                if (!data.token || !data.user || !data.user.id || !data.user.email) {
                     console.error("Login successful, but server response missing token or user data:", data); throw new Error("Login successful, but server did not return valid token or user data.");
                 }
                console.log("Login successful, calling onLoginSuccess...");
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess(data.token, data.user);
                } else {
                     console.error("onLoginSuccess prop is not a function!");
                     setError("Internal application error: Cannot complete login.");
                }
            } else {
                console.log("Registration successful.");
                setMessage(data.message || "Registration successful. Please log in.");
                setIsLogin(true); setEmail(''); setPassword('');
            }
        } catch (err) {
            console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, err);
             if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                 setError("Could not connect to the backend server. Please ensure it's running and accessible at " + API_BASE_URL);
             } else { setError(err.message); }
        } finally { setIsLoading(false); }
    };

    return ( <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"><div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"><div className="text-center"><h2 className="text-3xl font-bold text-gray-900 dark:text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h2><p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{isLogin ? "Sign in to view your unified calendar" : "Get started by creating a new account"}</p></div><form className="mt-8 space-y-6" onSubmit={handleSubmit}><div className="rounded-md shadow-sm -space-y-px"><div><input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address" /></div><div><input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" /></div></div>{error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}{message && <p className="text-sm text-green-500 bg-green-100 dark:bg-green-900/50 p-3 rounded-lg text-center">{message}</p>}<div><button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}</button></div></form><p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">{isLogin ? "Don't have an account?" : "Already have an account?"}<button onClick={() => {setIsLogin(!isLogin); setError(''); setMessage('');}} className="font-medium text-blue-600 hover:text-blue-500 ml-1">{isLogin ? 'Register' : 'Sign In'}</button></p></div></div>);
};