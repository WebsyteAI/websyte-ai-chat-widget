import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Form, useLoaderData, useActionData, useNavigation, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useState } from 'react';
import { UICacheService } from '../../workers/services/ui-cache';
import { CacheAdminService } from '../../workers/services/cache-admin';

interface CacheStats {
  totalCached: number;
  enabledUrls: string[];
  disabledUrls: string[];
}

interface CacheData {
  url: string;
  enabled: boolean;
  data?: {
    summaries?: any;
    recommendations?: any;
    timestamp: number;
  };
}

interface CacheList {
  urls: CacheData[];
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    // Access the cache service directly from context instead of making HTTP requests
    const env = context.cloudflare.env;
    
    const uiCache = new UICacheService(env.WIDGET_CACHE);
    const cacheAdmin = new CacheAdminService(uiCache);
    
    // Get stats and list directly from the services
    const stats = await uiCache.getCacheStats();
    const cachedUrls = await uiCache.listCachedUrls();
    
    const urlData = await Promise.all(
      cachedUrls.map(async (url) => ({
        url,
        enabled: await uiCache.getCacheEnabled(url),
        data: await uiCache.get(url)
      }))
    );

    const response = {
      stats: {
        totalCached: stats.totalCached,
        enabledUrls: stats.enabledUrls,
        disabledUrls: stats.disabledUrls
      },
      list: { urls: urlData }
    };
    
    return Response.json(response);
  } catch (error) {
    console.error('Admin cache loader error:', error);
    throw new Response('Failed to load cache data', { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  try {
    if (action === 'clearAll') {
      // Access the cache service directly from context instead of making HTTP requests
      const env = context.cloudflare.env;
      
      const uiCache = new UICacheService(env.WIDGET_CACHE);
      await uiCache.clearAll();
      
      return Response.json({ success: true, message: 'All cache cleared successfully' });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Admin cache action error:', error);
    return new Response(JSON.stringify({ error: 'Operation failed' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function CacheUrlCard({ urlData }: { urlData: CacheData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate mr-2">{urlData.url}</span>
          <Badge variant={urlData.enabled ? 'default' : 'secondary'}>
            {urlData.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {urlData.data && (
            <>
              Last updated: {new Date(urlData.data.timestamp).toLocaleString()}
              <br />
              Data: {urlData.data.summaries ? 'Summaries' : ''} 
              {urlData.data.summaries && urlData.data.recommendations ? ', ' : ''}
              {urlData.data.recommendations ? 'Recommendations' : ''}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={`/admin/cache/${encodeURIComponent(urlData.url)}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function CacheAdminPage() {
  const { stats, list } = useLoaderData<typeof loader>() as { stats: CacheStats; list: CacheList };
  const actionData = useActionData<typeof action>() as { success?: boolean; message?: string; error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUrls = list.urls.filter(url => 
    url.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cache Management</h1>
        <p className="text-muted-foreground">View and manage cached data for URLs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cached URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCached}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enabledUrls.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.disabledUrls.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Form method="post">
              <input type="hidden" name="action" value="clearAll" />
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                Clear All Cache
              </Button>
            </Form>
            
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {actionData?.success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
              {actionData.message}
            </div>
          )}
          
          {actionData?.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {actionData.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All URLs ({filteredUrls.length})</TabsTrigger>
          <TabsTrigger value="enabled">Enabled ({filteredUrls.filter(u => u.enabled).length})</TabsTrigger>
          <TabsTrigger value="disabled">Disabled ({filteredUrls.filter(u => !u.enabled).length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredUrls.map((urlData) => (
            <CacheUrlCard key={urlData.url} urlData={urlData} />
          ))}
          {filteredUrls.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No URLs found
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="enabled" className="space-y-4">
          {filteredUrls.filter(u => u.enabled).map((urlData) => (
            <CacheUrlCard key={urlData.url} urlData={urlData} />
          ))}
          {filteredUrls.filter(u => u.enabled).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No enabled URLs found
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="disabled" className="space-y-4">
          {filteredUrls.filter(u => !u.enabled).map((urlData) => (
            <CacheUrlCard key={urlData.url} urlData={urlData} />
          ))}
          {filteredUrls.filter(u => !u.enabled).length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No disabled URLs found
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}