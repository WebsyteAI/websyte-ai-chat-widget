import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { Navigate } from "react-router";

interface Widget {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  userId?: string;
}

interface MessageEvent {
  type: string;
  data: any;
  timestamp: string;
  source: 'parent' | 'iframe';
}

export default function TestIframe() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loadingWidgets, setLoadingWidgets] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState("");
  const [iframeConfig, setIframeConfig] = useState({
    width: "400",
    height: "600",
    minHeight: "400",
    maxHeight: "800",
    autoResize: true,
    border: true,
    rounded: true,
    shadow: true,
  });
  const [messageLog, setMessageLog] = useState<MessageEvent[]>([]);
  const [iframeDimensions, setIframeDimensions] = useState({ width: 0, height: 0 });
  const [testScenario, setTestScenario] = useState<'basic' | 'responsive' | 'multiple' | 'stress'>('basic');
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});
  const performanceMetrics = useRef({ renderTime: 0, lastUpdate: Date.now() });

  // Load widgets for admin testing
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const loadWidgets = async () => {
        setLoadingWidgets(true);
        try {
          const response = await fetch('/api/admin/widgets');
          if (response.ok) {
            const data = await response.json() as { widgets: Widget[] };
            setWidgets(data.widgets || []);
            // Auto-select first public widget
            const firstPublic = data.widgets.find(w => w.isPublic);
            if (firstPublic) setSelectedWidgetId(firstPublic.id);
          }
        } catch (error) {
          console.error('Error loading widgets:', error);
        } finally {
          setLoadingWidgets(false);
        }
      };
      loadWidgets();
    }
  }, [isAuthenticated, isAdmin]);

  // PostMessage listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin
      if (event.origin !== window.location.origin) return;

      const logEntry: MessageEvent = {
        type: event.data.type || 'unknown',
        data: event.data,
        timestamp: new Date().toISOString(),
        source: 'iframe'
      };

      setMessageLog(prev => [...prev.slice(-49), logEntry]);

      // Handle resize messages
      if (event.data.type === 'resize' && iframeConfig.autoResize) {
        const iframe = Object.values(iframeRefs.current).find(iframe => 
          iframe?.contentWindow === event.source
        );
        if (iframe && event.data.height) {
          const newHeight = Math.min(
            Math.max(event.data.height, parseInt(iframeConfig.minHeight)),
            parseInt(iframeConfig.maxHeight)
          );
          iframe.style.height = `${newHeight}px`;
          setIframeDimensions({ 
            width: iframe.offsetWidth, 
            height: newHeight 
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [iframeConfig]);

  // Send test message to iframe
  const sendTestMessage = (type: string, data?: any) => {
    const iframe = iframeRefs.current['main'];
    if (iframe?.contentWindow) {
      const message = { type, data, timestamp: Date.now() };
      iframe.contentWindow.postMessage(message, window.location.origin);
      
      const logEntry: MessageEvent = {
        type,
        data: message,
        timestamp: new Date().toISOString(),
        source: 'parent'
      };
      setMessageLog(prev => [...prev.slice(-49), logEntry]);
    }
  };

  // Measure iframe dimensions
  const measureIframe = () => {
    const iframe = iframeRefs.current['main'];
    if (iframe) {
      setIframeDimensions({
        width: iframe.offsetWidth,
        height: iframe.offsetHeight
      });
    }
  };

  // Clear message log
  const clearLog = () => setMessageLog([]);

  // Check authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Generate iframe embed code
  const generateEmbedCode = () => {
    const params = new URLSearchParams();
    if (selectedWidgetId) params.set('widgetId', selectedWidgetId);
    params.set('embedded', 'true');
    
    return `<iframe
  src="${window.location.origin}/share/w/${selectedWidgetId}?${params.toString()}"
  width="${iframeConfig.width}"
  height="${iframeConfig.height}"
  style="border: ${iframeConfig.border ? '1px solid #e5e7eb' : 'none'}; 
         border-radius: ${iframeConfig.rounded ? '8px' : '0'}; 
         box-shadow: ${iframeConfig.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'};"
  allow="clipboard-write"
  title="AI Chat Widget"
></iframe>`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">🧪 Iframe Implementation Testing</h1>
          <p className="text-blue-800">
            Test various iframe configurations, PostMessage API, and resize behaviors for widget embedding.
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Panel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Widget
              </label>
              {loadingWidgets ? (
                <div className="text-gray-500">Loading widgets...</div>
              ) : (
                <select
                  value={selectedWidgetId}
                  onChange={(e) => setSelectedWidgetId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select a widget --</option>
                  {widgets.filter(w => w.isPublic).map((widget) => (
                    <option key={widget.id} value={widget.id}>
                      {widget.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Test Scenario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Scenario
              </label>
              <select
                value={testScenario}
                onChange={(e) => setTestScenario(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="basic">Basic Single Iframe</option>
                <option value="responsive">Responsive Sizes</option>
                <option value="multiple">Multiple Iframes</option>
                <option value="stress">Stress Test (4 iframes)</option>
              </select>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={iframeConfig.width}
                  onChange={(e) => setIframeConfig(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="Width"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  value={iframeConfig.height}
                  onChange={(e) => setIframeConfig(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="Height"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Auto Resize Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Resize
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={iframeConfig.autoResize}
                    onChange={(e) => setIframeConfig(prev => ({ ...prev, autoResize: e.target.checked }))}
                    className="mr-2"
                  />
                  Enable auto-resize
                </label>
                {iframeConfig.autoResize && (
                  <div className="flex gap-2 ml-6">
                    <input
                      type="number"
                      value={iframeConfig.minHeight}
                      onChange={(e) => setIframeConfig(prev => ({ ...prev, minHeight: e.target.value }))}
                      placeholder="Min height"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      value={iframeConfig.maxHeight}
                      onChange={(e) => setIframeConfig(prev => ({ ...prev, maxHeight: e.target.value }))}
                      placeholder="Max height"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Styling Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Styling
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={iframeConfig.border}
                    onChange={(e) => setIframeConfig(prev => ({ ...prev, border: e.target.checked }))}
                    className="mr-2"
                  />
                  Show border
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={iframeConfig.rounded}
                    onChange={(e) => setIframeConfig(prev => ({ ...prev, rounded: e.target.checked }))}
                    className="mr-2"
                  />
                  Rounded corners
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={iframeConfig.shadow}
                    onChange={(e) => setIframeConfig(prev => ({ ...prev, shadow: e.target.checked }))}
                    className="mr-2"
                  />
                  Drop shadow
                </label>
              </div>
            </div>

            {/* PostMessage Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PostMessage Testing
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => sendTestMessage('ping')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm mr-2"
                >
                  Send Ping
                </button>
                <button
                  onClick={() => sendTestMessage('theme', { mode: 'dark' })}
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm mr-2"
                >
                  Toggle Theme
                </button>
                <button
                  onClick={() => sendTestMessage('resize', { height: 700 })}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Request Resize
                </button>
              </div>
            </div>
          </div>

          {/* Embed Code Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Generated Embed Code:</h3>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
              <code>{generateEmbedCode()}</code>
            </pre>
          </div>
        </div>

        {/* Test Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Iframe Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Iframe Test Area</h2>
              
              {selectedWidgetId ? (
                <div className="space-y-4">
                  {/* Basic Scenario */}
                  {testScenario === 'basic' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Basic Single Iframe</h3>
                      <iframe
                        ref={(el) => { iframeRefs.current['main'] = el; }}
                        src={`${window.location.origin}/share/w/${selectedWidgetId}?embedded=true`}
                        width={iframeConfig.width}
                        height={iframeConfig.height}
                        style={{
                          border: iframeConfig.border ? '1px solid #e5e7eb' : 'none',
                          borderRadius: iframeConfig.rounded ? '8px' : '0',
                          boxShadow: iframeConfig.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                        }}
                        allow="clipboard-write"
                        title="AI Chat Widget"
                        onLoad={measureIframe}
                      />
                    </div>
                  )}

                  {/* Responsive Scenario */}
                  {testScenario === 'responsive' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Responsive Size Testing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mobile (375x667)</p>
                          <iframe
                            ref={(el) => { iframeRefs.current['mobile'] = el; }}
                            src={`${window.location.origin}/share/w/${selectedWidgetId}?embedded=true`}
                            width="375"
                            height="667"
                            className="border border-gray-300 rounded"
                            allow="clipboard-write"
                            title="Mobile Widget"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tablet (768x600)</p>
                          <iframe
                            ref={(el) => { iframeRefs.current['tablet'] = el; }}
                            src={`${window.location.origin}/share/w/${selectedWidgetId}?embedded=true`}
                            width="100%"
                            height="600"
                            className="border border-gray-300 rounded"
                            style={{ maxWidth: '768px' }}
                            allow="clipboard-write"
                            title="Tablet Widget"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multiple Iframes */}
                  {testScenario === 'multiple' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Multiple Iframes Test</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((num) => (
                          <iframe
                            key={num}
                            ref={(el) => { iframeRefs.current[`multiple-${num}`] = el; }}
                            src={`${window.location.origin}/share/w/${selectedWidgetId}?embedded=true&instance=${num}`}
                            width="100%"
                            height="500"
                            className="border border-gray-300 rounded"
                            allow="clipboard-write"
                            title={`Widget Instance ${num}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stress Test */}
                  {testScenario === 'stress' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Stress Test (4 Iframes)</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <iframe
                            key={num}
                            ref={(el) => { iframeRefs.current[`stress-${num}`] = el; }}
                            src={`${window.location.origin}/share/w/${selectedWidgetId}?embedded=true&instance=${num}`}
                            width="100%"
                            height="400"
                            className="border border-gray-300 rounded"
                            allow="clipboard-write"
                            title={`Stress Test ${num}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select a widget to begin testing
                </div>
              )}
            </div>
          </div>

          {/* Debug Panel */}
          <div className="space-y-6">
            {/* Current Dimensions */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-3">Current Iframe Dimensions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Width:</span>
                  <span className="font-mono">{iframeDimensions.width}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-mono">{iframeDimensions.height}px</span>
                </div>
                <button
                  onClick={measureIframe}
                  className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm w-full"
                >
                  Re-measure
                </button>
              </div>
            </div>

            {/* Message Log */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">PostMessage Log</h3>
                <button
                  onClick={clearLog}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messageLog.length === 0 ? (
                  <p className="text-gray-500 text-sm">No messages yet...</p>
                ) : (
                  messageLog.map((msg, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-white ${
                          msg.source === 'parent' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {msg.source}
                        </span>
                        <span className="font-mono text-gray-600">{msg.type}</span>
                      </div>
                      <div className="text-gray-600 break-all">
                        {JSON.stringify(msg.data, null, 2)}
                      </div>
                      <div className="text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Iframes:</span>
                  <span className="font-mono">{Object.keys(iframeRefs.current).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Messages Logged:</span>
                  <span className="font-mono">{messageLog.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Usage:</span>
                  <span className="font-mono text-xs">
                    {(performance as any).memory ? 
                      `${Math.round((performance as any).memory.usedJSHeapSize / 1048576)}MB` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}