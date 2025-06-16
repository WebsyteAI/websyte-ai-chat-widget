import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { Form, useLoaderData, useActionData, useNavigation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

interface CacheData {
  url: string;
  enabled: boolean;
  data?: {
    summaries?: {
      short: string;
      medium: string;
    };
    recommendations?: {
      recommendations: Array<{ title: string; description: string }>;
      placeholder: string;
    };
    timestamp: number;
  };
}

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const url = params.url;
  if (!url) {
    throw new Response('URL parameter required', { status: 400 });
  }

  const decodedUrl = decodeURIComponent(url);
  const baseUrl = new URL(request.url).origin;
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/cache/list`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cache data');
    }
    
    const data = await response.json();
    const urlData = data.urls.find((item: CacheData) => item.url === decodedUrl);
    
    if (!urlData) {
      throw new Response('URL not found in cache', { status: 404 });
    }
    
    return Response.json({ urlData, decodedUrl });
  } catch (error) {
    throw new Response('Failed to load cache data', { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const url = params.url;
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL parameter required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const decodedUrl = decodeURIComponent(url);
  const baseUrl = new URL(request.url).origin;
  const formData = await request.formData();
  const action = formData.get('action');

  try {
    if (action === 'toggle') {
      const response = await fetch(`${baseUrl}/api/admin/cache/toggle/${encodeURIComponent(decodedUrl)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle cache');
      }
      
      const result = await response.json();
      return Response.json({ success: true, message: result.message });
    }
    
    if (action === 'clear') {
      const response = await fetch(`${baseUrl}/api/admin/cache/${encodeURIComponent(decodedUrl)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      
      return redirect('/admin/cache');
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Operation failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export default function CacheDetailPage() {
  const { urlData, decodedUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cache Details</h1>
        <p className="text-muted-foreground">Manage cache for specific URL</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            URL Cache Status
            <Badge variant={urlData.enabled ? 'default' : 'secondary'}>
              {urlData.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
          <CardDescription className="break-all">
            {decodedUrl}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Form method="post">
              <input type="hidden" name="action" value="toggle" />
              <Button type="submit" disabled={isSubmitting}>
                {urlData.enabled ? 'Disable' : 'Enable'} Cache
              </Button>
            </Form>
            <Form method="post">
              <input type="hidden" name="action" value="clear" />
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                Clear Cache
              </Button>
            </Form>
          </div>
          
          {actionData?.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 mb-4">
              {actionData.message}
            </div>
          )}
          
          {actionData?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
              {actionData.error}
            </div>
          )}
        </CardContent>
      </Card>

      {urlData.data && (
        <Card>
          <CardHeader>
            <CardTitle>Cached Data</CardTitle>
            <CardDescription>
              Last updated: {new Date(urlData.data.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {urlData.data.summaries && (
              <div>
                <h3 className="font-semibold mb-2">Summaries</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Short Summary</h4>
                    <p className="text-sm bg-muted p-3 rounded">{urlData.data.summaries.short}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Medium Summary</h4>
                    <p className="text-sm bg-muted p-3 rounded">{urlData.data.summaries.medium}</p>
                  </div>
                </div>
              </div>
            )}
            
            {urlData.data.recommendations && (
              <div>
                <Separator className="my-4" />
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Placeholder: {urlData.data.recommendations.placeholder}
                  </p>
                  <div className="grid gap-2">
                    {urlData.data.recommendations.recommendations.map((rec, index) => (
                      <div key={index} className="bg-muted p-3 rounded">
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}