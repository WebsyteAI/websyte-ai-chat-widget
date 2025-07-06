# Component Catalog

Complete catalog of UI components with usage examples and props documentation.

## 📑 Table of Contents

1. [Base Components](#base-components)
2. [Form Components](#form-components)
3. [Feedback Components](#feedback-components)
4. [Overlay Components](#overlay-components)
5. [Custom Components](#custom-components)
6. [Chat Components](#chat-components)
7. [Landing Components](#landing-components)

## Base Components

### Button
Primary interactive element for user actions.

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button>
  <IconPlus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Loading state
<Button disabled>
  <Loader className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

**Props:**
- `variant`: 'default' | 'outline' | 'ghost' | 'link'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `asChild`: boolean (for composition)

### Card
Container component for grouping related content.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge
Small label for status or metadata.

```typescript
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
```

### Separator
Visual divider between sections.

```typescript
import { Separator } from '@/components/ui/separator';

<div>
  <h3>Section 1</h3>
  <Separator />
  <h3>Section 2</h3>
</div>

// Vertical separator
<Separator orientation="vertical" />
```

## Form Components

### Input
Text input field with label support.

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>

// With error state
<Input className="border-red-500" />
```

### Select
Dropdown selection component.

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox
Boolean selection control.

```typescript
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center space-x-2">
  <Checkbox 
    id="terms" 
    checked={agreed}
    onCheckedChange={setAgreed}
  />
  <Label htmlFor="terms">
    I agree to the terms and conditions
  </Label>
</div>
```

### Textarea
Multi-line text input.

```typescript
import { Textarea } from '@/components/ui/textarea';

<Textarea 
  placeholder="Enter your message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>
```

## Feedback Components

### Alert
Informational message display.

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components using the CLI.
  </AlertDescription>
</Alert>

// Variants
<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

### Toast
Temporary notification messages.

```typescript
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
      duration: 5000,
    });
  };
  
  return <Button onClick={showToast}>Show Toast</Button>;
}
```

### Progress
Visual progress indicator.

```typescript
import { Progress } from '@/components/ui/progress';

<Progress value={66} className="w-60" />

// Indeterminate
<Progress value={null} className="w-60" />
```

## Overlay Components

### Dialog
Modal overlay for focused interactions.

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Continue</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Sheet
Sliding panel overlay.

```typescript
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here.
      </SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

### Popover
Floating content panel.

```typescript
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-medium">Dimensions</h4>
      <p className="text-sm text-muted-foreground">
        Set the dimensions for the layer.
      </p>
    </div>
  </PopoverContent>
</Popover>
```

## Custom Components

### DynamicIsland
Animated notification component inspired by iOS.

```typescript
import { DynamicIsland } from '@/components/ui/dynamic-island';

<DynamicIsland
  state={state}
  onClose={() => setState('collapsed')}
>
  <DynamicIslandContent>
    <p>Notification content</p>
  </DynamicIslandContent>
</DynamicIsland>
```

**States:**
- `collapsed`: Minimal pill shape
- `expanded`: Full content visible
- `transitioning`: Animation between states

### UnifiedChatPanel
Complete chat interface component.

```typescript
import { UnifiedChatPanel } from '@/components/UnifiedChatPanel';

<UnifiedChatPanel
  messages={messages}
  onSendMessage={handleSendMessage}
  recommendations={recommendations}
  isLoading={isLoading}
  widgetName="Customer Support"
/>
```

### Marquee
Smooth scrolling text display.

```typescript
import { Marquee } from '@/components/ui/marquee';

<Marquee speed={50} pauseOnHover>
  <span className="mx-4">Announcement 1</span>
  <span className="mx-4">Announcement 2</span>
  <span className="mx-4">Announcement 3</span>
</Marquee>
```

### AnimatedGroup
Container for staggered entry animations.

```typescript
import { AnimatedGroup } from '@/components/ui/animated-group';

<AnimatedGroup preset="fade-up" stagger={0.1}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</AnimatedGroup>
```

**Presets:**
- `fade`: Simple fade in
- `fade-up`: Fade in from below
- `scale`: Scale up from 0.9
- `blur`: Blur to focus effect

## Chat Components

### ChatWidget
Main chat widget container.

```typescript
import { ChatWidget } from '@/components/ChatWidget';

<ChatWidget
  widgetId="uuid"
  baseUrl="https://api.example.com"
  contentTarget="article, main"
  position="bottom-right"
  isEmbedded={true}
  saveChatMessages={true}
/>
```

### ChatMessage
Individual message display.

```typescript
import { ChatMessage } from '@/components/ChatWidget/components/ChatMessage';

<ChatMessage
  message={{
    id: '1',
    role: 'user',
    content: 'Hello!',
    timestamp: new Date(),
  }}
  isLastMessage={true}
/>
```

### EnhancedChatMessage
Advanced message display with citations and sources.

```typescript
import { EnhancedChatMessage } from '@/components/ChatWidget/components/EnhancedChatMessage';

<EnhancedChatMessage
  message={{
    id: '1',
    role: 'assistant',
    content: 'The answer is found in the documentation[1].',
    timestamp: new Date(),
    metadata: {
      sources: [{
        title: 'API Documentation',
        url: 'https://docs.example.com/api',
        relevance: 0.95
      }]
    }
  }}
  isLastMessage={true}
  onCopyMessage={(content) => handleCopy(content)}
/>
```

**Enhanced Features:**
- Citation parsing and linking
- Source attribution display
- Improved markdown rendering
- Metadata visualization

### MessageInput
Chat input with actions.

```typescript
import { MessageInput } from '@/components/ChatWidget/components/MessageInput';

<MessageInput
  onSendMessage={(message) => console.log(message)}
  onCancel={() => console.log('cancelled')}
  disabled={isLoading}
  placeholder="Type your message..."
/>
```

### RecommendationsList
Horizontal scrollable suggestions.

```typescript
import { RecommendationsList } from '@/components/ChatWidget/components/RecommendationsList';

<RecommendationsList
  recommendations={[
    { id: '1', title: 'How to get started?' },
    { id: '2', title: 'What features are available?' },
  ]}
  onRecommendationClick={(rec) => handleClick(rec)}
/>
```

## Landing Components

### Component Registry
Dynamic component loading system.

```typescript
import { ComponentRegistry } from '@/components/landing-chat/component-registry';

// Register components
ComponentRegistry.register('hero', HeroSection);
ComponentRegistry.register('features', FeaturesSection);

// Render dynamically
const Component = ComponentRegistry.get('hero');
<Component {...props} />
```

### Landing Sections
Pre-built landing page sections.

```typescript
// Hero section
import { ModernHeroSection } from '@/components/landing-chat';

<ModernHeroSection
  title="Welcome to Our Platform"
  subtitle="Build amazing things"
  ctaText="Get Started"
  ctaLink="/signup"
/>

// Features section
import { SaasFeatures } from '@/components/landing-chat';

<SaasFeatures
  features={[
    {
      icon: <IconBolt />,
      title: "Lightning Fast",
      description: "Optimized for speed",
    },
    // ...
  ]}
/>

// Pricing section
import { PricingSection } from '@/components/landing-chat';

<PricingSection
  plans={[
    {
      name: "Starter",
      price: "$9",
      features: ["Feature 1", "Feature 2"],
    },
    // ...
  ]}
/>
```

## Component Composition

### Combining Components
```typescript
// Custom card with form
<Card>
  <CardHeader>
    <CardTitle>Contact Form</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" />
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button>Send Message</Button>
  </CardFooter>
</Card>
```

### With Custom Hooks
```typescript
// Component with business logic
function ChatInterface() {
  const { messages, addMessage } = useChatMessages();
  const { isPlaying, handlePlayPause } = useAudioPlayer();
  
  return (
    <UnifiedChatPanel
      messages={messages}
      onSendMessage={addMessage}
      audioControls={{
        isPlaying,
        onPlayPause: handlePlayPause,
      }}
    />
  );
}
```

---

For styling and theming:
- [Theme Configuration](./THEMING.md)
- [UI Patterns](./PATTERNS.md)
- [Component Guidelines](./README.md)