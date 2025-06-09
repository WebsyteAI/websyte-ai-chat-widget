// Types
export * from './types';

// Hooks
export { useChatMessages } from './hooks/useChatMessages';
export { useChatAPI } from './hooks/useChatAPI';
export { useAudioPlayer } from './hooks/useAudioPlayer';
export { useRecommendations } from './hooks/useRecommendations';
export { useViewManager } from './hooks/useViewManager';
export { useDropdownManager } from './hooks/useDropdownManager';
export { useContentSummarization } from './hooks/useContentSummarization';
export { useTargetElementManager } from './hooks/useTargetElementManager';

// Components
export { ChatMessage } from './components/ChatMessage';
export { ChatPanel } from './components/ChatPanel';
export { MessageInput } from './components/MessageInput';
export { ActionBar } from './components/ActionBar';
export { RecommendationsList } from './components/RecommendationsList';
export { ContentModeSelector } from './components/ContentModeSelector';
export { AudioPlayer } from './components/AudioPlayer';