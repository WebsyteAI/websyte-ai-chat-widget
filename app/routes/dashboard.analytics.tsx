import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function DashboardAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Widgets</CardTitle>
            <CardDescription>Widgets currently deployed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">Coming Soon</div>
            <p className="text-sm text-gray-500 mt-1">Analytics will be available soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Conversations</CardTitle>
            <CardDescription>All-time chat interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">Coming Soon</div>
            <p className="text-sm text-gray-500 mt-1">Analytics will be available soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
            <CardDescription>Conversations this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">Coming Soon</div>
            <p className="text-sm text-gray-500 mt-1">Analytics will be available soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Widget Performance</CardTitle>
            <CardDescription>
              Track your widget engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Detailed performance metrics and user engagement data will be available soon.
            </p>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Reports</CardTitle>
            <CardDescription>
              Download detailed usage reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Export comprehensive analytics reports for your widgets.
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Full Width Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analytics and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Analytics Coming Soon</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              We're working on bringing you detailed analytics including conversation trends, 
              user engagement metrics, and performance insights. Stay tuned!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}