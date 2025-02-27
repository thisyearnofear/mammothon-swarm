import { useState, useEffect } from "react";
import { WALLET_CONNECT_ID } from "../lib/wallet-config";

// Dynamically import ethers to prevent build errors
let BrowserProvider: any;
try {
  // Only import in browser environment
  if (typeof window !== "undefined") {
    import("ethers")
      .then((ethers) => {
        BrowserProvider = ethers.BrowserProvider;
      })
      .catch((err) => {
        console.warn("Failed to load ethers library:", err);
      });
  }
} catch (error) {
  console.warn("Error importing ethers:", error);
}

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
}) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ethersAvailable, setEthersAvailable] = useState(false);

  // Check if ethers and ethereum are available
  useEffect(() => {
    const checkDependencies = async () => {
      if (typeof window !== "undefined" && window.ethereum && BrowserProvider) {
        setEthersAvailable(true);
        console.log("Wallet Connect ID:", WALLET_CONNECT_ID);
      } else {
        console.warn("Ethereum provider or ethers library not available");
        setEthersAvailable(false);
      }
    };

    checkDependencies();
  }, []);

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (
        !ethersAvailable ||
        typeof window === "undefined" ||
        !window.ethereum ||
        !BrowserProvider
      ) {
        return;
      }

      try {
        // Check if we're already connected
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          const connectedAddress = accounts[0].address;
          setAddress(connectedAddress);
          onConnect(connectedAddress);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, [onConnect, ethersAvailable]);

  const connectWallet = async () => {
    if (
      !ethersAvailable ||
      typeof window === "undefined" ||
      !window.ethereum ||
      !BrowserProvider
    ) {
      alert("Please install MetaMask or another Ethereum wallet to connect");
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const connectedAddress = accounts[0];
        setAddress(connectedAddress);
        onConnect(connectedAddress);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onDisconnect();
  };

  // If ethers is not available, show a simplified button
  if (!ethersAvailable) {
    return (
      <div className="wallet-connect">
        <button className="connect-button disabled" disabled>
          Wallet Not Available
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {!address ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </span>
          <button onClick={disconnectWallet} className="disconnect-button">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
