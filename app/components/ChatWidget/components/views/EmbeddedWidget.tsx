import { ReactNode, RefObject } from 'react';

interface EmbeddedWidgetProps {
  children: ReactNode;
  currentView: 'main' | 'chat';
  isTransitioning: boolean;
  hasRendered: boolean;
  widgetContainerRef: RefObject<HTMLDivElement>;
}

export function EmbeddedWidget({ 
  children, 
  currentView, 
  isTransitioning, 
  hasRendered,
  widgetContainerRef
}: EmbeddedWidgetProps) {
  return (
    <div 
      ref={widgetContainerRef}
      className={`
        relative w-full h-full 
        bg-white rounded-lg shadow-lg 
        flex flex-col overflow-hidden
        transition-all duration-300 ease-in-out
        ${hasRendered ? 'opacity-100' : 'opacity-0'}
        ${isTransitioning ? 'opacity-90' : ''}
      `}
    >
      {children}
    </div>
  );
}