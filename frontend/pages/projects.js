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
  const [projectNFTs, setProjectNFTs] = useState({});
  const [userStakes, setUserStakes] = useState({});
  const [userBuilderNFTStakes, setUserBuilderNFTStakes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [txPending, setTxPending] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [nftStakeAmount, setNFTStakeAmount] = useState("");
  const [nftUnstakeAmount, setNFTUnstakeAmount] = useState("");
  const [viewMode, setViewMode] = useState("projects"); // "projects" or "builders"
  const [expandedProject, setExpandedProject] = useState(null);
  const [expandedBuilder, setExpandedBuilder] = useState(null);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [projectBuilders, setProjectBuilders] = useState({});

  // Load projects only when the loadData function is called
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
                const githubUsername = await contract.getGithubUsernameByToken(
                  tokenId
                );
                const repoName = await contract.getRepoByToken(tokenId);

                return {
                  tokenId,
                  githubUsername,
                  repoName,
                };
              } catch (error) {
                logger.error(
                  `Error getting details for token ${tokenId}:`,
                  error
                );
                return { tokenId, githubUsername: "", repoName: "" };
              }
            })
          );

          nftsData[project.id] = tokenDetails;
        } catch (error) {
          logger.error(
            `Error getting tokens for project ${project.id}:`,
            error
          );
          nftsData[project.id] = [];
        }
      }
      setProjectNFTs(nftsData);
    } catch (error) {
      setError("Failed to load projects: " + error.message);
      logger.error("Error getting all projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load user stakes only when the loadData function is called
  const loadUserStakes = async () => {
    if (!address) return;

    try {
      const stakesData = {};
      for (const project of projects) {
        try {
          const stake = await getUserStakeInfo(project.id, address);
          stakesData[project.id] = stake;
        } catch (error) {
          logger.error(`Error getting stake for project ${project.id}:`, error);
          stakesData[project.id] = { amount: 0, timestamp: 0, active: false };
        }
      }
      setUserStakes(stakesData);
      logger.info("User stakes loaded:", stakesData);
    } catch (error) {
      logger.error("Error loading user stakes:", error);
    }
  };

  // Load builder NFT details only when the loadData function is called
  const loadBuilderNFTDetails = async () => {
    if (!address) return;

    try {
      const builderStakes = {};

      // Check stakes for all minted NFTs
      for (const nft of mintedNFTs) {
        try {
          const stake = await getUserBuilderNFTStakeInfo(nft.tokenId, address);
          builderStakes[nft.tokenId] = stake;
          console.log(`Loaded stake for NFT ${nft.tokenId}:`, stake);
        } catch (error) {
          logger.error(`Error getting stake for NFT ${nft.tokenId}:`, error);
          builderStakes[nft.tokenId] = {
            amount: 0,
            timestamp: 0,
            active: false,
          };
        }
      }

      setUserBuilderNFTStakes(builderStakes);
      logger.info("User builder NFT stakes loaded:", builderStakes);
    } catch (error) {
      logger.error("Error loading builder NFT details:", error);
    }
  };

  // Load minted NFTs only when the loadData function is called
  const loadMintedNFTs = async () => {
    try {
      const nfts = await getAllMintedNFTs();
      setMintedNFTs(nfts);
      console.log("Loaded minted NFTs:", nfts);

      // Organize builders by project
      const buildersByProject = {};

      for (const nft of nfts) {
        // Get project ID from NFT attributes
        const projectId = nft.attributes?.find(
          (a) => a.trait_type === "Project"
        )?.value;

        if (projectId) {
          if (!buildersByProject[projectId]) {
            buildersByProject[projectId] = [];
          }
          buildersByProject[projectId].push(nft);
        }
      }

      setProjectBuilders(buildersByProject);
      console.log("Organized builders by project:", buildersByProject);
    } catch (error) {
      console.error("Error loading minted NFTs:", error);
    }
  };

  // Calculate total stakes for a project including builder stakes
  const calculateProjectTotalStakes = (project) => {
    let totalStaked = parseFloat(project.totalStaked) || 0;
    let stakersCount = parseInt(project.stakersCount) || 0;
    let hasAddedUserAsStaker = false;

    // Add stakes from builders
    if (projectBuilders[project.id] && projectBuilders[project.id].length > 0) {
      const buildersForProject = projectBuilders[project.id];

      // Check each builder NFT for this project
      buildersForProject.forEach((nft) => {
        // Check if user has staked on this builder
        if (userBuilderNFTStakes[nft.tokenId]) {
          const userStakeAmount =
            parseFloat(userBuilderNFTStakes[nft.tokenId].amount) / 1e18;

          // Add user stake to total
          if (userStakeAmount > 0) {
            totalStaked += userStakeAmount;

            // Count user as staker if not already counted
            if (!hasAddedUserAsStaker && !userStakes[project.id]?.active) {
              stakersCount += 1;
              hasAddedUserAsStaker = true;
            }
          }
        }
      });
    }

    return {
      totalStaked: totalStaked > 0 ? totalStaked.toFixed(1) : "0.0",
      stakersCount,
    };
  };

  // Combined function to load all data
  const loadAllData = async () => {
    if (loadingData) return;

    setLoadingData(true);
    setError(null);

    try {
      // First load projects
      await loadProjects();

      // Then load minted NFTs
      await loadMintedNFTs();

      // Then load user stakes (depends on projects)
      if (projects.length > 0) {
        await loadUserStakes();
      }

      // Finally load builder NFT stakes (depends on minted NFTs)
      if (mintedNFTs.length > 0) {
        await loadBuilderNFTDetails();
      }

      setDataLoaded(true);
      setSuccess("Data loaded successfully!");
    } catch (error) {
      setError("Failed to load data: " + error.message);
      logger.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Function to refresh data
  const refreshData = async () => {
    if (loadingData) return;

    setLoadingData(true);
    setError(null);

    try {
      await loadMintedNFTs();
      await loadBuilderNFTDetails();
      await loadUserStakes();

      setSuccess("Data refreshed successfully!");
    } catch (error) {
      setError("Failed to refresh data: " + error.message);
      logger.error("Error refreshing data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Refresh data when address changes
  useEffect(() => {
    if (dataLoaded && address) {
      loadUserStakes();
      loadBuilderNFTDetails();
    }
  }, [address, dataLoaded, projects]);

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
      setUserBuilderNFTStakes({
        ...userBuilderNFTStakes,
        [tokenId]: {
          ...userBuilderNFTStakes[tokenId],
          ...nftDetails,
        },
      });

      // Refresh project data
      const projectsData = await getAllProjects();
      setProjects(projectsData);

      // Refresh minted NFTs to update totals
      await loadMintedNFTs();

      setNFTStakeAmount("");
      setSuccess("Successfully staked on builder!");
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

      // Refresh project data
      const projectsData = await getAllProjects();
      setProjects(projectsData);

      // Refresh minted NFTs to update totals
      await loadMintedNFTs();

      setNFTUnstakeAmount("");
      setSuccess("Successfully unstaked from builder!");
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

  // Render a builder card with minimal styling
  const renderBuilderCard = (nft) => {
    // Calculate total staked amount for this builder
    const userStakeAmount = userBuilderNFTStakes[nft.tokenId]
      ? parseFloat(userBuilderNFTStakes[nft.tokenId].amount) / 1e18
      : 0;

    return (
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
            </div>
            <div className={styles.builderStats}>
              <span>
                {userStakeAmount > 0 ? `${userStakeAmount} MON` : "0 MON"}
              </span>
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
                    nft.attributes?.find((a) => a.trait_type === "Project")
                      ?.value || ""
                  }`}
                  className={styles.projectLink}
                >
                  {projects.find(
                    (p) =>
                      p.id ===
                      nft.attributes?.find((a) => a.trait_type === "Project")
                        ?.value
                  )?.name ||
                    nft.attributes?.find((a) => a.trait_type === "Project")
                      ?.value ||
                    "Unknown"}
                </Link>
              </div>

              <div className={styles.metadataItem}>
                <span>Repository URL:</span>
                <a
                  href={`https://github.com/${nft.githubUsername}/${nft.repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.repoLink}
                >
                  {`github.com/${nft.githubUsername}/${nft.repoName}`}
                </a>
              </div>

              {nft.attributes?.find(
                (attr) => attr.trait_type === "Twitter"
              ) && (
                <div className={styles.metadataItem}>
                  <span>Twitter:</span>
                  <a
                    href={`https://x.com/${nft.attributes
                      .find((attr) => attr.trait_type === "Twitter")
                      .value.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {
                      nft.attributes.find(
                        (attr) => attr.trait_type === "Twitter"
                      ).value
                    }
                  </a>
                </div>
              )}

              {nft.attributes?.find(
                (attr) => attr.trait_type === "Farcaster"
              ) && (
                <div className={styles.metadataItem}>
                  <span>Farcaster:</span>
                  <a
                    href={`https://warpcast.com/${nft.attributes
                      .find((attr) => attr.trait_type === "Farcaster")
                      .value.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                  >
                    {
                      nft.attributes.find(
                        (attr) => attr.trait_type === "Farcaster"
                      ).value
                    }
                  </a>
                </div>
              )}
            </div>

            {userStakeAmount > 0 && (
              <div className={styles.userStake}>
                <p>Your Stake: {userStakeAmount} MON</p>
              </div>
            )}

            <div className={styles.stakingControls}>
              <div className={styles.stakeForm}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="MON amount"
                  value={selectedNFT === nft.tokenId ? nftStakeAmount : ""}
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

              {userStakeAmount > 0 && (
                <div className={styles.unstakeForm}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="MON amount"
                    value={selectedNFT === nft.tokenId ? nftUnstakeAmount : ""}
                    onChange={(e) => {
                      setSelectedNFT(nft.tokenId);
                      setNFTUnstakeAmount(e.target.value);
                    }}
                    className={styles.amountInput}
                  />
                  <button
                    onClick={() => handleUnstakeFromNFT(nft.tokenId)}
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
    );
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

          {!dataLoaded ? (
            <div className={styles.dataLoadSection}>
              <p>Load blockchain data to view projects and builders</p>
              <button
                onClick={loadAllData}
                disabled={loadingData}
                className={styles.loadDataButton}
              >
                {loadingData ? "Loading..." : "Load Data"}
              </button>
            </div>
          ) : (
            <div className={styles.refreshSection}>
              <button
                onClick={refreshData}
                disabled={loadingData}
                className={styles.refreshButton}
              >
                {loadingData ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p>{success}</p>
              <button onClick={() => setSuccess(null)}>Dismiss</button>
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
                      {(() => {
                        const { totalStaked, stakersCount } =
                          calculateProjectTotalStakes(project);
                        return (
                          <>
                            <span>{totalStaked} MON</span>
                            <span>{stakersCount} Stakers</span>
                          </>
                        );
                      })()}
                      <span className={styles.expandIcon}>
                        {expandedProject === project.id ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {expandedProject === project.id && (
                    <div className={styles.projectExpanded}>
                      <Link
                        href={`/?project=${project.id}`}
                        className={styles.learnMore}
                      >
                        Learn more about this project from our agents →
                      </Link>

                      {/* Display builders for this project */}
                      <div className={styles.projectBuilders}>
                        <h3 className={styles.buildersTitle}>
                          Builders working on this project:
                        </h3>

                        {projectBuilders[project.id] &&
                        projectBuilders[project.id].length > 0 ? (
                          <div className={styles.projectBuildersList}>
                            {projectBuilders[project.id].map((nft) =>
                              renderBuilderCard(nft)
                            )}
                          </div>
                        ) : (
                          <p className={styles.noBuilders}>
                            No builders found for this project yet.
                          </p>
                        )}

                        <button
                          onClick={() => handleSyncBuilderNFTs(project.id)}
                          disabled={txPending}
                          className={styles.syncButton}
                        >
                          {txPending ? "Syncing..." : "Sync Builder NFTs"}
                        </button>
                      </div>
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
                mintedNFTs.map((nft) => renderBuilderCard(nft))
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
