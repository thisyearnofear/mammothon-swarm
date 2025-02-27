import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

// Define the rate limit handler type
type RateLimitHandler = <T>(
  retryFn: () => Promise<T>,
  maxRetries?: number,
  initialDelay?: number
) => Promise<T>;

// Extend Window interface
declare global {
  interface Window {
    handleApiRateLimit?: RateLimitHandler;
    agentsInitialized?: boolean;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log("_app.tsx: App mounted");

    // Initialize rate limit handler
    if (typeof window !== "undefined") {
      const handler: RateLimitHandler = async function <T>(
        retryFn: () => Promise<T>,
        maxRetries = 3,
        initialDelay = 1000
      ): Promise<T> {
        let retryCount = 0;
        let delay = initialDelay;

        while (retryCount < maxRetries) {
          try {
            const response = await retryFn();
            // Check if response is a Response object and handle rate limiting
            if (!(response instanceof Response) || response.status !== 429) {
              return response;
            }
            console.log(
              `Rate limited, attempt ${retryCount + 1} of ${maxRetries}`
            );
          } catch (error) {
            if (error instanceof Error) {
              console.error("Error in retry attempt:", error.message);
            } else {
              console.error("Error in retry attempt:", error);
            }
          }

          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }

        throw new Error("Max retries exceeded");
      };

      window.handleApiRateLimit = handler;
      console.log("Rate limit handler initialized");
    }

    return () => {
      console.log("_app.tsx: App unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("_app.tsx: Checking agent initialization");
    if (typeof window !== "undefined") {
      console.log("_app.tsx: Window object exists");
      if (!("agentsInitialized" in window)) {
        console.log("_app.tsx: Agents are NOT initialized!");
        console.log("_app.tsx: DOM elements for agents:");
        console.log("vocafi-button:", document.getElementById("vocafi-button"));
        console.log("wooly-button:", document.getElementById("wooly-button"));
        console.log(
          "clarity-button:",
          document.getElementById("clarity-button")
        );
        console.log("hwc-button:", document.getElementById("hwc-button"));
      }
    }
  }, []);

  return <Component {...pageProps} />;
}
