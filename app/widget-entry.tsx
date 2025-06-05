import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// Widget namespace
declare global {
  interface Window {
    WebsyteChat: {
      initialized?: boolean;
      config?: {
        apiEndpoint?: string;
        position?: string;
        theme?: string;
      };
      open?: () => void;
      close?: () => void;
      toggle?: () => void;
    };
  }
}

(function() {
  'use strict';
  
  // Prevent multiple initializations
  if (window.WebsyteChat && window.WebsyteChat.initialized) {
    return;
  }
  
  // Initialize namespace
  window.WebsyteChat = window.WebsyteChat || {};
  window.WebsyteChat.initialized = true;
  
  // Default configuration
  const defaultConfig = {
    apiEndpoint: '/api/chat',
    position: 'bottom-right',
    theme: 'default'
  };
  
  // Merge with user config
  const config = Object.assign({}, defaultConfig, window.WebsyteChat.config || {});
  
  let widgetRoot: ReactDOM.Root | null = null;
  let isOpen = false;
  
  // Create widget container
  function createWidgetContainer() {
    const container = document.createElement('div');
    container.id = 'websyte-chat-widget-root';
    container.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    document.body.appendChild(container);
    return container;
  }
  
  // Initialize widget
  function initWidget() {
    const container = createWidgetContainer();
    widgetRoot = ReactDOM.createRoot(container);
    
    // Render the ChatWidget component
    widgetRoot.render(
      React.createElement(ChatWidget, {
        apiEndpoint: config.apiEndpoint
      })
    );
  }
  
  // Public API - these would be empty for now since ChatWidget manages its own state
  window.WebsyteChat.open = function() {
    console.log('WebsyteChat.open() called');
  };
  
  window.WebsyteChat.close = function() {
    console.log('WebsyteChat.close() called');
  };
  
  window.WebsyteChat.toggle = function() {
    console.log('WebsyteChat.toggle() called');
  };
  
  // Initialize when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWidget);
    } else {
      initWidget();
    }
  }
  
  init();
})();