import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';
import './app.css';

// Widget namespace
declare global {
  interface Window {
    WebsyteChat: {
      initialized?: boolean;
      config?: {
        apiEndpoint?: string;
        position?: string;
        theme?: string;
        contentTarget?: string;
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
  
  // Get script tag attributes
  function getScriptConfig() {
    const scriptTag = document.querySelector('script[src*="widget.js"]');
    const scriptConfig: any = {};
    
    if (scriptTag) {
      // Read data attributes from script tag
      const contentTarget = scriptTag.getAttribute('data-content-target');
      if (contentTarget) scriptConfig.contentTarget = contentTarget;
      
      const apiEndpoint = scriptTag.getAttribute('data-api-endpoint');
      if (apiEndpoint) scriptConfig.apiEndpoint = apiEndpoint;
      
      const baseUrl = scriptTag.getAttribute('data-base-url');
      if (baseUrl) scriptConfig.baseUrl = baseUrl;
      
      const position = scriptTag.getAttribute('data-position');
      if (position) scriptConfig.position = position;
      
      const theme = scriptTag.getAttribute('data-theme');
      if (theme) scriptConfig.theme = theme;
    }
    
    return scriptConfig;
  }
  
  // Default configuration
  const defaultConfig = {
    apiEndpoint: '/api/chat',
    baseUrl: '',
    position: 'bottom-center',
    theme: 'default',
    contentTarget: 'article, main, .content, #content'
  };
  
  // Merge configs: defaults < window config < script attributes
  const scriptConfig = getScriptConfig();
  const config = Object.assign({}, defaultConfig, window.WebsyteChat.config || {}, scriptConfig);
  
  let widgetRoot: ReactDOM.Root | null = null;
  let shadowRoot: ShadowRoot | null = null;
  let isOpen = false;
  
  // Create widget container with Shadow DOM
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
    
    // Create shadow root for style isolation
    shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Inject CSS into shadow root
    if (typeof (window as any).WebsyteChatCSS === 'string') {
      const style = document.createElement('style');
      // Comprehensive CSS reset and Tailwind utilities for Shadow DOM
      style.textContent = `
        /* Reset and base styles */
        :host, * {
          box-sizing: border-box;
        }
        
        /* Initialize all CSS custom properties for Tailwind */
        *, *::before, *::after {
          --tw-translate-x: 0;
          --tw-translate-y: 0;
          --tw-translate-z: 0;
          --tw-rotate-x: 0deg;
          --tw-rotate-y: 0deg;
          --tw-rotate-z: 0deg;
          --tw-skew-x: 0deg;
          --tw-skew-y: 0deg;
          --tw-border-style: solid;
          --tw-space-x-reverse: 0;
          --tw-space-y-reverse: 0;
          --tw-shadow: 0 0 #0000;
          --tw-shadow-color: rgba(0, 0, 0, 0.1);
          --tw-shadow-alpha: 100%;
          --tw-inset-shadow: 0 0 #0000;
          --tw-inset-shadow-color: rgba(0, 0, 0, 0.1);
          --tw-inset-shadow-alpha: 100%;
          --tw-ring-color: rgb(59 130 246 / 0.5);
          --tw-ring-shadow: 0 0 #0000;
          --tw-inset-ring-color: rgb(59 130 246 / 0.5);
          --tw-inset-ring-shadow: 0 0 #0000;
          --tw-ring-inset: ;
          --tw-ring-offset-width: 0px;
          --tw-ring-offset-color: #fff;
          --tw-ring-offset-shadow: 0 0 #0000;
          --tw-blur: blur(0px);
          --tw-brightness: brightness(1);
          --tw-contrast: contrast(1);
          --tw-grayscale: grayscale(0);
          --tw-hue-rotate: hue-rotate(0deg);
          --tw-invert: invert(0);
          --tw-opacity: opacity(1);
          --tw-saturate: saturate(1);
          --tw-sepia: sepia(0);
          --tw-backdrop-blur: blur(0px);
          --tw-backdrop-brightness: brightness(1);
          --tw-backdrop-contrast: contrast(1);
          --tw-backdrop-grayscale: grayscale(0);
          --tw-backdrop-hue-rotate: hue-rotate(0deg);
          --tw-backdrop-invert: invert(0);
          --tw-backdrop-opacity: opacity(1);
          --tw-backdrop-saturate: saturate(1);
          --tw-backdrop-sepia: sepia(0);
          --tw-drop-shadow: ;
          --tw-drop-shadow-color: rgba(0, 0, 0, 0.1);
          --tw-drop-shadow-alpha: 100%;
          --tw-drop-shadow-size: ;
          --tw-gradient-position: ;
          --tw-gradient-from: transparent;
          --tw-gradient-via: transparent;
          --tw-gradient-to: transparent;
          --tw-gradient-stops: ;
          --tw-gradient-via-stops: ;
          --tw-gradient-from-position: 0%;
          --tw-gradient-via-position: 50%;
          --tw-gradient-to-position: 100%;
          --tw-leading: 1.5;
          --tw-font-weight: 400;
          --tw-duration: 150ms;
          --tw-ease: cubic-bezier(0.4, 0, 0.2, 1);
          --tw-outline-style: solid;
        }
        
        /* Critical utility overrides for problematic classes */
        .backdrop-blur {
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }
        
        .transform {
          transform: translateX(var(--tw-translate-x)) translateY(var(--tw-translate-y)) !important;
        }
        
        .-translate-x-1\\/2 {
          --tw-translate-x: -50% !important;
          transform: translateX(-50%) !important;
        }
        
        .translate-x-full {
          --tw-translate-x: 100% !important;
          transform: translateX(100%) !important;
        }
        
        .translate-x-0 {
          --tw-translate-x: 0px !important;
          transform: translateX(0px) !important;
        }
        
        .bg-white\\/20 {
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .left-1\\/2 {
          left: 50% !important;
        }
        
        .fixed {
          position: fixed !important;
        }
        
        .bottom-4 {
          bottom: 1rem !important;
        }
        
        .z-50 {
          z-index: 50 !important;
        }
        
        /* Comprehensive centering fix for new action bar classes */
        .fixed.bottom-4.left-1\\/2.-translate-x-1\\/2 {
          position: fixed !important;
          bottom: 1rem !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          --tw-translate-x: -50% !important;
        }
        
        
        ${(window as any).WebsyteChatCSS}
      `;
      shadowRoot.appendChild(style);
    }
    
    // Create the actual widget container inside shadow root
    const widgetContainer = document.createElement('div');
    widgetContainer.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    shadowRoot.appendChild(widgetContainer);
    
    document.body.appendChild(container);
    return widgetContainer;
  }
  
  // Initialize widget
  function initWidget() {
    const container = createWidgetContainer();
    widgetRoot = ReactDOM.createRoot(container);
    
    // Render the ChatWidget component
    widgetRoot.render(
      React.createElement(ChatWidget, {
        apiEndpoint: config.apiEndpoint,
        baseUrl: config.baseUrl,
        contentTarget: config.contentTarget
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