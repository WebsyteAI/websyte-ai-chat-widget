export default function CacheTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Cache API Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-100 border border-blue-200 rounded">
          <h2 className="font-semibold">Basic Test</h2>
          <p>This is a simple test page to verify routing works.</p>
          <p>If you can see this, the route is working.</p>
        </div>
        
        <div className="p-4 bg-yellow-100 border border-yellow-200 rounded">
          <h2 className="font-semibold">Next Steps</h2>
          <p>Now we need to test the API endpoints manually:</p>
          <ul className="list-disc ml-4 mt-2">
            <li><a href="/api/health" className="text-blue-600 underline">/api/health</a></li>
            <li><a href="/api/admin/cache/stats" className="text-blue-600 underline">/api/admin/cache/stats</a></li>
            <li><a href="/api/admin/cache/list" className="text-blue-600 underline">/api/admin/cache/list</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}