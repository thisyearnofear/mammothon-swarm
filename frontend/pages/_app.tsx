import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log("_app.tsx: App mounted");

    // Initialize rate limit handler on window object
    if (typeof window !== "undefined") {
      // @ts-expect-error - We know this property doesn't exist yet
      window.handleApiRateLimit = async (
        retryFn: () => Promise<Response>,
        maxRetries = 3,
        initialDelay = 1000
      ): Promise<Response> => {
        let retryCount = 0;
        let delay = initialDelay;

        while (retryCount < maxRetries) {
          try {
            const response = await retryFn();
            if (response.status !== 429) {
              return response;
            }
            console.log(
              `Rate limited, attempt ${retryCount + 1} of ${maxRetries}`
            );
          } catch (error) {
            console.error("Error in retry attempt:", error);
          }

          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }

        throw new Error("Max retries exceeded");
      };
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
      // @ts-expect-error - We know this property doesn't exist yet
      if (!window.agentsInitialized) {
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
