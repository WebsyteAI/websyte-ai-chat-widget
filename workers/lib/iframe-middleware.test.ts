import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { iframeMiddleware } from './iframe-middleware';

describe('iframeMiddleware', () => {
  const createApp = () => {
    const app = new Hono();
    app.use('*', iframeMiddleware);
    app.get('*', (c) => c.text('OK'));
    return app;
  };

  describe('allowed routes', () => {
    it('should allow iframe embedding for /share/w/{widgetId} routes', async () => {
      const app = createApp();
      const res = await app.request('/share/w/widget123');
      
      expect(res.headers.get('X-Frame-Options')).toBeNull();
      
      const csp = res.headers.get('Content-Security-Policy');
      expect(csp).toContain('frame-ancestors *');
      
      const permissions = res.headers.get('Permissions-Policy');
      expect(permissions).toContain('accelerometer=*');
    });

    it('should handle different widget ID formats', async () => {
      const app = createApp();
      const testCases = [
        '/share/w/123',
        '/share/w/abc-def-123',
        '/share/w/widget_test',
        '/share/w/UPPERCASE123',
      ];

      for (const path of testCases) {
        const res = await app.request(path);
        expect(res.headers.get('X-Frame-Options')).toBeNull();
        const csp = res.headers.get('Content-Security-Policy');
        expect(csp).toContain('frame-ancestors *');
      }
    });
  });

  describe('denied routes', () => {
    it('should deny iframe embedding for non-share routes', async () => {
      const app = createApp();
      const testCases = [
        '/',
        '/api/widgets',
        '/dashboard',
        '/login',
        '/test',
        '/share/other',
      ];

      for (const path of testCases) {
        const res = await app.request(path);
        expect(res.headers.get('X-Frame-Options')).toBe('DENY');
        
        const csp = res.headers.get('Content-Security-Policy');
        expect(csp).toContain("frame-ancestors 'none'");
        
        const permissions = res.headers.get('Permissions-Policy');
        expect(permissions).toContain('accelerometer=()');
      }
    });

    it('should deny iframe embedding for share routes with extra path segments', async () => {
      const app = createApp();
      const testCases = [
        '/share/w/widget123/extra',
        '/share/w/widget123/settings',
        '/share/w/',
        '/share/w',
      ];

      for (const path of testCases) {
        const res = await app.request(path);
        expect(res.headers.get('X-Frame-Options')).toBe('DENY');
        
        const csp = res.headers.get('Content-Security-Policy');
        expect(csp).toContain("frame-ancestors 'none'");
      }
    });
  });

  describe('CSP handling', () => {
    it('should update existing CSP with frame-ancestors', async () => {
      const app = new Hono();
      app.use('*', iframeMiddleware);
      app.get('*', (c) => {
        c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'");
        return c.text('OK');
      });

      const res = await app.request('/share/w/widget123');
      const csp = res.headers.get('Content-Security-Policy');
      
      expect(csp).toContain('frame-ancestors *');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
    });

    it('should replace existing frame-ancestors directive', async () => {
      const app = new Hono();
      app.use('*', iframeMiddleware);
      app.get('*', (c) => {
        c.header('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
        return c.text('OK');
      });

      const res = await app.request('/share/w/widget123');
      const csp = res.headers.get('Content-Security-Policy');
      
      expect(csp).toContain('frame-ancestors *');
      expect(csp).not.toContain("frame-ancestors 'none'");
    });
  });
});