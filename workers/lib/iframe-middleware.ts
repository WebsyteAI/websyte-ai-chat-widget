import type { MiddlewareHandler } from "hono";

/**
 * Middleware to handle iframe-specific security headers
 * - Allows iframe embedding ONLY for /share/w/{widgetId} routes
 * - The widget must be public (checked by the route handler)
 * - Denies iframe embedding for all other routes
 * - Sets appropriate Content-Security-Policy headers
 */
export const iframeMiddleware: MiddlewareHandler = async (c, next) => {
  // Check if this is a share widget route
  const url = new URL(c.req.url);
  const isShareWidgetRoute = url.pathname.match(/^\/share\/w\/[^\/]+$/);
  const isAllowedEmbed = !!isShareWidgetRoute;

  // Continue processing the request
  await next();

  // After the response is generated, modify headers
  if (isAllowedEmbed) {
    // Allow iframe embedding for share widget routes
    // Remove X-Frame-Options to allow embedding from any origin
    c.res.headers.delete("X-Frame-Options");

    // Set permissive CSP for embedded widgets
    // Allow the widget to be embedded in any frame
    const existingCSP = c.res.headers.get("Content-Security-Policy");
    if (existingCSP) {
      // If CSP exists, update frame-ancestors directive
      const updatedCSP = existingCSP.replace(
        /frame-ancestors[^;]*/,
        "frame-ancestors *"
      );

      // If frame-ancestors wasn't in the original CSP, add it
      if (!existingCSP.includes("frame-ancestors")) {
        c.res.headers.set(
          "Content-Security-Policy",
          `${existingCSP}; frame-ancestors *`
        );
      } else {
        c.res.headers.set("Content-Security-Policy", updatedCSP);
      }
    } else {
      // Set a basic CSP that allows embedding
      c.res.headers.set(
        "Content-Security-Policy",
        "frame-ancestors *; default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;"
      );
    }
  } else {
    // Deny iframe embedding for all other routes
    c.res.headers.set("X-Frame-Options", "DENY");

    // Set restrictive CSP for non-embed routes
    const existingCSP = c.res.headers.get("Content-Security-Policy");
    if (existingCSP) {
      // Update frame-ancestors to 'none'
      const updatedCSP = existingCSP.replace(
        /frame-ancestors[^;]*/,
        "frame-ancestors 'none'"
      );

      // If frame-ancestors wasn't in the original CSP, add it
      if (!existingCSP.includes("frame-ancestors")) {
        c.res.headers.set(
          "Content-Security-Policy",
          `${existingCSP}; frame-ancestors 'none'`
        );
      } else {
        c.res.headers.set("Content-Security-Policy", updatedCSP);
      }
    } else {
      // Set a secure CSP that prevents embedding
      c.res.headers.set(
        "Content-Security-Policy",
        "frame-ancestors 'none'; default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;"
      );
    }
  }

  // Add additional security headers for embedded content
  if (isAllowedEmbed) {
    // Allow the embedded widget to access certain browser features
    c.res.headers.set(
      "Permissions-Policy",
      "accelerometer=*, camera=*, geolocation=*, gyroscope=*, magnetometer=*, microphone=*, payment=*, usb=*"
    );
  } else {
    // Restrict browser features for non-embedded content
    c.res.headers.set(
      "Permissions-Policy",
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
    );
  }
};
