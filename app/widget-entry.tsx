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
        advertiserName?: string;
        advertiserLogo?: string;
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
      
      const advertiserName = scriptTag.getAttribute('data-advertiser-name');
      if (advertiserName) scriptConfig.advertiserName = advertiserName;
      
      const advertiserLogo = scriptTag.getAttribute('data-advertiser-logo');
      if (advertiserLogo) scriptConfig.advertiserLogo = advertiserLogo;
    }
    
    return scriptConfig;
  }
  
  // Default configuration
  const defaultConfig = {
    apiEndpoint: '/api/chat',
    baseUrl: '',
    position: 'bottom-center',
    theme: 'default',
    contentTarget: 'article, main, .content, #content',
    advertiserName: 'Advertiser',
    advertiserLogo: ''
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
    
    // Inject Tailwind CSS into shadow root
    if (typeof (window as any).WebsyteChatCSS === 'string') {
      const style = document.createElement('style');
      style.textContent = (window as any).WebsyteChatCSS;
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
        contentTarget: config.contentTarget,
        advertiserName: config.advertiserName,
        advertiserLogo: config.advertiserLogo
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