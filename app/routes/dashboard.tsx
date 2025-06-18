import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { UserProfile } from '../components/auth/UserProfile';
import { WidgetList } from '../components/widgets/WidgetList';
import { WidgetForm } from '../components/widgets/WidgetForm';
import { SearchWidget } from '../components/widgets/SearchWidget';

interface Widget {
  id: number;
  name: string;
  description?: string;
  url?: string;
  cacheEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  files: Array<{
    id: number;
    filename: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
  }>;
  embeddingsCount: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleCreateWidget = async (formData: FormData) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create widget');
      }

      setShowCreateForm(false);
      // Widget list will refresh automatically via its own useEffect
    } catch (error) {
      console.error('Error creating widget:', error);
      alert('Failed to create widget. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditWidget = async (formData: FormData) => {
    if (!editingWidget) return;
    
    setFormLoading(true);
    try {
      // Convert FormData to JSON for PUT request
      const data: any = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          data[key] = value;
        }
      }

      const response = await fetch(`/api/widgets/${editingWidget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update widget');
      }

      setEditingWidget(null);
      // Widget list will refresh automatically
    } catch (error) {
      console.error('Error updating widget:', error);
      alert('Failed to update widget. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWidget = async (widget: Widget) => {
    if (!confirm(`Are you sure you want to delete "${widget.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/widgets/${widget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete widget');
      }

      // Widget list will refresh automatically
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert('Failed to delete widget. Please try again.');
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
            
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Manage your Websyte AI chat widgets and vector search.
          </p>
        </div>

        {/* Show create/edit form or main dashboard */}
        {showCreateForm ? (
          <WidgetForm
            onSubmit={handleCreateWidget}
            onCancel={() => setShowCreateForm(false)}
            loading={formLoading}
          />
        ) : editingWidget ? (
          <WidgetForm
            widget={editingWidget}
            onSubmit={handleEditWidget}
            onCancel={() => setEditingWidget(null)}
            loading={formLoading}
          />
        ) : (
          <Tabs defaultValue="widgets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="widgets">My Widgets</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="space-y-6">
              <WidgetList
                onCreateWidget={() => setShowCreateForm(true)}
                onEditWidget={setEditingWidget}
                onDeleteWidget={handleDeleteWidget}
              />
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <SearchWidget className="max-w-4xl mx-auto" />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Widgets</CardTitle>
                    <CardDescription>Widgets currently deployed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">No widgets deployed yet</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Conversations</CardTitle>
                    <CardDescription>All-time chat interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">Start getting conversations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Month</CardTitle>
                    <CardDescription>Conversations this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">0</div>
                    <p className="text-sm text-gray-600 mt-1">Monthly activity</p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deploy Your Widget</CardTitle>
                    <CardDescription>
                      Get the embed code for your AI chat widget
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Copy the embed code and add it to your website to start engaging with your visitors.
                    </p>
                    <Link to="/">
                      <Button className="w-full">
                        Get Embed Code
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                    <CardDescription>
                      Monitor your widget performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      View detailed analytics and usage patterns for your widgets.
                    </p>
                    <Button variant="outline" className="w-full" disabled>
                      View Analytics (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your profile and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Name:</span> {user.name}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    Edit Profile (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}