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
        targetElement?: string;
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
      
      const targetElement = scriptTag.getAttribute('data-target-element');
      if (targetElement) scriptConfig.targetElement = targetElement;
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
    advertiserName: 'Nativo',
    advertiserLogo: '',
    targetElement: ''
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
    
    // Determine where to inject the widget
    let targetParent = document.body;
    let isTargetedInjection = false;
    
    if (config.targetElement) {
      const targetEl = document.querySelector(config.targetElement);
      if (targetEl) {
        targetParent = targetEl as HTMLElement;
        isTargetedInjection = true;
      } else {
        console.error(`WebsyteChat: Target element "${config.targetElement}" not found. Widget will not be initialized.`);
        return null;
      }
    }
    
    // Set positioning based on injection target
    if (isTargetedInjection) {
      // For targeted injection, use relative positioning
      container.style.cssText = `
        position: relative;
        z-index: 999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        justify-content: center;
      `;
    } else {
      // For body injection, use fixed positioning (original behavior)
      container.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
    }
    
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
    
    targetParent.appendChild(container);
    return { container: widgetContainer, isTargetedInjection };
  }
  
  // Initialize widget
  function initWidget() {
    const result = createWidgetContainer();
    if (!result) {
      // Target element not found, do not initialize widget
      return;
    }
    
    const { container, isTargetedInjection } = result;
    widgetRoot = ReactDOM.createRoot(container);
    
    // Render the ChatWidget component
    widgetRoot.render(
      React.createElement(ChatWidget, {
        apiEndpoint: config.apiEndpoint,
        baseUrl: config.baseUrl,
        contentTarget: config.contentTarget,
        advertiserName: config.advertiserName,
        advertiserLogo: config.advertiserLogo,
        isTargetedInjection: isTargetedInjection
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