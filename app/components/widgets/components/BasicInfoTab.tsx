import { TabsContent } from '../../ui/tabs';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Info } from 'lucide-react';

interface BasicInfoTabProps {
  name: string;
  description: string;
  url: string;
  logoUrl: string;
  updateField: (field: string, value: string) => void;
}

export function BasicInfoTab({ 
  name, 
  description, 
  url, 
  logoUrl, 
  updateField 
}: BasicInfoTabProps) {
  return (
    <TabsContent value="basic">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Widget Name *</Label>
          <Input 
            id="name" 
            value={name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="My Customer Support" 
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="AI-powered customer support assistant" 
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input 
            id="url" 
            type="url" 
            value={url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://example.com" 
          />
        </div>
        
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input 
            id="logoUrl" 
            type="url" 
            value={logoUrl}
            onChange={(e) => updateField('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png" 
          />
          <p className="text-xs text-muted-foreground mt-1">
            This logo will be displayed in your chat widget
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Widget Information</p>
              <p>This information helps identify your widget and can be displayed to users.</p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}