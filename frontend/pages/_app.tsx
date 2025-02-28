import React, { useState } from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import logger from "../src/lib/logger";

// Define the rate limit handler type
type RateLimitHandler = <T>(
  retryFn: () => Promise<T>,
  maxRetries?: number,
  initialDelay?: number
) => Promise<T>;

// Extend Window interface
declare global {
  interface Window {
    handleApiRateLimit?: (<T>(fn: () => Promise<T>) => Promise<T>) | undefined;
    agentsInitialized?: boolean;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setPageLoading(true);
    };
    const handleComplete = () => {
      setPageLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  useEffect(() => {
    logger.info("_app.tsx: App mounted");

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
            logger.warn(
              `Rate limited, attempt ${retryCount + 1} of ${maxRetries}`
            );
          } catch (error) {
            if (error instanceof Error) {
              logger.error("Error in retry attempt:", error.message);
            } else {
              logger.error("Error in retry attempt:", error);
            }
          }

          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }

        throw new Error("Max retries exceeded");
      };

      window.handleApiRateLimit = handler;
      logger.info("Rate limit handler initialized");
    }

    return () => {
      logger.info("_app.tsx: App unmounted");
    };
  }, []);

  useEffect(() => {
    logger.info("_app.tsx: Checking agent initialization");
    if (typeof window !== "undefined") {
      logger.info("_app.tsx: Window object exists");

      // Check if agents are already initialized
      if (window.agentsInitialized) {
        logger.info("_app.tsx: Agents are already initialized!");
      } else {
        logger.info("_app.tsx: Agents are NOT initialized!");

        // Log DOM elements for debugging
        logger.debug("_app.tsx: DOM elements for agents:");
        logger.debug(
          "vocafi-button:",
          document.getElementById("vocafi-button")
        );
        logger.debug("wooly-button:", document.getElementById("wooly-button"));
        logger.debug(
          "clarity-button:",
          document.getElementById("clarity-button")
        );
        logger.debug("hwc-button:", document.getElementById("hwc-button"));
      }

      // Set a flag to indicate that the app is ready for agent initialization
      window.agentsInitialized = true;

      // Initialize the rate limit handler if not already done
      if (!window.handleApiRateLimit) {
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
              logger.warn(
                `Rate limited, attempt ${retryCount + 1} of ${maxRetries}`
              );
            } catch (error) {
              if (error instanceof Error) {
                logger.error("Error in retry attempt:", error.message);
              } else {
                logger.error("Error in retry attempt:", error);
              }
            }

            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }

          throw new Error("Max retries exceeded");
        };

        window.handleApiRateLimit = handler;
        logger.info("Rate limit handler initialized");
      }
    }
  }, []);

  return (
    <div className={`page-transition ${pageLoading ? "page-loading" : ""}`}>
      <Component {...pageProps} />
    </div>
  );
}
