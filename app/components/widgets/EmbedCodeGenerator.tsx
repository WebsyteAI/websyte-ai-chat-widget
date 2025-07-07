import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScriptCopyBtn } from '../ui/script-copy-btn';
import { toast } from '@/lib/use-toast';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';

interface EmbedCodeGeneratorProps {
  widgetId: string;
  isPublic: boolean;
  onTogglePublic: () => void;
}

export function EmbedCodeGenerator({ widgetId, isPublic, onTogglePublic }: EmbedCodeGeneratorProps) {
  const [embedType, setEmbedType] = useState<'script' | 'iframe'>('iframe');
  const [shareUrlCopied, setShareUrlCopied] = useState(false);

  const baseUrl = window.location.origin;

  // Generate script embed code
  const scriptEmbedCode = useMemo(() => {
    const attributes = [
      `src="${baseUrl}/dist/widget.js"`,
      `data-widget-id="${widgetId}"`,
      'async'
    ].filter(Boolean);
    
    return `<script ${attributes.join(' ')}></script>`;
  }, [widgetId, baseUrl]);

  // Generate iframe embed code - always responsive
  const iframeEmbedCode = useMemo(() => {
    const iframeUrl = `${baseUrl}/share/w/${widgetId}?embed=true`;
    
    // Always responsive iframe with 100% width and height
    const iframeHtml = `<iframe
  src="${iframeUrl}"
  style="width: 100%; height: 100%; border: none;"
  title="AI Chat Widget"
  allow="clipboard-write"
></iframe>`;
    
    return iframeHtml;
  }, [widgetId, baseUrl]);

  // Generate shareable URL
  const shareableUrl = `${baseUrl}/share/w/${widgetId}`;

  const copyShareableUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setShareUrlCopied(true);
      toast.success('Shareable URL copied to clipboard!');
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Embed Widget</CardTitle>
            <CardDescription>
              Choose how to embed this widget on your website
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Public</span>
            <button
              type="button"
              onClick={onTogglePublic}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isPublic ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        {isPublic ? (
          <div className="space-y-6">
            {/* Shareable URL */}
            <div className="space-y-2">
              <Label>Direct Share URL</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-700">
                  {shareableUrl}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyShareableUrl}
                  className="flex items-center gap-2"
                >
                  {shareUrlCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(shareableUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Share this URL directly for full-screen chat access without embedding.
              </p>
            </div>

            <div className="space-y-4 border-t pt-6">
                {/* Generated Code */}
                <div className="space-y-2">
                  <Label>Embed Code</Label>
                  <ScriptCopyBtn
                    code={iframeEmbedCode}
                    codeLanguage="html"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-600">
                    The iframe is responsive (100% width and height). Make sure to wrap it in a container with defined dimensions.
                  </p>
                </div>

                {/* Example usage */}
                <div className="space-y-2">
                  <Label>Example Usage</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
{`<div style="height: 600px;">
  ${iframeEmbedCode}
</div>`}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-600">
                    Wrap the iframe in a container with a fixed height for best results.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">iFrame Benefits</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Complete isolation from your site's code</li>
                    <li>• No conflicts with existing JavaScript</li>
                    <li>• Secure cross-origin communication</li>
                    <li>• Easy to implement and maintain</li>
                    <li>• Supports PostMessage API for advanced features</li>
                  </ul>
                </div>
            </div>

            {/* Usage Instructions */}
            <div className="border-t pt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li>
                        <strong>iFrame Embed:</strong> Currently the only supported embedding method. Provides complete isolation and security.
                      </li>
                      <li>
                        <strong>Responsive Design:</strong> The widget automatically adapts to different screen sizes.
                      </li>
                      <li>
                        <strong>Container Sizing:</strong> When using iframe embed, wrap it in a container with defined height (e.g., 600px or 100vh).
                      </li>
                      <li>
                        <strong>Testing:</strong> Always test the widget on your actual website to ensure proper display.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Widget is Private</h3>
            <p className="text-gray-600 mb-4">
              Enable public access to generate embed codes for your website
            </p>
            <Button onClick={onTogglePublic} size="sm">
              Make Widget Public
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}