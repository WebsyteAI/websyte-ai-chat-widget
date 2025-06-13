interface UmamiPayload {
  hostname: string;
  language: string;
  referrer: string;
  screen: string;
  title: string;
  url: string;
  website: string;
  name: string;
  data?: Record<string, any>;
}

interface UmamiRequest {
  payload: UmamiPayload;
  type: 'event';
}

export class UmamiTracking {
  static readonly WEBSITE_ID = 'c2b11268-3f5d-4026-abe5-4d98c8b32641';
  static readonly SCRIPT_URL = 'https://cloud.umami.is/script.js';
  private static readonly API_ENDPOINT = 'https://cloud.umami.is/api/send';

  private static createPayload(eventName: string, eventData?: Record<string, any>): UmamiRequest {
    if (typeof window === 'undefined') {
      throw new Error('UmamiTracking can only be used in browser environment');
    }

    return {
      payload: {
        hostname: window.location.hostname,
        language: navigator.language,
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        title: document.title,
        url: window.location.pathname,
        website: this.WEBSITE_ID,
        name: eventName,
        data: eventData
      },
      type: 'event'
    };
  }

  static async track(eventName: string, eventData?: Record<string, any>) {
    if (typeof window === 'undefined') {
      console.warn('Umami tracking skipped: not in browser environment');
      return;
    }

    try {
      const payload = this.createPayload(eventName, eventData);
      
      await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': navigator.userAgent
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Umami tracking error:', error);
    }
  }

  static trackWidgetLoad(url: string) {
    this.track('widget-loaded', { url });
  }

  static trackButtonClick(buttonName: string, additionalData?: Record<string, any>) {
    this.track('button-click', { button: buttonName, ...additionalData });
  }

  static trackChatMessage(messageLength: number, messageType: 'user' | 'recommendation') {
    this.track('chat-message-sent', { 
      messageLength, 
      messageType,
      url: window.location.href 
    });
  }

  static trackLandingPageAction(action: string, additionalData?: Record<string, any>) {
    this.track('landing-page-action', { action, ...additionalData });
  }
}
