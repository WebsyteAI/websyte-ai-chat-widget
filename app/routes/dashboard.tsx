import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth/auth-context';
import { UserProfile } from '../components/auth/UserProfile';
import { cn } from '../lib/utils';


export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    return location.pathname === path;
  };

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

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/websyte-ai-logo.svg"
                  alt="Websyte AI"
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-gray-900">
                  websyte.ai
                </span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center">
              <div className="flex space-x-8">
                <Link
                  to="/dashboard/widgets"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    location.pathname.startsWith('/dashboard/widgets')
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  My Widgets
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isActiveRoute('/dashboard/analytics')
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  Analytics
                </Link>
                <Link
                  to="/dashboard/settings"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isActiveRoute('/dashboard/settings')
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  Settings
                </Link>
              </div>
            </nav>
            
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Nested Route Content */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}