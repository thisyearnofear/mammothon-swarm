import * as React from "react";
import * as ReactDOM from "react-dom";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      readonly NEXT_PUBLIC_API_URL: string;
    }
  }
}

export {};
