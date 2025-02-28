// GitHub Activity Tracker for Mammothon
// This script fetches basic GitHub metrics for tracked projects

require("dotenv").config();
const axios = require("axios");

// GitHub API token (optional but recommended to avoid rate limits)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// List of projects to track
const TRACKED_PROJECTS = [
  { owner: "Mazzz-zzz", repo: "voca.fi", name: "VocaFI" },
  { owner: "udingethe", repo: "mammothon-agent-swarm", name: "Mammothon" },
  // Add other projects here
];

// Headers for GitHub API requests
const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

/**
 * Get basic repository information
 */
async function getRepoInfo(owner, repo) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );
    return {
      stars: response.data.stargazers_count,
      forks: response.data.forks_count,
      watchers: response.data.watchers_count,
      open_issues: response.data.open_issues_count,
      last_updated: response.data.updated_at,
    };
  } catch (error) {
    console.error(
      `Error fetching repo info for ${owner}/${repo}:`,
      error.message
    );
    return null;
  }
}

/**
 * Get recent commits
 */
async function getRecentCommits(owner, repo, count = 5) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${count}`,
      { headers }
    );
    return response.data.map((commit) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split("\n")[0], // First line of commit message
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    }));
  } catch (error) {
    console.error(
      `Error fetching commits for ${owner}/${repo}:`,
      error.message
    );
    return [];
  }
}

/**
 * Get recent forks
 */
async function getRecentForks(owner, repo, count = 5) {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/forks?per_page=${count}&sort=newest`,
      { headers }
    );
    return response.data.map((fork) => ({
      owner: fork.owner.login,
      full_name: fork.full_name,
      created_at: fork.created_at,
      url: fork.html_url,
    }));
  } catch (error) {
    console.error(`Error fetching forks for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Main function to track all projects
 */
async function trackProjects() {
  console.log("🔍 Tracking GitHub activity for Mammothon projects...\n");

  for (const project of TRACKED_PROJECTS) {
    console.log(
      `\n📊 Project: ${project.name} (${project.owner}/${project.repo})`
    );
    console.log("----------------------------------------");

    // Get basic repo info
    const repoInfo = await getRepoInfo(project.owner, project.repo);
    if (repoInfo) {
      console.log(
        `Stars: ${repoInfo.stars} | Forks: ${repoInfo.forks} | Open Issues: ${repoInfo.open_issues}`
      );
      console.log(
        `Last Updated: ${new Date(repoInfo.last_updated).toLocaleString()}`
      );
    }

    // Get recent commits
    const commits = await getRecentCommits(project.owner, project.repo);
    if (commits.length > 0) {
      console.log("\nRecent Commits:");
      commits.forEach((commit) => {
        console.log(
          `- [${commit.sha}] ${commit.message} (${commit.author}, ${new Date(
            commit.date
          ).toLocaleString()})`
        );
      });
    }

    // Get recent forks
    const forks = await getRecentForks(project.owner, project.repo);
    if (forks.length > 0) {
      console.log("\nRecent Forks:");
      forks.forEach((fork) => {
        console.log(
          `- ${fork.full_name} (${new Date(fork.created_at).toLocaleString()})`
        );
        console.log(`  URL: ${fork.url}`);
      });
    }
  }
}

// Run the tracker
trackProjects().catch((error) => {
  console.error("Error tracking projects:", error);
});

// Export functions for use in API
module.exports = {
  getRepoInfo,
  getRecentCommits,
  getRecentForks,
  trackProjects,
};
