import { TabsContent } from '../../ui/tabs';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Sparkles, FileEdit, Lock, Settings } from 'lucide-react';
import { EmbedCodeGenerator } from '../EmbedCodeGenerator';
import type { Widget, Recommendation, WidgetLink } from '../types';

interface SettingsTabProps {
  widget?: Widget;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  recommendations: Recommendation[];
  links: WidgetLink[];
  generatingRecommendations: boolean;
  generatingLinks: boolean;
  isEditing: boolean;
  handleToggleVisibility: (isPublic: boolean) => void;
  generateRecommendations: () => void;
  regenerateLinks: () => void;
}

export function SettingsTab({
  widget,
  isPublic,
  setIsPublic,
  recommendations,
  links,
  generatingRecommendations,
  generatingLinks,
  isEditing,
  handleToggleVisibility,
  generateRecommendations,
  regenerateLinks
}: SettingsTabProps) {
  return (
    <TabsContent value="settings">
      <div className="space-y-6">
        {/* Widget Visibility */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Widget Visibility
              </CardTitle>
              <CardDescription>
                Control who can access your widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPublic" 
                  checked={isPublic}
                  onCheckedChange={(checked) => {
                    const newValue = checked === true;
                    setIsPublic(newValue);
                    handleToggleVisibility(newValue);
                  }}
                />
                <Label 
                  htmlFor="isPublic" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Make this widget publicly accessible
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isPublic 
                  ? 'Anyone with the widget ID can embed and use this widget' 
                  : 'Only you can access and use this widget'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Pre-generated questions to help users get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-2 mb-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{rec.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                No recommendations generated yet. Click the button below to generate AI-powered recommendations based on your content.
              </p>
            )}
            
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRecommendations}
                disabled={generatingRecommendations}
              >
                {generatingRecommendations ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {recommendations.length > 0 ? 'Regenerate' : 'Generate'} Recommendations
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Important Links Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              Important Links
            </CardTitle>
            <CardDescription>
              Key pages and resources extracted from your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length > 0 ? (
              <div className="space-y-2 mb-4">
                {links.map((link, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {link.text}
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      {link.category} • {link.importance} importance
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                No links extracted yet. Links are automatically extracted when you crawl a website.
              </p>
            )}
            
            {isEditing && links.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={regenerateLinks}
                disabled={generatingLinks}
              >
                {generatingLinks ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <FileEdit className="w-4 h-4 mr-2" />
                    Regenerate Links
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Embed Code */}
        {isEditing && widget && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Embed Code
              </CardTitle>
              <CardDescription>
                Copy this code to add the chat widget to your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmbedCodeGenerator widgetId={widget.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}