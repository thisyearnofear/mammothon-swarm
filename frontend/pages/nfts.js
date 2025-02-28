import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/NFTs.module.css";
import {
  getTokensForGithubUser,
  checkNFTOwnership,
} from "../src/lib/blockchain";
import { CONTRACT_ADDRESSES } from "../src/lib/contracts";
import logger from "../src/lib/logger";

export default function NFTs() {
  const [account, setAccount] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nftStatus, setNftStatus] = useState({});

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        logger.info("Wallet connected:", accounts[0]);
      } else {
        setError("Please install MetaMask to use this feature");
        logger.error("MetaMask not installed");
      }
    } catch (error) {
      setError("Failed to connect wallet");
      logger.error("Error connecting wallet:", error);
    }
  };

  // Check NFT ownership for projects
  const checkNFTOwnershipForProjects = async () => {
    if (!githubUsername) {
      setError("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check NFT ownership for each project
      const projects = ["vocafi", "clarity", "worldie"];
      const status = {};

      for (const project of projects) {
        const hasNFT = await checkNFTOwnership(githubUsername, project);
        status[project] = hasNFT;
      }

      setNftStatus(status);
      logger.info(
        "NFT status checked for GitHub user:",
        githubUsername,
        status
      );

      // Get tokens for the GitHub user
      const userTokens = await getTokensForGithubUser(githubUsername);
      setTokens(userTokens.map((token) => token.toString()));
      logger.info(
        "Tokens retrieved for GitHub user:",
        githubUsername,
        userTokens
      );
    } catch (error) {
      setError("Failed to check NFT ownership: " + error.message);
      logger.error("Error checking NFT ownership:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkNFTOwnershipForProjects();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Builder NFTs - Mammothon Agent Swarm</title>
        <meta name="description" content="View your Mammothon Builder NFTs" />
        <link rel="icon" href="/images/mammoth.png" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/images/mammoth.png"
              alt="Mammothon"
              width={40}
              height={40}
              className={styles.logoImage}
            />
            <span className={styles.logoText}>Mammothon</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              Agents
            </Link>
            <Link href="/projects" className={styles.navLink}>
              Project Staking
            </Link>
            <Link href="/nfts" className={`${styles.navLink} ${styles.active}`}>
              Builder NFTs
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Mammothon Builder NFTs</h1>

        <div className={styles.walletSection}>
          {account ? (
            <div className={styles.connectedWallet}>
              <p>
                Connected: {account.substring(0, 6)}...
                {account.substring(account.length - 4)}
              </p>
            </div>
          ) : (
            <button className={styles.connectButton} onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className={styles.checkForm}>
          <h2>Check Your Builder NFTs</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="githubUsername">GitHub Username:</label>
              <input
                type="text"
                id="githubUsername"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Enter your GitHub username"
                required
              />
            </div>
            <button
              type="submit"
              className={styles.checkButton}
              disabled={loading}
            >
              {loading ? "Checking..." : "Check NFTs"}
            </button>
          </form>
        </div>

        {Object.keys(nftStatus).length > 0 && (
          <div className={styles.nftStatus}>
            <h2>NFT Status</h2>
            <div className={styles.statusGrid}>
              {Object.entries(nftStatus).map(([project, hasNFT]) => (
                <div
                  key={project}
                  className={`${styles.statusCard} ${
                    hasNFT ? styles.hasNFT : styles.noNFT
                  }`}
                >
                  <h3>{project.charAt(0).toUpperCase() + project.slice(1)}</h3>
                  <p>
                    {hasNFT
                      ? "You have this Builder NFT!"
                      : "You don't have this Builder NFT yet."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokens.length > 0 && (
          <div className={styles.tokensSection}>
            <h2>Your Builder NFT Tokens</h2>
            <ul className={styles.tokensList}>
              {tokens.map((tokenId) => (
                <li key={tokenId} className={styles.tokenItem}>
                  <span>Token ID: {tokenId}</span>
                  <a
                    href={`https://explorer.sepolia.zora.energy/token/${CONTRACT_ADDRESSES.BUILDER_NFT}/${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLink}
                  >
                    View on Explorer
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.infoSection}>
          <h2>About Builder NFTs</h2>
          <p>
            Mammothon Builder NFTs are awarded to contributors of projects in
            the Mammothon ecosystem. These NFTs represent your contributions and
            can be used for governance and rewards in the future.
          </p>
          <p>
            Currently, NFTs are minted by project owners to recognize valuable
            contributions. If you've made significant contributions to a project
            and don't have an NFT yet, please reach out to the project
            maintainers.
          </p>
        </div>

        <div className={styles.navigation}>
          <Link href="/projects" className={styles.navLink}>
            View Project Staking
          </Link>
          <Link href="/" className={styles.navLink}>
            Back to Agents
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Running on Zora Sepolia Testnet</p>
      </footer>
    </div>
  );
}
