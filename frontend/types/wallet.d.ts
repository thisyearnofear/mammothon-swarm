declare interface Window {
  ethereum?: {
    // Basic provider methods
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    send: (method: string, params?: Array<any>) => Promise<any>;
    sendAsync?: (
      request: any,
      callback: (error: any, response: any) => void
    ) => void;

    // Events
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (
      event: string,
      callback: (...args: unknown[]) => void
    ) => void;

    // Provider info
    isMetaMask?: boolean;
    isStatus?: boolean;
    host?: string;
    path?: string;

    // Methods needed for BrowserProvider
    enable?: () => Promise<string[]>;
    experimentalSuggestChain?: (chainInfo: any) => Promise<void>;

    // Additional properties for type safety
    networkVersion?: string;
    selectedAddress?: string;
    chainId?: string;
  };
  agentsInitialized?: boolean;
}
