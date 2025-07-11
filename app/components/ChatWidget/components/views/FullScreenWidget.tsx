import { ReactNode } from 'react';

interface FullScreenWidgetProps {
  children: ReactNode;
  currentView: 'main' | 'chat';
  isTransitioning: boolean;
  hasRendered: boolean;
}

export function FullScreenWidget({ 
  children, 
  currentView, 
  isTransitioning, 
  hasRendered 
}: FullScreenWidgetProps) {
  return (
    <div className={`
      fixed bottom-4 right-4 w-96 h-[600px] 
      bg-white rounded-2xl shadow-2xl 
      flex flex-col overflow-hidden
      transition-all duration-300 ease-in-out
      ${hasRendered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      ${currentView === 'chat' ? 'w-96' : 'w-80'}
      ${isTransitioning ? 'scale-95 opacity-90' : ''}
    `}>
      {children}
    </div>
  );
}