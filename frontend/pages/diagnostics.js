import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import styles from "../styles/NFTs.module.css";
import {
  runContractDiagnostic,
  checkExistingNFT,
} from "../src/lib/contract-diagnostics";
import { isMintingEnabled } from "../src/lib/erc1155-utils";
import { CONTRACT_ADDRESSES } from "../src/lib/contracts";
import { getBuilderNFTContract } from "../src/lib/blockchain";

// Client-side only component wrapper
function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
}

export default function Diagnostics() {
  const { address, isConnected } = useAccount();
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [projectId, setProjectId] = useState("vocafi");
  const [nftCheckResults, setNftCheckResults] = useState(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await runContractDiagnostic();
      setDiagnosticResults(results);
    } catch (err) {
      setError(`Error running diagnostic: ${err.message}`);
      console.error("Diagnostic error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkNFT = async () => {
    if (!githubUsername || !projectId) {
      setError("Please enter both GitHub username and project ID");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await checkExistingNFT(githubUsername, projectId);
      setNftCheckResults(results);
    } catch (err) {
      setError(`Error checking NFT: ${err.message}`);
      console.error("NFT check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkMintingEnabled = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getBuilderNFTContract();
      const enabled = await contract.mintingEnabled();
      console.log("Minting enabled status:", enabled);
      alert(`Minting is currently ${enabled ? "ENABLED" : "DISABLED"}`);
    } catch (err) {
      setError(`Error checking minting status: ${err.message}`);
      console.error("Minting check error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Contract Diagnostics | Mammothon</title>
        <meta
          name="description"
          content="Diagnose BuilderNFT contract issues"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image
              src="/images/mammoth.png"
              alt="Mammothon Logo"
              width={50}
              height={50}
            />
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/projects" className={styles.navLink}>
            Projects
          </Link>
          <Link href="/nfts" className={styles.navLink}>
            NFTs
          </Link>
          <Link href="/diagnostics" className={styles.navLink}>
            Diagnostics
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Contract Diagnostics</h1>

        <ClientOnly>
          <div className={styles.walletSection}>
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div className={styles.diagnosticSection}>
            <h2>BuilderNFT Contract</h2>
            <p className={styles.contractAddress}>
              Contract Address:{" "}
              <a
                href={`https://explorer.sepolia.zora.energy/address/${CONTRACT_ADDRESSES.BUILDER_NFT}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CONTRACT_ADDRESSES.BUILDER_NFT}
              </a>
            </p>

            <div className={styles.buttonContainer}>
              <button
                onClick={runDiagnostic}
                className={styles.diagnosticButton}
                disabled={loading}
              >
                {loading ? "Running..." : "Run Full Diagnostic"}
              </button>
              <button
                onClick={checkMintingEnabled}
                className={styles.diagnosticButton}
                disabled={loading}
              >
                Check Minting Status
              </button>
            </div>

            {diagnosticResults && (
              <div className={styles.resultsSection}>
                <h3>Diagnostic Results</h3>
                <div className={styles.resultsGrid}>
                  <div className={styles.resultItem}>
                    <strong>Contract Exists:</strong>{" "}
                    {diagnosticResults.contractExists ? "Yes" : "No"}
                  </div>
                  <div className={styles.resultItem}>
                    <strong>Minting Enabled:</strong>{" "}
                    {diagnosticResults.mintingEnabled ? "Yes" : "No"}
                  </div>
                  <div className={styles.resultItem}>
                    <strong>Mint Price:</strong> {diagnosticResults.mintPrice}{" "}
                    ETH
                  </div>
                  <div className={styles.resultItem}>
                    <strong>Total Tokens:</strong>{" "}
                    {diagnosticResults.totalTokens}
                  </div>
                  <div className={styles.resultItem}>
                    <strong>Contract Balance:</strong>{" "}
                    {diagnosticResults.contractBalance} ETH
                  </div>
                  <div className={styles.resultItem}>
                    <strong>Contract Owner:</strong>{" "}
                    <a
                      href={`https://explorer.sepolia.zora.energy/address/${diagnosticResults.contractOwner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.addressLink}
                    >
                      {diagnosticResults.contractOwner}
                    </a>
                  </div>
                </div>

                {diagnosticResults.errors.length > 0 && (
                  <div className={styles.errorsSection}>
                    <h3>Errors</h3>
                    <ul className={styles.errorsList}>
                      {diagnosticResults.errors.map((err, index) => (
                        <li key={index} className={styles.errorItem}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className={styles.nftCheckSection}>
              <h3>Check Existing NFTs</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="githubUsername">GitHub Username</label>
                  <input
                    type="text"
                    id="githubUsername"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="projectId">Project ID</label>
                  <select
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  >
                    <option value="vocafi">VocaFI</option>
                    <option value="clarity">Clarity</option>
                    <option value="worldie">Hello World Computer</option>
                    <option value="mammothon">Mammothon</option>
                  </select>
                </div>
                <button
                  onClick={checkNFT}
                  className={styles.checkButton}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Check NFT"}
                </button>
              </div>

              {nftCheckResults && (
                <div className={styles.nftResults}>
                  <h4>NFT Check Results</h4>
                  <div className={styles.nftResultsContent}>
                    <p>
                      <strong>GitHub Username:</strong>{" "}
                      {nftCheckResults.githubUsername}
                    </p>
                    <p>
                      <strong>Project ID:</strong> {nftCheckResults.projectId}
                    </p>
                    <p>
                      <strong>Has Tokens:</strong>{" "}
                      {nftCheckResults.hasTokens ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Token Count:</strong> {nftCheckResults.tokenCount}
                    </p>
                    {nftCheckResults.tokens.length > 0 && (
                      <div>
                        <p>
                          <strong>Tokens:</strong>
                        </p>
                        <ul className={styles.tokensList}>
                          {nftCheckResults.tokens.map((token) => (
                            <li key={token} className={styles.tokenItem}>
                              <a
                                href={`https://explorer.sepolia.zora.energy/token/${CONTRACT_ADDRESSES.BUILDER_NFT}/${token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Token #{token}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {nftCheckResults.error && (
                      <p className={styles.errorText}>
                        <strong>Error:</strong> {nftCheckResults.error}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ClientOnly>
      </main>

      <footer className={styles.footer}>
        <p>
          Mammothon Builder NFTs on{" "}
          <a
            href={`https://explorer.sepolia.zora.energy/address/${CONTRACT_ADDRESSES.BUILDER_NFT}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Zora Sepolia
          </a>
        </p>
      </footer>
    </div>
  );
}
