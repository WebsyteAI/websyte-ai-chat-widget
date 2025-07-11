import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth/auth-context';
import { UserProfile } from '../components/auth/UserProfile';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';


export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="flex space-x-8">
                <Link
                  to="/dashboard/widgets"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    location.pathname.startsWith('/dashboard/widgets')
                      ? "bg-gray-100 text-gray-900"
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
                      ? "bg-gray-100 text-gray-900"
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
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  Settings
                </Link>
              </div>
              <UserProfile />
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-3 border-t pt-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  to="/dashboard/widgets"
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    location.pathname.startsWith('/dashboard/widgets')
                      ? "bg-gray-100 text-gray-900"
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
                      ? "bg-gray-100 text-gray-900"
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
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  Settings
                </Link>
                <div className="pt-3 border-t">
                  <UserProfile />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Conditionally apply max-width for non-editor routes */}
        {location.pathname.includes('/widgets/new') || location.pathname.includes('/edit') ? (
          <div className="h-full">
            <Outlet />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}