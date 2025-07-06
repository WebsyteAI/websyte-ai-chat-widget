# Frontend Architecture

## 🎨 Overview

The frontend is a modern React application built with React Router 7, featuring a sophisticated component architecture, custom hooks for business logic, and a powerful widget embedding system.

## 🏗️ Application Structure

### Directory Organization
```
app/
├── components/           # UI components
│   ├── ui/              # shadcn/ui base components
│   ├── ChatWidget/      # Main chat widget system
│   ├── blocks/          # Landing page sections
│   ├── landing-chat/    # Demo components
│   └── Auth/            # Authentication UI
├── routes/              # React Router 7 pages
├── lib/                 # Utilities and helpers
├── hooks/               # Global custom hooks
├── contexts/            # React contexts
├── styles/              # Global styles
└── widget-entry.tsx     # Widget embed entry
```

## 🧩 Component Architecture

### ChatWidget Component System
The chat widget has been refactored from a monolithic 875+ line component into a modular architecture:

```
ChatWidget/
├── ChatWidget.tsx         # Main orchestrator (~400 lines)
├── components/
│   ├── ActionBar.tsx     # Action buttons and controls
│   ├── AudioPlayer.tsx   # Audio playback UI
│   ├── ChatMessage.tsx   # Message rendering
│   ├── ChatPanel.tsx     # Chat interface container
│   ├── MessageInput.tsx  # Input field and controls
│   └── RecommendationsList.tsx  # AI suggestions
├── hooks/
│   ├── useChatMessages.ts       # Message state
│   ├── useAudioPlayer.ts        # Audio controls
│   ├── useContentSummarization.ts # Content modes
│   └── useIframeMessaging.ts    # Cross-frame comm
└── types.ts              # TypeScript definitions
```

### Component Design Principles
1. **Single Responsibility** - Each component has one clear purpose
2. **Composition over Inheritance** - Build complex UIs from simple parts
3. **Props Interface** - Clear TypeScript interfaces for all props
4. **Testability** - Components are pure and easily testable
5. **Reusability** - Generic components for use across features

## 🎭 UI Component Library

### shadcn/ui Integration
Using shadcn/ui with New York style and zinc color scheme:

```typescript
// components.json configuration
{
  "style": "new-york",
  "baseColor": "zinc",
  "cssVariables": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css"
  }
}
```

### Core UI Components
- **Primitives**: Button, Input, Label, Checkbox, Switch
- **Layout**: Card, Separator, ScrollArea
- **Feedback**: Alert, Badge, Toast, Progress
- **Navigation**: Tabs, NavigationMenu
- **Overlays**: Dialog, Sheet, Popover, Dropdown
- **Data Display**: Table, Avatar, Skeleton
- **Form Controls**: Form, Select, Textarea, RadioGroup

### Custom Components
- **DynamicIsland**: Animated notification component
- **UnifiedChatPanel**: Consolidated chat interface
- **Marquee**: Smooth scrolling text
- **ScriptCopyBtn**: Copy-to-clipboard for embed codes
- **AnimatedGroup**: Stagger animations for lists

## 🪝 Custom Hooks Architecture

### Business Logic Hooks

#### useChatMessages
Manages chat message state and operations:
```typescript
interface UseChatMessagesReturn {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  clearMessages: () => void;
}
```

#### useAudioPlayer
Controls audio playback simulation:
```typescript
interface UseAudioPlayerReturn {
  isPlaying: boolean;
  audioProgress: number;
  playbackSpeed: number;
  elapsedTime: number;
  totalTime: number;
  handlePlayPause: () => void;
  handleSpeedChange: () => void;
  formatTime: (seconds: number) => string;
}
```

#### useContentSummarization
Manages content modes and DOM manipulation:
```typescript
interface UseContentSummarizationReturn {
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  handleContentModeChange: (mode: ContentMode) => void;
  loadSummaries: (preloaded?: Summaries) => Promise<void>;
}
```

#### useIframeMessaging
Handles cross-frame communication:
```typescript
interface UseIframeMessagingReturn {
  sendMessage: (message: any, targetOrigin?: string) => void;
  onMessage: (handler: (event: MessageEvent) => void) => void;
  isInIframe: boolean;
}
```

## 🎯 State Management

### Context Providers

#### AuthContext
Manages authentication state across the app:
```typescript
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}
```

#### DemoDataContext
Provides demo data for landing pages:
```typescript
interface DemoDataContextValue {
  demoData: DemoData;
  updateDemoData: (updates: Partial<DemoData>) => void;
}
```

### Local State Management
- **Component State**: useState for UI state
- **Derived State**: useMemo for computed values
- **Side Effects**: useEffect for external interactions
- **Refs**: useRef for DOM access and mutable values

## 🚀 React Router 7 Architecture

### Route Configuration
Explicit route definitions in `app/routes.ts`:
```typescript
export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard._index.tsx"),
    route("analytics", "routes/dashboard.analytics.tsx"),
    route("settings", "routes/dashboard.settings.tsx"),
    route("widgets", "routes/dashboard.widgets._index.tsx"),
    route("widgets/new", "routes/dashboard.widgets.new.tsx"),
    route("widgets/:id/edit", "routes/dashboard.widgets.$id.edit.tsx"),
  ]),
  route("/test", "routes/test.tsx"),
  route("/public/:id", "routes/public.$id.tsx"),
] satisfies RouteConfig;
```

### Layout System
- **Root Layout**: App shell with providers
- **Dashboard Layout**: Nested layout for authenticated pages
- **Public Layout**: Minimal layout for public widgets
- **Error Boundaries**: Per-route error handling

## 🎨 Styling Architecture

### Tailwind CSS v4
Using the latest Tailwind with CSS variables:
```css
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  --color-primary: 240 5.9% 10%;
  --color-primary-foreground: 0 0% 98%;
  /* ... more theme variables */
}
```

### Component Styling Patterns
1. **Utility-First**: Tailwind classes for styling
2. **CSS Variables**: Theme customization
3. **Component Variants**: cva for variant styles
4. **Responsive Design**: Mobile-first approach
5. **Dark Mode**: CSS variable color switching

## 🔌 Widget Embedding System

### Widget Entry Point
`widget-entry.tsx` handles script initialization:
```typescript
// Parse script attributes
const script = document.currentScript as HTMLScriptElement;
const widgetId = script?.getAttribute('data-widget-id');

// Create container and render
const container = document.createElement('div');
container.id = 'websyte-ai-chat-widget';
document.body.appendChild(container);

// Render widget with configuration
ReactDOM.createRoot(container).render(
  <ChatWidget
    widgetId={widgetId}
    baseUrl={window.location.origin}
    isEmbedded={true}
  />
);
```

### Shadow DOM Isolation
Complete style isolation for embedded widgets:
```typescript
const shadowRoot = container.attachShadow({ mode: 'open' });
const styleSheet = document.createElement('style');
styleSheet.textContent = compiledStyles;
shadowRoot.appendChild(styleSheet);
```

### iframe Communication
PostMessage API for secure cross-origin communication:
```typescript
// Send message to parent
window.parent.postMessage({
  type: 'WIDGET_READY',
  widgetId: props.widgetId
}, '*');

// Listen for parent messages
window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_CONFIG') {
    updateWidgetConfig(event.data.config);
  }
});
```

## 📱 Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
};
```

### Mobile Optimization
- **Touch Gestures**: Swipe to close/minimize
- **Viewport Management**: Proper mobile viewport
- **Adaptive Layouts**: Stack on mobile, side-by-side on desktop
- **Performance**: Reduced animations on low-end devices

## ⚡ Performance Optimizations

### Code Splitting
Dynamic imports for route-based splitting:
```typescript
const WidgetEditor = lazy(() => import('./components/WidgetEditor'));
```

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Minification**: Terser for production builds
- **Compression**: Brotli compression
- **Asset Optimization**: Image and font loading

### Runtime Performance
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive operations
- **Virtual Scrolling**: For long message lists
- **Debouncing**: For search and input handlers

## 🧪 Testing Strategy

### Component Testing
```typescript
describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    render(<ChatMessage message={userMessage} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
describe('useChatMessages', () => {
  it('adds message with generated ID', () => {
    const { result } = renderHook(() => useChatMessages());
    const message = result.current.addMessage({ 
      role: 'user', 
      content: 'Test' 
    });
    expect(message.id).toBeDefined();
  });
});
```

### Integration Testing
- **User Flows**: Complete user journeys
- **API Mocking**: MSW for API responses
- **Browser Testing**: Playwright for E2E

## 🔒 Security Considerations

### XSS Prevention
- **Content Sanitization**: DOMPurify for user content
- **CSP Headers**: Strict content security policy
- **Trusted Types**: Browser API for DOM manipulation

### Authentication Security
- **Secure Cookies**: httpOnly, sameSite strict
- **CSRF Protection**: Token validation
- **Session Management**: Secure session handling

---

For related documentation:
- [Backend Architecture](./BACKEND.md)
- [Widget Embedding Guide](./WIDGET-EMBED.md)
- [Performance Optimization](./PERFORMANCE.md)