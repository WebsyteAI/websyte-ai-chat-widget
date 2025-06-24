import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../lib/auth/auth-context';

export default function DashboardSettings() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
}