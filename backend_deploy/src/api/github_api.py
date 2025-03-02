import os
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Create router
router = APIRouter(prefix="/github", tags=["github"])

# GitHub API token (optional but recommended to avoid rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# Headers for GitHub API requests
headers = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

# List of projects to track
TRACKED_PROJECTS = [
    {"owner": "Mazzz-zzz", "repo": "voca.fi", "name": "VocaFI"},
    {"owner": "Royleong31", "repo": "Clarity", "name": "Clarity"},
    {"owner": "azf20", "repo": "hello-world-computer", "name": "Hello World Computer"},
    {"owner": "thisyearnofear", "repo": "mammothon-swarm", "name": "Mammothon"},
]

# Response models
class RepoInfo(BaseModel):
    name: str
    owner: str
    repo: str
    stars: int
    forks: int
    watchers: int
    open_issues: int
    last_updated: str

class Commit(BaseModel):
    sha: str
    message: str
    author: str
    date: str

class Fork(BaseModel):
    owner: str
    full_name: str
    created_at: str
    url: str

class ProjectActivity(BaseModel):
    repo_info: Optional[RepoInfo] = None
    recent_commits: List[Commit] = []
    recent_forks: List[Fork] = []

# Helper functions
def get_repo_info(owner: str, repo: str) -> Optional[Dict[str, Any]]:
    """Get basic repository information"""
    try:
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        return {
            "name": data.get("name"),
            "owner": owner,
            "repo": repo,
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "watchers": data.get("watchers_count", 0),
            "open_issues": data.get("open_issues_count", 0),
            "last_updated": data.get("updated_at", "")
        }
    except Exception as e:
        print(f"Error fetching repo info for {owner}/{repo}: {str(e)}")
        return None

def get_recent_commits(owner: str, repo: str, count: int = 5) -> List[Dict[str, Any]]:
    """Get recent commits"""
    try:
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/commits?per_page={count}",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        return [
            {
                "sha": commit.get("sha", "")[:7],
                "message": commit.get("commit", {}).get("message", "").split("\n")[0],
                "author": commit.get("commit", {}).get("author", {}).get("name", ""),
                "date": commit.get("commit", {}).get("author", {}).get("date", "")
            }
            for commit in data
        ]
    except Exception as e:
        print(f"Error fetching commits for {owner}/{repo}: {str(e)}")
        return []

def get_recent_forks(owner: str, repo: str, count: int = 5) -> List[Dict[str, Any]]:
    """Get recent forks"""
    try:
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}/forks?per_page={count}&sort=newest",
            headers=headers
        )
        response.raise_for_status()
        data = response.json()
        return [
            {
                "owner": fork.get("owner", {}).get("login", ""),
                "full_name": fork.get("full_name", ""),
                "created_at": fork.get("created_at", ""),
                "url": fork.get("html_url", "")
            }
            for fork in data
        ]
    except Exception as e:
        print(f"Error fetching forks for {owner}/{repo}: {str(e)}")
        return []

# API endpoints
@router.get("/projects", response_model=List[Dict[str, str]])
async def list_projects():
    """List all tracked projects"""
    return TRACKED_PROJECTS

@router.get("/project/{owner}/{repo}", response_model=ProjectActivity)
async def get_project_activity(owner: str, repo: str):
    """Get activity for a specific project"""
    # Check if project is tracked
    project = next((p for p in TRACKED_PROJECTS if p["owner"] == owner and p["repo"] == repo), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found in tracked projects")
    
    # Get project activity
    repo_info = get_repo_info(owner, repo)
    recent_commits = get_recent_commits(owner, repo)
    recent_forks = get_recent_forks(owner, repo)
    
    return {
        "repo_info": repo_info,
        "recent_commits": recent_commits,
        "recent_forks": recent_forks
    }

@router.get("/activity", response_model=Dict[str, ProjectActivity])
async def get_all_activity():
    """Get activity for all tracked projects"""
    result = {}
    
    for project in TRACKED_PROJECTS:
        owner = project["owner"]
        repo = project["repo"]
        name = project["name"]
        
        repo_info = get_repo_info(owner, repo)
        recent_commits = get_recent_commits(owner, repo)
        recent_forks = get_recent_forks(owner, repo)
        
        result[name] = {
            "repo_info": repo_info,
            "recent_commits": recent_commits,
            "recent_forks": recent_forks
        }
    
    return result 