import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/auth/auth-context';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img
            className="mx-auto h-12 w-auto"
            src="/websyte-ai-logo.svg"
            alt="Websyte AI"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to Websyte AI
          </p>
        </div>

        {/* Google Sign In */}
        <div className="mt-8">
          <div className="space-y-4">
            <GoogleSignInButton />
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </a>
          <div className="text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            {' · '}
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}