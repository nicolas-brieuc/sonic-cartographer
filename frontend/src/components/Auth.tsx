import { useState } from 'react';
import { Music, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS, setAuthToken } from '../config/api';

interface AuthProps {
  onAuthSuccess: (user: { name: string; email: string }) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        // Register new user
        const response = await fetch(API_ENDPOINTS.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // Store token and user data
        setAuthToken(data.token);
        const userData = {
          name: formData.name,
          email: formData.email,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        onAuthSuccess(userData);
      } else {
        // Login existing user
        const response = await fetch(API_ENDPOINTS.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store token and user data
        setAuthToken(data.token);
        const userData = {
          name: data.user?.name || formData.email.split('@')[0],
          email: formData.email,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        onAuthSuccess(userData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1489829698480-bcea6e9719af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmRlcmdyb3VuZCUyMG11c2ljJTIwdmVudWV8ZW58MXx8fHwxNzY0ODUzOTExfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Music venue"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 border-4 border-[#ff0055] flex items-center justify-center bg-[#202020]">
              <Music className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-white uppercase tracking-tight mb-3 border-b-4 border-[#ff0055] inline-block pb-2">
            Sonic Cartographer
          </h1>
          <p className="text-gray-400 mb-4 uppercase tracking-wide text-sm">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
          
          {/* App Description Blurb */}
          <div className="max-w-lg mx-auto bg-[#202020] border-2 border-white p-4 mb-6">
            <p className="text-sm text-gray-300 leading-relaxed">
              Map your musical territory. Discover what you're missing. 
              Navigate beyond the algorithm.
            </p>
          </div>
        </div>

        <div className="bg-[#202020] border-4 border-white p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Divider for disabled options */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[#202020] text-gray-600 uppercase tracking-wide">Coming Soon</span>
              </div>
            </div>

            {/* Disabled Google Button */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-gray-600 border-2 border-gray-800 cursor-not-allowed opacity-50 relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="uppercase tracking-wide text-sm">Continue with Google</span>
            </button>

            {/* Disabled Apple Button */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-gray-600 border-2 border-gray-800 cursor-not-allowed opacity-50 relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="uppercase tracking-wide text-sm">Continue with Apple</span>
            </button>

            {/* Disabled Spotify Button */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-gray-600 border-2 border-gray-800 cursor-not-allowed opacity-50 relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span className="uppercase tracking-wide text-sm">Continue with Spotify</span>
            </button>

            {/* Disabled Discogs Button */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 text-gray-600 border-2 border-gray-800 cursor-not-allowed opacity-50 relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span className="uppercase tracking-wide text-sm">Continue with Discogs</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#202020] text-gray-400 uppercase tracking-wide">Or email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border-2 border-red-500 p-3 mb-4">
              <p className="text-red-300 text-sm uppercase tracking-wide">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm mb-2 text-white uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all text-black"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-white uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all text-black"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-white uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all text-black"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <span className="text-sm text-gray-600 uppercase tracking-wide cursor-not-allowed">
                  Forgot password? (Coming Soon)
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff0055] text-white py-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              {mode === 'login' ? "No account? " : "Have an account? "}
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-[#ff0055] hover:text-white"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Terms & Privacy */}
        <p className="text-xs text-center text-gray-600 mt-6 uppercase tracking-wide">
          By continuing, you agree to our{' '}
          <span className="text-gray-500">Terms (Coming Soon)</span>
          {' '}and{' '}
          <span className="text-gray-500">Privacy (Coming Soon)</span>
        </p>
      </div>
    </div>
  );
}