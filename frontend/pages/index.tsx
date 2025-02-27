import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { Agent } from "../lib/agents";
import { apiBaseUrl } from "../lib/config";

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
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
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
        const response = await fetch(`${apiBaseUrl}/health`);
        if (response.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (error) {
        console.error("Error checking API status:", error);
        setApiStatus("offline");
      }
    };

    checkApiStatus();
  }, []);

  // Initialize agents
  useEffect(() => {
    if (apiStatus === "online") {
      // No need to initialize agents here anymore since we create them on demand
      // when user selects an agent
    }
  }, [apiStatus]);

  // Initialize chat when active agent changes
  useEffect(() => {
    if (
      activeAgent &&
      chatContainerRef.current &&
      messageInputRef.current &&
      sendButtonRef.current
    ) {
      // Set up the agent with the DOM elements
      activeAgent.setupElements(
        chatContainerRef.current,
        messageInputRef.current,
        sendButtonRef.current
      );

      // Initialize the chat
      activeAgent.initializeChat().catch((error) => {
        console.error("Error initializing chat:", error);
        // Add error handling UI if needed
      });
    }
  }, [activeAgent]);

  // Handle agent selection
  const selectAgent = (agentId: string) => {
    if (!agentList[agentId]) return;

    const newAgent = new Agent({
      id: agentId,
      name: agentList[agentId].name,
      description: agentList[agentId].description,
      avatarUrl: agentList[agentId].avatar,
    });

    setSelectedAgent(agentId);
    setActiveAgent(newAgent);
  };

  const handleBack = () => {
    setSelectedAgent(null);
    setActiveAgent(null);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Mammothon Agent Swarm</title>
        <meta
          name="description"
          content="AI agents for abandoned hackathon projects"
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
