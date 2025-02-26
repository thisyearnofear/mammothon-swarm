import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { handleApiRateLimit } from "../lib/rateLimit";

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log("_app.tsx: App mounted");

    // Add a check for agent initialization after a delay
    const checkAgentInitialization = () => {
      console.log("_app.tsx: Checking agent initialization");
      if (typeof window !== "undefined") {
        console.log("_app.tsx: Window object exists");
        // @ts-ignore
        if (window.agentsInitialized) {
          console.log("_app.tsx: Agents are initialized!");
        } else {
          console.log("_app.tsx: Agents are NOT initialized!");
          console.log("_app.tsx: DOM elements for agents:");
          console.log(
            "vocafi-button:",
            document.getElementById("vocafi-button")
          );
          console.log("wooly-button:", document.getElementById("wooly-button"));
          console.log(
            "clarity-button:",
            document.getElementById("clarity-button")
          );
          console.log("hwc-button:", document.getElementById("hwc-button"));
        }
      }
    };

    // Check after 3 seconds to allow time for initialization
    const timer = setTimeout(checkAgentInitialization, 3000);

    // Make rate limit handler available globally
    if (typeof window !== "undefined") {
      (window as any).handleApiRateLimit = handleApiRateLimit;
      console.log("Rate limit handler initialized");
    }

    return () => {
      clearTimeout(timer);
      console.log("_app.tsx: App unmounted");
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
