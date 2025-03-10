import os
import swarmnode
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv()

# Load API keys from environment variables
swarmnode.api_key = os.getenv("SWARMNODE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")
github_token = os.getenv("GITHUB_TOKEN", "")

# Configure Gemini
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    # Set default safety settings for Gemini - make them less restrictive
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_NONE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_NONE"
        }
    ]

# Define message models for chat
class Message(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class ChatResponse(BaseModel):
    response: str
    project_info: Optional[dict] = None

class BaseAgent:
    """Base class for all agents in the Mammothon Agent Swarm."""
    
    def __init__(self, name: str, agent_type: str, description: str, project_info: Dict[str, Any]):
        """Initialize the agent with basic information."""
        self.name = name
        self.type = agent_type
        self.description = description
        self.project_info = project_info
        self.system_prompt = ""
        
        # Set up links for the agent
        self.links_html = self._generate_links_html()
    
    def _generate_links_html(self) -> str:
        """Generate HTML for project links."""
        links_html = '<div class="agent-links">'
        
        if "github_repo" in self.project_info:
            links_html += f'<p><strong>GitHub:</strong> <a href="{self.project_info["github_repo"]}" target="_blank" rel="noopener noreferrer">{self.project_info["github_repo"]}</a></p>'
        
        if "project_url" in self.project_info:
            links_html += f'<p><strong>Project:</strong> <a href="{self.project_info["project_url"]}" target="_blank" rel="noopener noreferrer">{self.project_info["project_url"]}</a></p>'
        
        if "hackathon_link" in self.project_info:
            links_html += f'<p><strong>Hackathon:</strong> <a href="{self.project_info["hackathon_link"]}" target="_blank" rel="noopener noreferrer">View Submission</a></p>'
        
        links_html += '</div>'
        return links_html
    
    def get_github_data(self) -> Dict[str, Any]:
        """Fetch GitHub data for the project if a GitHub repo is specified."""
        if "github_repo" not in self.project_info:
            return {}

        github_url = self.project_info["github_repo"]
        if not github_url:
            return {}

        # Extract owner and repo from GitHub URL
        parts = github_url.strip('/').split('/')
        if len(parts) < 5:
            return {}

        owner = parts[-2]
        repo = parts[-1]

        # Headers for GitHub API requests
        headers = {"Authorization": f"token {github_token}"} if github_token else {}

        try:
            return self._extracted_from_get_github_data_23(owner, repo, headers)
        except Exception as e:
            print(f"Error fetching GitHub data: {e}")
            return {}

    # TODO Rename this here and in `get_github_data`
    def _extracted_from_get_github_data_23(self, owner, repo, headers):
        # Get repo info
        repo_response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=headers
        )
        repo_data = repo_response.json() if repo_response.status_code == 200 else {}

        # Get recent commits
        commits_response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=5",
            headers=headers
        )
        commits_data = commits_response.json() if commits_response.status_code == 200 else []

        # Get recent forks
        forks_response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/forks?per_page=5&sort=newest",
            headers=headers
        )
        forks_data = forks_response.json() if forks_response.status_code == 200 else []

        # Format the data
        github_data = {
            "repo_info": {
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "watchers": repo_data.get("watchers_count", 0),
                "open_issues": repo_data.get("open_issues_count", 0),
                "last_updated": repo_data.get("updated_at", "")
            },
            "recent_commits": [
                {
                    "message": commit.get("commit", {}).get("message", "").split("\n")[0],
                    "author": commit.get("commit", {}).get("author", {}).get("name", ""),
                    "date": commit.get("commit", {}).get("author", {}).get("date", "")
                } for commit in commits_data[:5]
            ],
            "recent_forks": [
                {
                    "owner": fork.get("owner", {}).get("login", ""),
                    "full_name": fork.get("full_name", ""),
                    "created_at": fork.get("created_at", "")
                } for fork in forks_data[:5]
            ]
        }

        return github_data
    
    def get_github_summary(self) -> str:
        """Generate a human-readable summary of GitHub activity."""
        github_data = self.get_github_data()
        if not github_data:
            return ""
        
        repo_info = github_data.get("repo_info", {})
        recent_commits = github_data.get("recent_commits", [])
        recent_forks = github_data.get("recent_forks", [])
        
        summary = []
        
        # Repo stats
        if repo_info:
            summary.append(f"GitHub Stats: {repo_info.get('stars', 0)} stars, {repo_info.get('forks', 0)} forks, {repo_info.get('open_issues', 0)} open issues")
        
        # Recent commits
        if recent_commits:
            summary.append("Recent Activity:")
            for commit in recent_commits[:3]:  # Show only the 3 most recent commits
                author = commit.get("author", "")
                message = commit.get("message", "")
                if author and message:
                    summary.append(f"- {author}: {message}")
        
        # Recent forks
        if recent_forks:
            fork_count = len(recent_forks)
            summary.append(f"Recent Forks: {fork_count} developer{'s' if fork_count != 1 else ''} recently forked this project")
            
        return "\n".join(summary)
    
    def get_chat_response(self, messages: List[Message], model_type: str = "gemini") -> str:
        """Generate a response to a chat message using either OpenAI or Gemini."""
        if not self.system_prompt:
            raise NotImplementedError("System prompt must be defined in the child class")

        # Extract just the content from the messages
        conversation_history = []
        for msg in messages:
            if msg.role == "user":
                conversation_history.append(f"User: {msg.content}")
            else:
                conversation_history.append(f"Assistant: {msg.content}")

        conversation_text = "\n".join(conversation_history)

        # Get the last user message
        last_user_message = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")

        # Check if the user is asking about GitHub activity or project progress
        github_keywords = ["progress", "activity", "github", "fork", "commit", "star", "contributor", "development", "momentum"]
        should_include_github = any(keyword in last_user_message.lower() for keyword in github_keywords)

        github_summary = self.get_github_summary() if should_include_github else ""
        # Enhance the prompt with GitHub data if available
        enhanced_prompt = self.system_prompt
        if github_summary:
            enhanced_prompt += f"\n\nCurrent GitHub Activity:\n{github_summary}\n\nIncorporate this GitHub data naturally in your response if the user is asking about project progress or activity."

        # Add common response structure
        enhanced_prompt += """
        
        Response Guidelines:
        1. Keep responses brief and direct - users prefer short answers
        2. Focus on explaining what makes this project unique and valuable
        3. If users want more details, they'll ask follow-up questions
        4. If users have questions about staking, NFTs, or the overall platform, direct them to speak with Wooly
        5. End each response with a clear call to action:
           - Fork and build: "Ready to build? Fork our code and mint a builder NFT"
           - Stake: "Support this project by staking MON tokens"
        """

        if model_type == "openai" and openai_api_key:
            try:
                model = ChatOpenAI(api_key=openai_api_key, model="gpt-4")
                messages_for_model = [
                    SystemMessage(content=enhanced_prompt),
                    HumanMessage(content=f"Conversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the {self.name} agent:")
                ]
                response = model.invoke(messages_for_model)
                return response.content
            except Exception as e:
                print(f"OpenAI error: {e}")
                # Fall back to Gemini if OpenAI fails
                if gemini_api_key:
                    model_type = "gemini"
                else:
                    return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."

        if model_type == "gemini" and gemini_api_key:
            try:
                # Use the correct model name for Gemini Pro
                print(f"Using Gemini API with key: {gemini_api_key[:5]}...")
                model = genai.GenerativeModel('gemini-1.5-pro')
                prompt = f"{enhanced_prompt}\n\nConversation history:\n{conversation_text}\n\nUser's latest message: {last_user_message}\n\nRespond as the {self.name} agent:"

                print(f"Sending prompt to Gemini: {prompt[:100]}...")
                print(f"Safety settings: {safety_settings}")

                # Add error handling for the response
                try:
                    response = model.generate_content(
                        prompt,
                        safety_settings=safety_settings,
                        generation_config={
                            "temperature": 0.7,
                            "top_p": 0.8,
                            "top_k": 40,
                            "max_output_tokens": 2048
                        }
                    )

                    if not response.text:
                        print("Empty response from Gemini")
                        return "I'm sorry, I received an empty response. Please try again."

                    print(f"Received response from Gemini: {response.text[:100]}...")
                    return response.text
                except Exception as content_error:
                    return self._extracted_from_get_chat_response_94(
                        'Gemini content generation error: ',
                        content_error,
                        "I'm sorry, I had trouble generating a response. Please try again.",
                    )
            except Exception as e:
                return self._extracted_from_get_chat_response_94(
                    'Gemini error: ',
                    e,
                    "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later.",
                )
        return "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again later."

    # TODO Rename this here and in `get_chat_response`
    def _extracted_from_get_chat_response_94(self, arg0, arg1, arg2):
        print(f"{arg0}{arg1}")
        print(f"Error type: {type(arg1)}")
        print(f"Error details: {str(arg1)}")
        return arg2
    
    def process_chat_request(self, request: ChatRequest, model_type: str = "gemini") -> ChatResponse:
        """Process a chat request and return a response."""
        if model_type not in ["openai", "gemini"]:
            raise HTTPException(status_code=400, detail="Invalid model type. Use 'openai' or 'gemini'.")
        
        # Generate response
        response = self.get_chat_response(request.messages, model_type)
        
        # For the first message, add project links if they're not already included
        is_first_message = len(request.messages) <= 1
        if is_first_message and "<a href='" not in response:
            response += self.links_html
        
        return ChatResponse(
            response=response,
            project_info=self.project_info if is_first_message else None
        ) 