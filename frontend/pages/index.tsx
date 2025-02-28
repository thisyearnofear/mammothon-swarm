import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import logger from "../src/lib/logger";

// Define types inline to avoid import issues
interface AgentConfig {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  apiUrl?: string;
}

interface AgentInterface {
  config: AgentConfig;
  setupElements(
    chatContainer: HTMLDivElement,
    messageInput: HTMLInputElement,
    sendButton: HTMLButtonElement
  ): void;
  initializeChat(): Promise<void>;
}

interface Message {
  role: string;
  content: string;
}

interface AgentInfo {
  name: string;
  avatar: string;
  id: string;
  label: string;
  description: string;
}

const agentList: Record<string, AgentInfo> = {
  vocafi: {
    name: "VocaFI",
    avatar: "/images/vocafi-avatar.svg",
    id: "vocafi",
    label: "VOCAFI",
    description: "Your AI financial advisor",
  },
  wooly: {
    name: "Wooly",
    avatar: "/images/wooly-avatar.svg",
    id: "wooly",
    label: "WOOLY",
    description: "Your friendly AI assistant",
  },
  clarity: {
    name: "Clarity",
    avatar: "/images/clarity-avatar.svg",
    id: "clarity",
    label: "CLARITY",
    description: "Your code clarity expert",
  },
  hwc: {
    name: "Worldie",
    avatar: "/images/hwc-avatar.svg",
    id: "hwc",
    label: "WORLDIE",
    description: "Your world connection guide",
  },
};

export default function Home() {
  const { Agent, apiBaseUrl } = useModules();
  const [activeAgent, setActiveAgent] = useState<AgentInterface | null>(null);
  const [apiStatus, setApiStatus] = useState<"loading" | "online" | "offline">(
    "loading"
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Check API status
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        logger.info(`Checking API status at ${apiBaseUrl}/health`);
        const response = await fetch(`${apiBaseUrl}/health`);
        if (response.ok) {
          logger.info("API is online");
          setApiStatus("online");
        } else {
          logger.warn(`API returned status ${response.status}`);
          setApiStatus("offline");
        }
      } catch (error) {
        logger.error("Error checking API status:", error);
        setApiStatus("offline");
      }
    };

    if (apiBaseUrl) {
      checkApiStatus();
    }
  }, [apiBaseUrl]);

  // Initialize chat when active agent changes
  useEffect(() => {
    if (
      activeAgent &&
      chatContainerRef.current &&
      messageInputRef.current &&
      sendButtonRef.current
    ) {
      logger.info(`Setting up agent: ${activeAgent.config.id}`);

      // Set up the agent with the DOM elements
      activeAgent.setupElements(
        chatContainerRef.current,
        messageInputRef.current,
        sendButtonRef.current
      );

      // Initialize the chat
      logger.info(`Initializing chat for agent: ${activeAgent.config.id}`);
      activeAgent.initializeChat().catch((error: unknown) => {
        logger.error("Error initializing chat:", error);
        // Add error handling UI if needed
      });
    }
  }, [activeAgent]);

  // Handle agent selection
  const selectAgent = (agentId: string) => {
    if (!agentList[agentId] || !Agent) return;

    try {
      logger.info(`Creating agent: ${agentId}`);
      logger.debug(`Agent class available: ${!!Agent}`);

      const newAgent = new Agent({
        id: agentId,
        name: agentList[agentId].name,
        description: agentList[agentId].description,
        avatarUrl: agentList[agentId].avatar,
      });

      logger.info(`Agent created: ${agentId}`);
      setSelectedAgent(agentId);
      setActiveAgent(newAgent);
    } catch (error) {
      logger.error("Error creating agent:", error);
      alert("Could not initialize the agent. Please try again later.");
    }
  };

  const handleBack = () => {
    logger.info("Navigating back to agent selection");
    setSelectedAgent(null);
    setActiveAgent(null);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Mammothon Agent Swarm</title>
        <meta
          name="description"
          content="AI agents for expanding on hackathon projects"
        />
        <link rel="icon" href="/images/mammoth.png" />
        <link rel="apple-touch-icon" href="/images/mammoth.png" />
        <link
          rel="shortcut icon"
          type="image/mammoth.png"
          href="/images/mammoth.png"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <main className={styles.main}>
        {apiStatus === "loading" && (
          <div className={styles.apiStatus}>
            <p>Checking API status...</p>
          </div>
        )}

        {apiStatus === "offline" && (
          <div className={styles.apiStatus}>
            <p>API is currently offline. Please try again later.</p>
          </div>
        )}

        {apiStatus === "online" && (
          <div className={styles.content}>
            {!selectedAgent ? (
              <>
                <h1 className={styles.welcomeTitle}>Mammothon Agent Swarm</h1>

                <div className={styles.blockchainLinks}>
                  <Link href="/projects" className={styles.blockchainLink}>
                    <span className={styles.blockchainLinkIcon}>💰</span>
                    Project Staking
                  </Link>
                  <Link href="/nfts" className={styles.blockchainLink}>
                    <span className={styles.blockchainLinkIcon}>🏆</span>
                    Builder NFTs
                  </Link>
                </div>

                <div className={styles.agentGrid}>
                  {Object.entries(agentList).map(([id, agent]) => (
                    <div key={id} className={styles.agentWrapper}>
                      <button
                        className={styles.agentButton}
                        onClick={() => selectAgent(id)}
                      >
                        <Image
                          src={agent.avatar}
                          alt={agent.name}
                          className={styles.agentAvatar}
                          width={150}
                          height={150}
                        />
                      </button>
                      <span className={styles.agentLabel}>{agent.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <button onClick={handleBack} className={styles.backButton}>
                    ← Back
                  </button>
                  <Image
                    src={agentList[selectedAgent].avatar}
                    alt={agentList[selectedAgent].name}
                    className={styles.chatAvatar}
                    width={40}
                    height={40}
                  />
                  <h2>{agentList[selectedAgent].name}</h2>
                </div>
                <div
                  className={`${styles.chatMessages} ${styles.messageContainer}`}
                  ref={chatContainerRef}
                />
                <div className={styles.chatInput}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    ref={messageInputRef}
                  />
                  <button ref={sendButtonRef}>Send</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://warpcast.com/papa"
          target="_blank"
          rel="noopener noreferrer"
        >
          papa
        </a>
        ,{" "}
        <a
          href="https://github.com/pallasite99"
          target="_blank"
          rel="noopener noreferrer"
        >
          pallasite
        </a>
        ,{" "}
        <a
          href="https://github.com/SamuelAkpah"
          target="_blank"
          rel="noopener noreferrer"
        >
          samuel
        </a>
      </footer>
    </div>
  );
}

// Create a stub Agent class as fallback
class StubAgent implements AgentInterface {
  config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  setupElements(): void {}

  initializeChat(): Promise<void> {
    return Promise.resolve();
  }
}

// Create state management for modules
const useModules = () => {
  const [modules, setModules] = useState<{
    Agent: typeof StubAgent;
    apiBaseUrl: string;
  }>({
    Agent: StubAgent,
    apiBaseUrl: "https://mammothon-backend-papajams-d9d0dedd.koyeb.app",
  });

  useEffect(() => {
    // Only attempt to load modules in the browser
    if (typeof window === "undefined") return;

    const loadModules = async () => {
      try {
        logger.info("Loading modules...");

        // Use direct imports
        const agentsModule = { Agent: StubAgent };
        const configModule = {
          apiBaseUrl: "https://mammothon-backend-papajams-d9d0dedd.koyeb.app",
        };

        // Try to load the real modules if possible
        try {
          if (typeof window !== "undefined") {
            logger.info("Attempting to dynamically import modules...");

            const [realAgentsModule, realConfigModule] = await Promise.all([
              import("../src/lib/agents").catch((e) => {
                logger.error("Failed to import agents module:", e);
                return { Agent: StubAgent };
              }),
              import("../src/lib/config").catch((e) => {
                logger.error("Failed to import config module:", e);
                return {
                  apiBaseUrl:
                    "https://mammothon-backend-papajams-d9d0dedd.koyeb.app",
                };
              }),
            ]);

            logger.info("Dynamic imports completed");
            logger.debug("Agents module loaded:", !!realAgentsModule.Agent);
            logger.debug(
              "Config module loaded:",
              !!realConfigModule.apiBaseUrl
            );

            if (realAgentsModule.Agent) {
              // Cast to any to avoid type issues during build
              agentsModule.Agent = realAgentsModule.Agent as any;
              logger.info("Using real Agent class");
            } else {
              logger.warn("Using stub Agent class");
            }

            if (realConfigModule.apiBaseUrl) {
              configModule.apiBaseUrl = realConfigModule.apiBaseUrl;
              logger.debug("API Base URL:", configModule.apiBaseUrl);
            }
          }
        } catch (e) {
          logger.error("Failed to load dynamic modules:", e);
          // Continue with stub modules
        }

        setModules({
          Agent: agentsModule.Agent as typeof StubAgent,
          apiBaseUrl:
            configModule.apiBaseUrl ||
            "https://mammothon-backend-papajams-d9d0dedd.koyeb.app",
        });

        logger.info("Modules loaded successfully");
        logger.debug("Agent class available:", !!agentsModule.Agent);
        logger.debug("API Base URL:", configModule.apiBaseUrl);
      } catch (error: unknown) {
        logger.error("Failed to load modules:", error);
        // Keep using the default stub modules
      }
    };

    loadModules();
  }, []);

  return modules;
};
