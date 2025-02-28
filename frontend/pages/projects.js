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
} from "../src/lib/blockchain";
import logger from "../src/lib/logger";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStakes, setUserStakes] = useState({});
  const [txPending, setTxPending] = useState(false);

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

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getAllProjects();
        setProjects(projectsData);
        logger.info("Projects loaded:", projectsData.length);
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
      if (!account || projects.length === 0) return;

      try {
        const stakes = {};
        for (const project of projects) {
          const stakeInfo = await getUserStakeInfo(project.id, account);
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
  }, [account, projects]);

  // Handle staking
  const handleStake = async (projectId) => {
    if (!account) {
      await connectWallet();
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
      const stakeInfo = await getUserStakeInfo(projectId, account);
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
    if (!account) {
      await connectWallet();
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
      const stakeInfo = await getUserStakeInfo(projectId, account);
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Projects - Mammothon Agent Swarm</title>
        <meta
          name="description"
          content="Stake on your favorite Mammothon projects"
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
        <h1 className={styles.title}>Project Staking</h1>

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

        {loading ? (
          <div className={styles.loading}>Loading projects...</div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <h2>{project.name}</h2>
                <div className={styles.projectStats}>
                  <p>Total Staked: {project.totalStaked} ETH</p>
                  <p>Stakers: {project.stakersCount}</p>
                </div>

                {userStakes[project.id] && (
                  <div className={styles.userStake}>
                    <h3>Your Stake</h3>
                    <p>
                      {parseFloat(userStakes[project.id].amount) / 1e18} ETH
                    </p>
                    <p>Staked on: {userStakes[project.id].timestamp}</p>
                  </div>
                )}

                <div className={styles.stakeActions}>
                  <div className={styles.stakeForm}>
                    <input
                      type="number"
                      placeholder="ETH Amount"
                      value={selectedProject === project.id ? stakeAmount : ""}
                      onChange={(e) => {
                        setSelectedProject(project.id);
                        setStakeAmount(e.target.value);
                      }}
                      min="0"
                      step="0.01"
                    />
                    <button
                      onClick={() => handleStake(project.id)}
                      disabled={txPending}
                    >
                      {txPending ? "Processing..." : "Stake"}
                    </button>
                  </div>

                  {userStakes[project.id] && (
                    <div className={styles.unstakeForm}>
                      <input
                        type="number"
                        placeholder="ETH Amount"
                        value={
                          selectedProject === project.id ? unstakeAmount : ""
                        }
                        onChange={(e) => {
                          setSelectedProject(project.id);
                          setUnstakeAmount(e.target.value);
                        }}
                        min="0"
                        step="0.01"
                        max={parseFloat(userStakes[project.id].amount) / 1e18}
                      />
                      <button
                        onClick={() => handleUnstake(project.id)}
                        disabled={txPending}
                      >
                        {txPending ? "Processing..." : "Unstake"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.navigation}>
          <Link href="/" className={styles.backLink}>
            ← Back to Agents
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Running on Zora Sepolia Testnet</p>
      </footer>
    </div>
  );
}
