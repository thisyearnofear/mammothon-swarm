import { apiBaseUrl } from "./config.js";

// Add debugging
console.log("Agents.js loaded");
console.log("API Base URL:", apiBaseUrl);

class Agent {
  constructor(config) {
    console.log(`Initializing agent: ${config.name}`);
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.description = config.description;
    this.messages = [];
    this.chatInitialized = false;
    this.setupElements();
    this.setupEventListeners();
  }

  setupElements() {
    console.log(`Setting up elements for ${this.name}`);
    this.button = document.getElementById(`${this.id}-button`);
    this.backdrop = document.getElementById(`${this.id}-backdrop`);
    this.chatContainer = document.getElementById(`${this.id}-chat`);
    this.closeButton = document.getElementById(`${this.id}-close-button`);
    this.chatBody = document.getElementById(`${this.id}-chat-body`);
    this.chatInput = document.getElementById(`${this.id}-chat-input`);
    this.sendButton = document.getElementById(`${this.id}-send-button`);
    this.typingIndicator = document.getElementById(
      `${this.id}-typing-indicator`
    );

    // Check if elements were found
    if (!this.button) console.error(`Button for ${this.name} not found`);
    if (!this.backdrop) console.error(`Backdrop for ${this.name} not found`);
    if (!this.chatContainer)
      console.error(`Chat container for ${this.name} not found`);
  }

  setupEventListeners() {
    this.button.addEventListener("click", () => this.toggleChat());
    this.closeButton.addEventListener("click", () => this.closeChat());
    this.backdrop.addEventListener("click", (e) => {
      if (e.target === this.backdrop) this.closeChat();
    });
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
  }

  toggleChat() {
    this.backdrop.style.display = "flex";
    this.chatContainer.style.display = "flex";
    if (!this.chatInitialized) {
      this.initializeChat();
    }
  }

  closeChat() {
    this.backdrop.style.display = "none";
    this.chatContainer.style.display = "none";
  }

  async initializeChat() {
    this.showTypingIndicator();
    try {
      const response = await fetch(`${apiBaseUrl}/${this.type}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Please provide brief, focused responses. Keep explanations under 3 sentences when possible.",
            },
            {
              role: "user",
              content: `Hello, can you tell me about ${this.name}?`,
            },
          ],
        }),
      });
      const data = await response.json();
      this.hideTypingIndicator();
      this.addMessage(`Hello, can you tell me about ${this.name}?`, "user");
      this.addMessage(data.response, "assistant");
      this.messages.push({
        role: "system",
        content:
          "Please provide brief, focused responses. Keep explanations under 3 sentences when possible.",
      });
      this.messages.push({
        role: "user",
        content: `Hello, can you tell me about ${this.name}?`,
      });
      this.messages.push({
        role: "assistant",
        content: data.response,
      });
      this.chatInitialized = true;
    } catch (error) {
      console.error("Error:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I encountered an error. Please try again later.",
        "assistant"
      );
    }
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (message) {
      this.addMessage(message, "user");
      this.chatInput.value = "";
      this.messages.push({ role: "user", content: message });
      this.showTypingIndicator();

      try {
        const response = await fetch(`${apiBaseUrl}/${this.type}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: this.messages }),
        });
        const data = await response.json();
        this.hideTypingIndicator();
        this.addMessage(data.response, "assistant");
        this.messages.push({ role: "assistant", content: data.response });
      } catch (error) {
        console.error("Error:", error);
        this.hideTypingIndicator();
        this.addMessage(
          "Sorry, I encountered an error. Please try again later.",
          "assistant"
        );
      }
    }
  }

  addMessage(content, role) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "message",
      role === "user" ? "user-message" : "assistant-message"
    );
    messageDiv.innerHTML = content;
    this.chatBody.insertBefore(messageDiv, this.typingIndicator);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = "block";
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }
}

// Agent configurations
const agentConfigs = [
  {
    id: "vocafi",
    name: "VocaFI",
    type: "vocafi",
    description:
      "Voice-controlled DeFi trading with AI-powered chat assistance",
  },
  {
    id: "wooly",
    name: "Wooly",
    type: "wooly",
    description: "Your guide to the Mammothon Agent Swarm project",
  },
  {
    id: "clarity",
    name: "Clarity",
    type: "clarity",
    description: "Blockchain-powered payment gateway for authentic reviews",
  },
  {
    id: "hwc",
    name: "Worldie",
    type: "hwc",
    description: "Your friendly guide to getting started with Ethereum",
  },
];

// Initialize agents when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const agents = agentConfigs.map((config) => new Agent(config));
});
