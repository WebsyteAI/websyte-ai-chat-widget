import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import { UmamiTracking } from "./lib/umami-tracker";
import { AuthProvider } from "./lib/auth/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary as AppErrorBoundary } from "./components/ErrorBoundary";
import { createLogger, setupGlobalErrorHandling, setupPerformanceLogging } from "./lib/logger";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  useEffect(() => {
    // Setup global error handling and performance logging
    const appLogger = createLogger('App');
    setupGlobalErrorHandling(appLogger);
    setupPerformanceLogging(appLogger);
    
    appLogger.info('Application initialized', { path: location.pathname });
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script
          defer
          src={UmamiTracking.SCRIPT_URL}
          data-website-id={UmamiTracking.WEBSITE_ID}
        ></script>
      </head>
      <body>
        <AppErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </AppErrorBoundary>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
