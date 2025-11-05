
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import AuthLayout from '../components/AuthLayout';
import { LoadingIcon, EyeIcon, EyeOffIcon } from '../components/icons';

type AuthMode = 'login' | 'signup' | 'reset';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (['login', 'signup', 'reset'].includes(hash)) {
                setMode(hash as AuthMode);
            } else {
                setMode('login');
            }
            setError(null);
            setMessage(null);
        };
        handleHashChange(); // Initial check
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } },
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // The onAuthStateChange listener in AuthContext will handle the redirect.
            } else if (mode === 'reset') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.APP_CONFIG.PUBLIC_SITE_URL,
                });
                if (error) throw error;
                setMessage('Check your email for the password reset link!');
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const titles = {
        login: 'Welcome Back!',
        signup: 'Create Your Account',
        reset: 'Reset Password',
    };

    const PasswordInput = () => (
        <div className="relative">
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
            <input
                id="password"
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-slate-500" />
                ) : (
                    <EyeIcon className="h-5 w-5 text-slate-500" />
                )}
            </button>
        </div>
    );

    return (
        <AuthLayout>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{titles[mode]}</h1>
            <p className="text-slate-600 mb-8">
                {mode === 'login' && "Enter your credentials to access your dashboard."}
                {mode === 'signup' && "Let's get you started with Gluceel."}
                {mode === 'reset' && "Enter your email to receive a reset link."}
            </p>

            <form onSubmit={handleAuth} className="space-y-6">
                {mode === 'signup' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700" htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            type="text"
                            name="fullName"
                            placeholder="Jane Doe"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {mode !== 'reset' && <PasswordInput />}
                
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                    >
                        {loading && <LoadingIcon className="h-5 w-5 mr-2" />}
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                {mode === 'login' && (
                    <p className="text-slate-600">
                        Don't have an account?{' '}
                        <a href="#signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
                        <span className="mx-2">|</span>
                        <a href="#reset" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                    </p>
                )}
                {mode === 'signup' && (
                     <p className="text-slate-600">
                        Already have an account?{' '}
                        <a href="#login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
                    </p>
                )}
                 {mode === 'reset' && (
                     <p className="text-slate-600">
                        Remembered your password?{' '}
                        <a href="#login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
                    </p>
                )}
            </div>
             <div className="mt-4 pt-4 border-t text-center text-sm">
                 <a href="#doctor-code" className="text-slate-500 hover:text-slate-700">
                    Are you a doctor? Enter your code here.
                 </a>
            </div>
        </AuthLayout>
    );
};

export default AuthPage;
