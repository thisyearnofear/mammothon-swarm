import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Projects.module.css";
import {
  getAllProjects,
  stakeOnProject,
  unstakeFromProject,
  getUserStakeInfo,
  getTokensForProject,
  getBuilderNFTContract,
  getBuilderNFTDetails,
  stakeOnBuilderNFT,
  unstakeFromBuilderNFT,
  getUserBuilderNFTStakeInfo,
  syncBuilderNFTs,
  getAllMintedNFTs,
} from "../src/lib/blockchain";
import logger from "../src/lib/logger";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { CHAIN_ID } from "../src/lib/wallet-config";

// Import the integrations (will be a no-op if file doesn't exist yet)
let getIndexedGitHubActivity;
let getIndexedOnChainActivity;

// Dynamically import integrations
if (typeof window !== "undefined") {
  import("../src/lib/integrations")
    .then((module) => {
      getIndexedGitHubActivity = module.getIndexedGitHubActivity;
      getIndexedOnChainActivity = module.getIndexedOnChainActivity;
    })
    .catch((err) => {
      console.log("Integrations not available yet:", err);
    });
}

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

export default function Projects() {
  const { address, isConnected } = useAccount();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStakes, setUserStakes] = useState({});
  const [txPending, setTxPending] = useState(false);
  const [projectNFTs, setProjectNFTs] = useState({});
  const [projectActivity, setProjectActivity] = useState({});
  const [builderNFTDetails, setBuilderNFTDetails] = useState({});
  const [userBuilderNFTStakes, setUserBuilderNFTStakes] = useState({});
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [nftStakeAmount, setNFTStakeAmount] = useState("");
  const [nftUnstakeAmount, setNFTUnstakeAmount] = useState("");
  const [viewMode, setViewMode] = useState("projects"); // "projects" or "builders"
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedBuilder, setExpandedBuilder] = useState(null);
  const [mintedNFTs, setMintedNFTs] = useState([]);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getAllProjects();
        setProjects(projectsData);
        logger.info("Projects loaded:", projectsData.length);

        // Load NFTs for each project
        const nftsData = {};
        for (const project of projectsData) {
          try {
            const tokens = await getTokensForProject(project.id);
            // For ERC1155, we need to get more details about each token
            const tokenDetails = await Promise.all(
              tokens.map(async (tokenId) => {
                try {
                  const contract = await getBuilderNFTContract();
                  const githubUsername =
                    await contract.getGithubUsernameByToken(tokenId);
                  const repoName = await contract.getRepoByToken(tokenId);

                  return {
                    tokenId: tokenId.toString(),
                    githubUsername,
                    repoName,
                  };
                } catch (err) {
                  logger.error(
                    `Error getting details for token ${tokenId}:`,
                    err
                  );
                  return { tokenId: tokenId.toString() };
                }
              })
            );
            nftsData[project.id] = tokenDetails;
          } catch (error) {
            logger.error(
              `Error loading NFTs for project ${project.id}:`,
              error
            );
            nftsData[project.id] = [];
          }
        }
        setProjectNFTs(nftsData);

        // Load activity data if integrations are available
        if (
          typeof getIndexedGitHubActivity === "function" &&
          typeof getIndexedOnChainActivity === "function"
        ) {
          const activityData = {};
          for (const project of projectsData) {
            try {
              const githubActivity = await getIndexedGitHubActivity(project.id);
              const onChainActivity = await getIndexedOnChainActivity(
                project.id
              );

              activityData[project.id] = {
                github: githubActivity,
                onChain: onChainActivity,
              };
            } catch (error) {
              logger.error(
                `Error loading activity for project ${project.id}:`,
                error
              );
              activityData[project.id] = { github: null, onChain: null };
            }
          }
          setProjectActivity(activityData);
        }
      } catch (error) {
        setError("Failed to load projects");
        logger.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load user stakes when account changes
  useEffect(() => {
    const loadUserStakes = async () => {
      if (!address || projects.length === 0) return;

      try {
        const stakes = {};
        for (const project of projects) {
          const stakeInfo = await getUserStakeInfo(project.id, address);
          if (stakeInfo) {
            stakes[project.id] = {
              amount: stakeInfo.amount.toString(),
              timestamp: new Date(
                stakeInfo.timestamp.toNumber() * 1000
              ).toLocaleString(),
              active: stakeInfo.active,
            };
          }
        }
        setUserStakes(stakes);
        logger.info("User stakes loaded:", stakes);
      } catch (error) {
        logger.error("Error loading user stakes:", error);
      }
    };

    loadUserStakes();
  }, [address, projects]);

  // Load builder NFT details
  useEffect(() => {
    const loadBuilderNFTDetails = async () => {
      if (Object.keys(projectNFTs).length === 0) return;

      try {
        const details = {};
        const stakes = {};

        // Iterate through all projects and their NFTs
        for (const projectId in projectNFTs) {
          for (const tokenId of projectNFTs[projectId]) {
            try {
              // Skip if we already have details for this token
              if (details[tokenId]) continue;

              // Get builder NFT details
              const nftDetails = await getBuilderNFTDetails(tokenId);
              details[tokenId] = {
                ...nftDetails,
                projectId,
              };

              // Get user's stake on this NFT if connected
              if (address) {
                const stakeInfo = await getUserBuilderNFTStakeInfo(
                  tokenId,
                  address
                );
                if (stakeInfo) {
                  stakes[tokenId] = {
                    amount: stakeInfo.amount.toString(),
                    timestamp: new Date(
                      stakeInfo.timestamp.toNumber() * 1000
                    ).toLocaleString(),
                    active: stakeInfo.active,
                  };
                }
              }
            } catch (error) {
              logger.error(`Error loading details for NFT ${tokenId}:`, error);
            }
          }
        }

        setBuilderNFTDetails(details);
        setUserBuilderNFTStakes(stakes);
      } catch (error) {
        logger.error("Error loading builder NFT details:", error);
      }
    };

    loadBuilderNFTDetails();
  }, [projectNFTs, address]);

  // Load minted NFTs
  useEffect(() => {
    const loadMintedNFTs = async () => {
      try {
        const nfts = await getAllMintedNFTs();
        setMintedNFTs(nfts);
        console.log("Loaded minted NFTs:", nfts);
      } catch (error) {
        console.error("Error loading minted NFTs:", error);
      }
    };

    loadMintedNFTs();
  }, []);

  // Handle staking
  const handleStake = async (projectId) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    try {
      setTxPending(true);
      await stakeOnProject(projectId, stakeAmount);

      // Refresh project data
      const projectsData = await getAllProjects();
      setProjects(projectsData);

      // Refresh user stake
      const stakeInfo = await getUserStakeInfo(projectId, address);
      setUserStakes({
        ...userStakes,
        [projectId]: {
          amount: stakeInfo.amount.toString(),
          timestamp: new Date(
            stakeInfo.timestamp.toNumber() * 1000
          ).toLocaleString(),
          active: stakeInfo.active,
        },
      });

      setStakeAmount("");
      logger.info("Successfully staked on project:", projectId);
    } catch (error) {
      setError("Failed to stake: " + error.message);
      logger.error("Error staking:", error);
    } finally {
      setTxPending(false);
    }
  };

  // Handle unstaking
  const handleUnstake = async (projectId) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setError("Please enter a valid unstake amount");
      return;
    }

    try {
      setTxPending(true);
      await unstakeFromProject(projectId, unstakeAmount);

      // Refresh project data
      const projectsData = await getAllProjects();
      setProjects(projectsData);

      // Refresh user stake
      const stakeInfo = await getUserStakeInfo(projectId, address);
      if (stakeInfo) {
        setUserStakes({
          ...userStakes,
          [projectId]: {
            amount: stakeInfo.amount.toString(),
            timestamp: new Date(
              stakeInfo.timestamp.toNumber() * 1000
            ).toLocaleString(),
            active: stakeInfo.active,
          },
        });
      } else {
        // Remove stake if fully unstaked
        const newUserStakes = { ...userStakes };
        delete newUserStakes[projectId];
        setUserStakes(newUserStakes);
      }

      setUnstakeAmount("");
      logger.info("Successfully unstaked from project:", projectId);
    } catch (error) {
      setError("Failed to unstake: " + error.message);
      logger.error("Error unstaking:", error);
    } finally {
      setTxPending(false);
    }
  };

  // Handle staking on a builder NFT
  const handleStakeOnNFT = async (tokenId) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!nftStakeAmount || parseFloat(nftStakeAmount) <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    try {
      setTxPending(true);
      await stakeOnBuilderNFT(tokenId, nftStakeAmount);

      // Refresh builder NFT details
      const nftDetails = await getBuilderNFTDetails(tokenId);
      setBuilderNFTDetails({
        ...builderNFTDetails,
        [tokenId]: {
          ...builderNFTDetails[tokenId],
          ...nftDetails,
        },
      });

      // Refresh user stake
      const stakeInfo = await getUserBuilderNFTStakeInfo(tokenId, address);
      if (stakeInfo) {
        setUserBuilderNFTStakes({
          ...userBuilderNFTStakes,
          [tokenId]: {
            amount: stakeInfo.amount.toString(),
            timestamp: new Date(
              stakeInfo.timestamp.toNumber() * 1000
            ).toLocaleString(),
            active: stakeInfo.active,
          },
        });
      }

      setNFTStakeAmount("");
      logger.info("Successfully staked on builder NFT:", tokenId);
    } catch (error) {
      setError("Failed to stake on NFT: " + error.message);
      logger.error("Error staking on NFT:", error);
    } finally {
      setTxPending(false);
    }
  };

  // Handle unstaking from a builder NFT
  const handleUnstakeFromNFT = async (tokenId) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!nftUnstakeAmount || parseFloat(nftUnstakeAmount) <= 0) {
      setError("Please enter a valid unstake amount");
      return;
    }

    try {
      setTxPending(true);
      await unstakeFromBuilderNFT(tokenId, nftUnstakeAmount);

      // Refresh builder NFT details
      const nftDetails = await getBuilderNFTDetails(tokenId);
      setBuilderNFTDetails({
        ...builderNFTDetails,
        [tokenId]: {
          ...builderNFTDetails[tokenId],
          ...nftDetails,
        },
      });

      // Refresh user stake
      const stakeInfo = await getUserBuilderNFTStakeInfo(tokenId, address);
      if (stakeInfo) {
        setUserBuilderNFTStakes({
          ...userBuilderNFTStakes,
          [tokenId]: {
            amount: stakeInfo.amount.toString(),
            timestamp: new Date(
              stakeInfo.timestamp.toNumber() * 1000
            ).toLocaleString(),
            active: stakeInfo.active,
          },
        });
      } else {
        // Remove stake if fully unstaked
        const newUserStakes = { ...userBuilderNFTStakes };
        delete newUserStakes[tokenId];
        setUserBuilderNFTStakes(newUserStakes);
      }

      setNFTUnstakeAmount("");
      logger.info("Successfully unstaked from builder NFT:", tokenId);
    } catch (error) {
      setError("Failed to unstake from NFT: " + error.message);
      logger.error("Error unstaking from NFT:", error);
    } finally {
      setTxPending(false);
    }
  };

  // Handle syncing builder NFTs for a project
  const handleSyncBuilderNFTs = async (projectId) => {
    try {
      setTxPending(true);
      await syncBuilderNFTs(projectId);

      // Refresh project data
      const projectsData = await getAllProjects();
      setProjects(projectsData);

      // Refresh NFTs for this project
      const tokens = await getTokensForProject(projectId);
      const tokenDetails = await Promise.all(
        tokens.map(async (tokenId) => {
          try {
            const contract = await getBuilderNFTContract();
            const githubUsername = await contract.getGithubUsernameByToken(
              tokenId
            );
            const repoName = await contract.getRepoByToken(tokenId);

            return {
              tokenId: tokenId.toString(),
              githubUsername,
              repoName,
            };
          } catch (err) {
            logger.error(`Error getting details for token ${tokenId}:`, err);
            return { tokenId: tokenId.toString() };
          }
        })
      );

      setProjectNFTs({
        ...projectNFTs,
        [projectId]: tokens.map((id) => id.toString()),
      });

      logger.info("Successfully synced builder NFTs for project:", projectId);
    } catch (error) {
      setError("Failed to sync builder NFTs: " + error.message);
      logger.error("Error syncing builder NFTs:", error);
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Project Staking - Mammothon</title>
        <meta
          name="description"
          content="Support builders and projects on Mammothon"
        />
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
            <Link
              href="/projects"
              className={`${styles.navLink} ${styles.active}`}
            >
              Project Staking
            </Link>
            <Link href="/nfts" className={styles.navLink}>
              Builder NFTs
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Support Builders</h1>

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

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${
                viewMode === "projects" ? styles.active : ""
              }`}
              onClick={() => {
                setViewMode("projects");
                setExpandedBuilder(null);
              }}
            >
              Projects
            </button>
            <button
              className={`${styles.viewButton} ${
                viewMode === "builders" ? styles.active : ""
              }`}
              onClick={() => {
                setViewMode("builders");
                setExpandedProject(null);
              }}
            >
              Builders
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : viewMode === "projects" ? (
            <div className={styles.projectsList}>
              {projects.map((project) => (
                <div key={project.id} className={styles.projectItem}>
                  <div
                    className={styles.projectHeader}
                    onClick={() =>
                      setExpandedProject(
                        expandedProject === project.id ? null : project.id
                      )
                    }
                  >
                    <h2>{project.name}</h2>
                    <div className={styles.projectSummary}>
                      <span>{project.totalStaked} MON</span>
                      <span>{project.stakersCount} Stakers</span>
                      <span className={styles.expandIcon}>
                        {expandedProject === project.id ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {expandedProject === project.id && (
                    <div className={styles.projectExpanded}>
                      {userStakes[project.id] && (
                        <div className={styles.userStake}>
                          <p>
                            Your Stake:{" "}
                            {parseFloat(userStakes[project.id].amount) / 1e18}{" "}
                            MON
                          </p>
                        </div>
                      )}

                      <div className={styles.stakingControls}>
                        <div className={styles.stakeForm}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="MON amount"
                            value={
                              selectedProject === project.id ? stakeAmount : ""
                            }
                            onChange={(e) => {
                              setSelectedProject(project.id);
                              setStakeAmount(e.target.value);
                            }}
                            className={styles.amountInput}
                          />
                          <button
                            onClick={() => handleStake(project.id)}
                            disabled={txPending}
                            className={styles.stakeButton}
                          >
                            {txPending && selectedProject === project.id
                              ? "Staking..."
                              : "Stake"}
                          </button>
                        </div>

                        {userStakes[project.id] && (
                          <div className={styles.unstakeForm}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="MON amount"
                              value={
                                selectedProject === project.id
                                  ? unstakeAmount
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedProject(project.id);
                                setUnstakeAmount(e.target.value);
                              }}
                              className={styles.amountInput}
                            />
                            <button
                              onClick={() => handleUnstake(project.id)}
                              disabled={txPending}
                              className={styles.unstakeButton}
                            >
                              {txPending && selectedProject === project.id
                                ? "Unstaking..."
                                : "Unstake"}
                            </button>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/?project=${project.id}`}
                        className={styles.learnMore}
                      >
                        Learn more about this project from our agents →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.buildersList}>
              {mintedNFTs.length === 0 ? (
                <div className={styles.noBuilders}>
                  <p>No builders found for the current projects.</p>
                </div>
              ) : (
                mintedNFTs.map((nft) => (
                  <div key={nft.tokenId} className={styles.builderItem}>
                    <div
                      className={styles.builderHeader}
                      onClick={() =>
                        setExpandedBuilder(
                          expandedBuilder === nft.tokenId ? null : nft.tokenId
                        )
                      }
                    >
                      <div className={styles.builderSummary}>
                        <div className={styles.builderInfo}>
                          <h3>{nft.githubUsername}</h3>
                          <span className={styles.projectName}>
                            {
                              projects.find(
                                (p) =>
                                  p.id ===
                                  nft.attributes?.find(
                                    (a) => a.trait_type === "Project"
                                  )?.value
                              )?.name
                            }
                          </span>
                        </div>
                        <div className={styles.builderStats}>
                          <span>{nft.totalStaked || "0"} MON</span>
                          <span className={styles.expandIcon}>
                            {expandedBuilder === nft.tokenId ? "▼" : "▶"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedBuilder === nft.tokenId && (
                      <div className={styles.builderExpanded}>
                        <div className={styles.builderMetadata}>
                          <div className={styles.metadataItem}>
                            <span>Project:</span>
                            <Link
                              href={`/?project=${
                                nft.attributes?.find(
                                  (a) => a.trait_type === "Project"
                                )?.value
                              }`}
                              className={styles.projectLink}
                            >
                              {
                                projects.find(
                                  (p) =>
                                    p.id ===
                                    nft.attributes?.find(
                                      (a) => a.trait_type === "Project"
                                    )?.value
                                )?.name
                              }
                            </Link>
                          </div>
                          <div className={styles.metadataItem}>
                            <span>Vision:</span>
                            <p className={styles.vision}>{nft.description}</p>
                          </div>
                          <div className={styles.metadataItem}>
                            <span>Repository:</span>
                            <a
                              href={`https://github.com/${nft.githubUsername}/${nft.repoName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.repoLink}
                            >
                              {nft.repoName}
                            </a>
                          </div>
                          {nft.attributes?.map(
                            (attr) =>
                              attr.trait_type !== "Project" &&
                              attr.trait_type !== "GitHub" && (
                                <div
                                  key={attr.trait_type}
                                  className={styles.metadataItem}
                                >
                                  <span>{attr.trait_type}:</span>
                                  {attr.trait_type === "Twitter" ? (
                                    <a
                                      href={`https://twitter.com/${attr.value.replace(
                                        "@",
                                        ""
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.socialLink}
                                    >
                                      {attr.value}
                                    </a>
                                  ) : (
                                    <span>{attr.value}</span>
                                  )}
                                </div>
                              )
                          )}
                        </div>

                        {userBuilderNFTStakes[nft.tokenId] && (
                          <div className={styles.userStake}>
                            <p>
                              Your Stake:{" "}
                              {parseFloat(
                                userBuilderNFTStakes[nft.tokenId].amount
                              ) / 1e18}{" "}
                              MON
                            </p>
                          </div>
                        )}

                        <div className={styles.stakingControls}>
                          <div className={styles.stakeForm}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="MON amount"
                              value={
                                selectedNFT === nft.tokenId
                                  ? nftStakeAmount
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedNFT(nft.tokenId);
                                setNFTStakeAmount(e.target.value);
                              }}
                              className={styles.amountInput}
                            />
                            <button
                              onClick={() => handleStakeOnNFT(nft.tokenId)}
                              disabled={txPending}
                              className={styles.stakeButton}
                            >
                              {txPending && selectedNFT === nft.tokenId
                                ? "Staking..."
                                : "Support Builder"}
                            </button>
                          </div>

                          {userBuilderNFTStakes[nft.tokenId] && (
                            <div className={styles.unstakeForm}>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="MON amount"
                                value={
                                  selectedNFT === nft.tokenId
                                    ? nftUnstakeAmount
                                    : ""
                                }
                                onChange={(e) => {
                                  setSelectedNFT(nft.tokenId);
                                  setNFTUnstakeAmount(e.target.value);
                                }}
                                className={styles.amountInput}
                              />
                              <button
                                onClick={() =>
                                  handleUnstakeFromNFT(nft.tokenId)
                                }
                                disabled={txPending}
                                className={styles.unstakeButton}
                              >
                                {txPending && selectedNFT === nft.tokenId
                                  ? "Unstaking..."
                                  : "Unstake"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </ClientOnly>

        <div className={styles.infoSection}>
          <p>
            Support builders by staking MON on their vision for the project.
            Your stake signals community belief in their direction.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Running on Monad Testnet (Chain ID: {CHAIN_ID})</p>
      </footer>
    </div>
  );
}
