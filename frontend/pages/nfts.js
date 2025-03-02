import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/NFTs.module.css";
import {
  getTokensForGithubUser,
  checkNFTOwnership,
  mintBuilderNFT,
  generateNFTMetadata,
  getMintPrice,
  getBuilderNFTContract,
  getExplorerUrl,
} from "../src/lib/blockchain";
import {
  forceMintERC1155Token,
  isMintingEnabled,
  checkERC1155Tokens,
} from "../src/lib/erc1155-utils";
import { CONTRACT_ADDRESSES } from "../src/lib/contracts";
import logger from "../src/lib/logger";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { CHAIN_ID } from "../src/lib/wallet-config";

// Client-side only component wrapper
function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
}

export default function NFTs() {
  const { address, isConnected } = useAccount();
  const [githubUsername, setGithubUsername] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nftStatus, setNftStatus] = useState({});
  const [success, setSuccess] = useState(null);
  const [activeView, setActiveView] = useState("mint"); // "mint" or "check"
  const [mintPrice, setMintPrice] = useState("0.001");

  // Minting form state
  const [mintForm, setMintForm] = useState({
    repoUrl: "",
    projectId: "vocafi", // Default project
    twitterHandle: "",
    farcasterHandle: "",
    lensHandle: "",
  });
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [mintSuccess, setMintSuccess] = useState(null);
  const [parsedRepoInfo, setParsedRepoInfo] = useState(null);

  // Fetch mint price on load
  useEffect(() => {
    const fetchMintPrice = async () => {
      try {
        const price = await getMintPrice();
        setMintPrice(price);
        logger.info("Current mint price:", price, "ETH");
      } catch (error) {
        logger.error("Error fetching mint price:", error);
      }
    };

    fetchMintPrice();
  }, []);

  // Parse GitHub repository URL to extract username and repo name
  const parseGitHubRepoUrl = (url) => {
    try {
      // Handle different GitHub URL formats
      const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
      const match = url.match(githubRegex);

      if (!match || match.length < 3) {
        return null;
      }

      return {
        username: match[1],
        repoName: match[2].replace(".git", ""),
      };
    } catch (error) {
      console.error("Error parsing GitHub URL:", error);
      return null;
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
      const projects = ["vocafi", "clarity", "worldie", "mammothon"];
      const status = {};

      for (const project of projects) {
        const nftStatus = await checkNFTOwnership(githubUsername, project);
        status[project] = nftStatus;
      }

      setNftStatus(status);
      logger.info(
        "NFT status checked for GitHub user:",
        githubUsername,
        status
      );

      // Get tokens for the GitHub user
      const userTokens = await getTokensForGithubUser(githubUsername);
      setTokens(userTokens);
      logger.info(
        "Tokens retrieved for GitHub user:",
        githubUsername,
        userTokens
      );
    } catch (error) {
      setError(
        "Failed to check NFT ownership: " + (error.message || "Unknown error")
      );
      logger.error("Error checking NFT ownership:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for checking NFTs
  const handleSubmit = (e) => {
    e.preventDefault();
    checkNFTOwnershipForProjects();
  };

  // Handle mint form input changes
  const handleMintFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // No checkbox handling needed anymore
    } else {
      setMintForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Parse GitHub repo URL when it changes
      if (name === "repoUrl") {
        const repoInfo = parseGitHubRepoUrl(value);
        setParsedRepoInfo(repoInfo);
      }
    }
  };

  // Handle mint form submission
  const handleMintSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      setMintError("Please connect your wallet first");
      return;
    }

    if (!mintForm.repoUrl) {
      setMintError("GitHub repository URL is required");
      return;
    }

    if (!parsedRepoInfo) {
      setMintError(
        "Invalid GitHub repository URL. Please enter a valid URL (e.g., https://github.com/username/repo)"
      );
      return;
    }

    if (!mintForm.projectId) {
      setMintError("Project ID is required");
      return;
    }

    setMintLoading(true);
    setMintError(null);
    setMintSuccess(null);

    try {
      // Check if minting is enabled - call mintingEnabled as a function
      const contract = await getBuilderNFTContract();
      const mintingEnabled = await contract.mintingEnabled();
      console.log("Minting enabled status:", mintingEnabled);

      if (!mintingEnabled) {
        throw new Error(
          "NFT minting is currently disabled by the contract owner"
        );
      }

      // Check if user already has tokens for this combination
      const { hasTokens, tokenCount } = await checkERC1155Tokens(
        parsedRepoInfo.username,
        mintForm.projectId
      );

      logger.info("Token check result:", { hasTokens, tokenCount });

      // Generate metadata for the NFT with the parsed GitHub username
      const metadataInput = {
        ...mintForm,
        githubUsername: parsedRepoInfo.username,
        repoName: parsedRepoInfo.repoName,
      };

      const tokenURI = await generateNFTMetadata(metadataInput);
      logger.info("Generated token URI length:", tokenURI.length);

      // Log the first part of the metadata for debugging
      logger.info("Metadata preview:", tokenURI.substring(0, 100) + "...");

      // Try to mint using the force mint function to bypass gas estimation issues
      let result;
      try {
        // First try the regular mint function
        logger.info("Attempting regular mint...");
        result = await mintBuilderNFT(
          address,
          tokenURI,
          parsedRepoInfo.username,
          mintForm.projectId,
          parsedRepoInfo.repoName
        );
      } catch (mintError) {
        logger.error("Regular mint failed:", mintError);

        // If regular mint fails with gas estimation error, try force mint
        if (
          mintError.message.includes("gas") ||
          mintError.message.includes("ERC721") ||
          mintError.message.includes("UNPREDICTABLE_GAS_LIMIT") ||
          mintError.code === "CALL_EXCEPTION"
        ) {
          logger.info("Regular mint failed, trying force mint...");
          result = await forceMintERC1155Token(
            address,
            tokenURI,
            parsedRepoInfo.username,
            mintForm.projectId,
            parsedRepoInfo.repoName
          );
        } else {
          // If it's not a gas estimation error, rethrow
          throw mintError;
        }
      }

      // Success case for ERC1155 mint
      setMintSuccess({
        message: `Successfully minted Builder NFT with token ID: ${result.tokenId}`,
        tokenId: result.tokenId,
        txHash: result.transactionHash,
        price: result.mintPrice,
      });

      logger.info("NFT minted successfully:", result);

      // Reset form
      setMintForm({
        repoUrl: "",
        projectId: "vocafi",
        twitterHandle: "",
        farcasterHandle: "",
        lensHandle: "",
      });
      setParsedRepoInfo(null);

      // Refresh NFT status after successful mint
      if (githubUsername === parsedRepoInfo.username) {
        checkNFTOwnershipForProjects();
      }
    } catch (error) {
      // Improved error handling with user-friendly messages
      let errorMessage = "Failed to mint NFT: ";

      if (error.code === "ACTION_REJECTED") {
        errorMessage =
          "Transaction was rejected in your wallet. Please try again.";
      } else if (
        error.message &&
        error.message.includes("insufficient funds")
      ) {
        errorMessage =
          "Your wallet has insufficient funds to complete this transaction.";
      } else if (
        error.message &&
        error.message.includes("insufficient payment")
      ) {
        errorMessage = `Payment required: ${mintPrice} MON is required to mint this NFT.`;
      } else if (
        error.message &&
        error.message.includes("minting is disabled")
      ) {
        errorMessage =
          "NFT minting is currently disabled by the contract owner.";
      } else if (error.message && error.message.includes("URI too long")) {
        errorMessage =
          "The generated metadata is too large. Please try with fewer details.";
      } else if (
        (error.message &&
          error.message.includes("ERC721: token already minted")) ||
        (error.message &&
          error.message.includes(
            "GitHub username and project already has an NFT"
          ))
      ) {
        // Handle the specific case where the contract is still using ERC721 checks
        errorMessage =
          "You've already minted an NFT for this GitHub username and project combination. Try a different repository or project.";

        // Check if the user already has tokens for this project
        if (parsedRepoInfo && parsedRepoInfo.username) {
          try {
            const tokens = await getTokensForGithubUser(
              parsedRepoInfo.username
            );
            const projectTokens = tokens.filter(
              (token) =>
                token.projectHash &&
                token.projectHash
                  .toLowerCase()
                  .includes(mintForm.projectId.toLowerCase())
            );

            if (projectTokens.length > 0) {
              setMintSuccess({
                existingToken: true,
                message:
                  "You already have NFTs for this GitHub username and project combination.",
                tokens: projectTokens.map((t) => t.tokenId),
              });
              setMintError(null);
              setMintLoading(false);
              return;
            }
          } catch (checkError) {
            console.error("Error checking existing tokens:", checkError);
          }
        }
      } else {
        errorMessage += error.message || "Unknown error occurred";
      }

      setMintError(errorMessage);
      logger.error("Error minting NFT:", error);
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Builder NFTs | Mammothon</title>
        <meta
          name="description"
          content="Mint and check Builder NFTs for your Mammothon projects"
        />
        <link rel="icon" href="/images/mammoth.png" />
        <link rel="shortcut icon" href="/images/mammoth.png" />
        <link rel="apple-touch-icon" href="/images/mammoth.png" />
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
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Mammothon Builder NFTs</h1>

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

          <div
            className={styles.viewToggle}
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginBottom: "20px",
              maxWidth: "400px",
              margin: "0 auto 20px auto",
            }}
          >
            <button
              className={`${styles.toggleButton} ${
                activeView === "mint" ? styles.activeToggle : ""
              }`}
              onClick={() => setActiveView("mint")}
            >
              Mint NFT
            </button>
            <button
              className={`${styles.toggleButton} ${
                activeView === "check" ? styles.activeToggle : ""
              }`}
              onClick={() => setActiveView("check")}
            >
              Check NFTs
            </button>
          </div>

          {activeView === "mint" && isConnected && (
            <div className={styles.mintForm}>
              <h2>Mint Your Builder NFT</h2>
              <p className={styles.mintDescription}>
                Create your Builder NFT to represent your contributions to a
                project. Enter the GitHub repository URL of your forked project.
                <br />
                <span className={styles.priceTag}>
                  Mint Price: {mintPrice} MON
                </span>
              </p>

              {mintError && (
                <div className={styles.error}>
                  <p>{mintError}</p>
                  <button onClick={() => setMintError(null)}>Dismiss</button>
                </div>
              )}

              {mintSuccess && (
                <div className={styles.success}>
                  {mintSuccess.existingToken ? (
                    <div>
                      <p>{mintSuccess.message}</p>
                      {mintSuccess.tokens && mintSuccess.tokens.length > 0 && (
                        <div className={styles.existingTokens}>
                          <p>
                            Existing token IDs: {mintSuccess.tokens.join(", ")}
                          </p>
                          <p>
                            Check the "Check NFTs" tab to view more details.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p>{mintSuccess.message}</p>
                      {mintSuccess.tokenId && (
                        <div>
                          <p className={styles.pricePaid}>
                            Price paid: {mintSuccess.price} MON
                          </p>
                          <a
                            href={getExplorerUrl("tx", mintSuccess.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewLink}
                          >
                            View Transaction
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => setMintSuccess(null)}>Dismiss</button>
                </div>
              )}

              <form onSubmit={handleMintSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="repoUrl">GitHub Repository URL*</label>
                    <input
                      type="text"
                      id="repoUrl"
                      name="repoUrl"
                      value={mintForm.repoUrl}
                      onChange={handleMintFormChange}
                      placeholder="https://github.com/username/repo"
                      required
                    />
                    {parsedRepoInfo && (
                      <div className={styles.parsedInfo}>
                        <span>Username: {parsedRepoInfo.username}</span>
                        <span>Repository: {parsedRepoInfo.repoName}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="projectId">Project*</label>
                    <select
                      id="projectId"
                      name="projectId"
                      value={mintForm.projectId}
                      onChange={handleMintFormChange}
                      required
                    >
                      <option value="vocafi">VocaFI</option>
                      <option value="clarity">Clarity</option>
                      <option value="worldie">Hello World Computer</option>
                      <option value="mammothon">Mammothon</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="twitterHandle">Twitter Handle</label>
                    <input
                      type="text"
                      id="twitterHandle"
                      name="twitterHandle"
                      value={mintForm.twitterHandle}
                      onChange={handleMintFormChange}
                      placeholder="@yourtwitterhandle"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="farcasterHandle">Farcaster Handle</label>
                    <input
                      type="text"
                      id="farcasterHandle"
                      name="farcasterHandle"
                      value={mintForm.farcasterHandle}
                      onChange={handleMintFormChange}
                      placeholder="Your Farcaster handle"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="lensHandle">Lens Handle</label>
                    <input
                      type="text"
                      id="lensHandle"
                      name="lensHandle"
                      value={mintForm.lensHandle}
                      onChange={handleMintFormChange}
                      placeholder="Your Lens handle"
                    />
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    type="submit"
                    className={styles.mintButton}
                    disabled={mintLoading}
                  >
                    {mintLoading ? "Minting..." : "Mint Builder NFT"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeView === "mint" && !isConnected && (
            <div className={styles.connectPrompt}>
              <p>Please connect your wallet to mint NFTs</p>
            </div>
          )}

          {activeView === "check" && (
            <div className={styles.checkForm}>
              <h2>Check Existing Builder NFTs</h2>
              <form onSubmit={handleSubmit} className={styles.checkFormInner}>
                <div className={styles.formGroup}>
                  <label htmlFor="checkGithubUsername">GitHub Username</label>
                  <input
                    type="text"
                    id="checkGithubUsername"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Enter a GitHub username"
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

              {Object.keys(nftStatus).length > 0 && (
                <div className={styles.nftStatus}>
                  <h2>NFT Status</h2>
                  <div className={styles.statusGrid}>
                    {Object.entries(nftStatus).map(([project, status]) => (
                      <div
                        key={project}
                        className={`${styles.statusCard} ${
                          status.hasTokens ? styles.hasNFT : styles.noNFT
                        }`}
                      >
                        <h3>
                          {project.charAt(0).toUpperCase() + project.slice(1)}
                        </h3>
                        <p>
                          {status.hasTokens
                            ? `This GitHub user has ${
                                status.tokenCount
                              } Builder NFT${
                                status.tokenCount !== 1 ? "s" : ""
                              } for this project!`
                            : "This GitHub user doesn't have this Builder NFT yet."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tokens.length > 0 && (
                <div className={styles.tokensSection}>
                  <h2>Builder NFT Tokens</h2>
                  <ul className={styles.tokensList}>
                    {tokens.map((token) => (
                      <li key={token.tokenId} className={styles.tokenItem}>
                        <div>
                          <span>Token ID: {token.tokenId}</span>
                          {token.repoName && (
                            <span className={styles.tokenDetail}>
                              Repository: {token.repoName}
                            </span>
                          )}
                          {token.balance && (
                            <span className={styles.tokenDetail}>
                              Balance: {token.balance}
                            </span>
                          )}
                        </div>
                        <a
                          href={getExplorerUrl(
                            "token",
                            `${CONTRACT_ADDRESSES.BUILDER_NFT}/${token.tokenId}`
                          )}
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
            </div>
          )}
        </ClientOnly>
      </main>

      <footer className={styles.footer}>
        <p>
          Mammothon Builder NFTs on{" "}
          <a
            href={getExplorerUrl("address", CONTRACT_ADDRESSES.BUILDER_NFT)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Monad Testnet
          </a>{" "}
          - Native currency: MON
        </p>
      </footer>
    </div>
  );
}
