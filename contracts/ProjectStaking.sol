// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IBuilderNFT {
    function getTokensByProject(string calldata projectId) external view returns (uint256[] memory);
    function getGithubUsernameByToken(uint256 tokenId) external view returns (string memory);
    function getRepoByToken(uint256 tokenId) external view returns (string memory);
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

/**
 * @title ProjectStaking
 * @dev A staking contract for Mammothon projects that allows staking on specific builder NFTs
 */
contract ProjectStaking is Ownable {
    using Strings for string;
    
    // Staking information
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    // Project information
    struct Project {
        string id;
        string name;
        uint256 totalStaked;
        uint256 stakersCount;
        bool active;
    }
    
    // Builder NFT staking information
    struct BuilderStake {
        uint256 tokenId;
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    // Builder NFT information
    struct BuilderNFT {
        uint256 tokenId;
        string githubUsername;
        string repoName;
        uint256 totalStaked;
        uint256 stakersCount;
    }
    
    // Reference to the BuilderNFT contract
    IBuilderNFT public builderNFTContract;
    
    // Mapping from project ID to Project
    mapping(string => Project) public projects;
    
    // Mapping from project ID to staker address to Stake (for project-level staking)
    mapping(string => mapping(address => Stake)) public stakes;
    
    // Mapping from token ID to BuilderNFT info
    mapping(uint256 => BuilderNFT) public builderNFTs;
    
    // Mapping from token ID to staker address to BuilderStake (for builder-level staking)
    mapping(uint256 => mapping(address => BuilderStake)) public builderStakes;
    
    // Array of project IDs
    string[] public projectIds;
    
    // Array of builder NFT token IDs
    uint256[] public builderNFTIds;
    
    // Mapping from normalized project ID to original project ID
    mapping(string => string) private normalizedToOriginal;
    
    // Events
    event ProjectAdded(string projectId, string name);
    event Staked(address staker, string projectId, uint256 amount);
    event Unstaked(address staker, string projectId, uint256 amount);
    event BuilderNFTStaked(address staker, uint256 tokenId, uint256 amount, string projectId);
    event BuilderNFTUnstaked(address staker, uint256 tokenId, uint256 amount, string projectId);
    event BuilderNFTAdded(uint256 tokenId, string githubUsername, string repoName, string projectId);
    
    constructor(address _builderNFTAddress) Ownable(msg.sender) {
        builderNFTContract = IBuilderNFT(_builderNFTAddress);
        
        // Initialize default projects
        _addProject("vocafi", "VocaFI");
        _addProject("clarity", "Clarity");
        _addProject("worldie", "Hello World Computer");
        _addProject("mammothon", "Mammothon");
        
        // Initialize builder NFTs for each project
        _syncBuilderNFTs("vocafi");
        _syncBuilderNFTs("clarity");
        _syncBuilderNFTs("worldie");
        _syncBuilderNFTs("mammothon");
    }
    
    /**
     * @dev Internal function to add a new project
     * @param projectId The ID of the project
     * @param name The name of the project
     */
    function _addProject(string memory projectId, string memory name) internal {
        string memory normalizedId = _normalizeProjectId(projectId);
        
        // Check if project already exists by normalized ID
        require(bytes(normalizedToOriginal[normalizedId]).length == 0, "Project already exists");
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            totalStaked: 0,
            stakersCount: 0,
            active: true
        });
        
        projectIds.push(projectId);
        normalizedToOriginal[normalizedId] = projectId;
        
        emit ProjectAdded(projectId, name);
    }
    
    /**
     * @dev Add a new project
     * @param projectId The ID of the project
     * @param name The name of the project
     */
    function addProject(string memory projectId, string memory name) public onlyOwner {
        _addProject(projectId, name);
        
        // Sync builder NFTs for this project
        _syncBuilderNFTs(projectId);
    }
    
    /**
     * @dev Sync builder NFTs for a project from the BuilderNFT contract
     * @param projectId The ID of the project
     */
    function _syncBuilderNFTs(string memory projectId) internal {
        uint256[] memory tokenIds = builderNFTContract.getTokensByProject(projectId);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            // Skip if already added
            if (builderNFTs[tokenId].tokenId == tokenId) {
                continue;
            }
            
            string memory githubUsername = builderNFTContract.getGithubUsernameByToken(tokenId);
            string memory repoName = builderNFTContract.getRepoByToken(tokenId);
            
            builderNFTs[tokenId] = BuilderNFT({
                tokenId: tokenId,
                githubUsername: githubUsername,
                repoName: repoName,
                totalStaked: 0,
                stakersCount: 0
            });
            
            builderNFTIds.push(tokenId);
            
            emit BuilderNFTAdded(tokenId, githubUsername, repoName, projectId);
        }
    }
    
    /**
     * @dev Manually sync builder NFTs for a project
     * @param projectId The ID of the project
     */
    function syncBuilderNFTs(string memory projectId) public {
        string memory originalId = _getOriginalProjectId(projectId);
        require(bytes(projects[originalId].id).length > 0, "Project does not exist");
        
        _syncBuilderNFTs(originalId);
    }
    
    /**
     * @dev Normalize a project ID to handle case sensitivity and common variations
     * @param projectId The project ID to normalize
     * @return The normalized project ID
     */
    function _normalizeProjectId(string memory projectId) internal pure returns (string memory) {
        // Convert to lowercase (this is a simplified version since Solidity doesn't have native case conversion)
        bytes memory projectIdBytes = bytes(projectId);
        bytes memory result = new bytes(projectIdBytes.length);
        
        for (uint i = 0; i < projectIdBytes.length; i++) {
            // Convert uppercase to lowercase
            if (projectIdBytes[i] >= 0x41 && projectIdBytes[i] <= 0x5A) {
                result[i] = bytes1(uint8(projectIdBytes[i]) + 32);
            } else {
                result[i] = projectIdBytes[i];
            }
        }
        
        return string(result);
    }
    
    /**
     * @dev Get the original project ID from a potentially non-normalized input
     * @param projectId The input project ID
     * @return The original project ID if found, or the input if not found
     */
    function _getOriginalProjectId(string memory projectId) internal view returns (string memory) {
        string memory normalizedId = _normalizeProjectId(projectId);
        string memory originalId = normalizedToOriginal[normalizedId];
        
        // If we found a mapping, return the original ID
        if (bytes(originalId).length > 0) {
            return originalId;
        }
        
        // Otherwise, return the input as-is
        return projectId;
    }
    
    /**
     * @dev Check if a project exists
     * @param projectId The ID of the project
     * @return Whether the project exists
     */
    function projectExists(string memory projectId) public view returns (bool) {
        string memory originalId = _getOriginalProjectId(projectId);
        return bytes(projects[originalId].id).length > 0;
    }
    
    /**
     * @dev Stake MON on a project
     * @param projectId The ID of the project
     */
    function stake(string memory projectId) public payable {
        string memory originalId = _getOriginalProjectId(projectId);
        require(bytes(projects[originalId].id).length > 0, "Project does not exist");
        require(projects[originalId].active, "Project is not active");
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        Stake storage userStake = stakes[originalId][msg.sender];
        
        // If this is a new stake for this user on this project
        if (!userStake.active) {
            projects[originalId].stakersCount++;
        }
        
        // Update stake
        userStake.amount += msg.value;
        userStake.timestamp = block.timestamp;
        userStake.active = true;
        
        // Update project
        projects[originalId].totalStaked += msg.value;
        
        emit Staked(msg.sender, originalId, msg.value);
    }
    
    /**
     * @dev Stake MON on a specific builder NFT
     * @param tokenId The token ID of the builder NFT
     */
    function stakeOnBuilderNFT(uint256 tokenId) public payable {
        require(builderNFTs[tokenId].tokenId == tokenId, "Builder NFT does not exist");
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        BuilderStake storage userStake = builderStakes[tokenId][msg.sender];
        
        // If this is a new stake for this user on this builder NFT
        if (!userStake.active) {
            builderNFTs[tokenId].stakersCount++;
        }
        
        // Update stake
        userStake.tokenId = tokenId;
        userStake.amount += msg.value;
        userStake.timestamp = block.timestamp;
        userStake.active = true;
        
        // Update builder NFT
        builderNFTs[tokenId].totalStaked += msg.value;
        
        // Get project ID for the event
        uint256[] memory projectTokens;
        string memory projectId = "";
        
        for (uint256 i = 0; i < projectIds.length; i++) {
            projectTokens = builderNFTContract.getTokensByProject(projectIds[i]);
            for (uint256 j = 0; j < projectTokens.length; j++) {
                if (projectTokens[j] == tokenId) {
                    projectId = projectIds[i];
                    break;
                }
            }
            if (bytes(projectId).length > 0) {
                break;
            }
        }
        
        emit BuilderNFTStaked(msg.sender, tokenId, msg.value, projectId);
    }
    
    /**
     * @dev Unstake MON from a project
     * @param projectId The ID of the project
     * @param amount The amount to unstake
     */
    function unstake(string memory projectId, uint256 amount) public {
        string memory originalId = _getOriginalProjectId(projectId);
        require(bytes(projects[originalId].id).length > 0, "Project does not exist");
        
        Stake storage userStake = stakes[originalId][msg.sender];
        require(userStake.active, "No active stake");
        require(userStake.amount >= amount, "Insufficient stake");
        
        // Update stake
        userStake.amount -= amount;
        
        // If stake is now 0, mark as inactive
        if (userStake.amount == 0) {
            userStake.active = false;
            projects[originalId].stakersCount--;
        }
        
        // Update project
        projects[originalId].totalStaked -= amount;
        
        // Transfer MON back to staker
        payable(msg.sender).transfer(amount);
        
        emit Unstaked(msg.sender, originalId, amount);
    }
    
    /**
     * @dev Unstake MON from a builder NFT
     * @param tokenId The token ID of the builder NFT
     * @param amount The amount to unstake
     */
    function unstakeFromBuilderNFT(uint256 tokenId, uint256 amount) public {
        require(builderNFTs[tokenId].tokenId == tokenId, "Builder NFT does not exist");
        
        BuilderStake storage userStake = builderStakes[tokenId][msg.sender];
        require(userStake.active, "No active stake");
        require(userStake.amount >= amount, "Insufficient stake");
        
        // Update stake
        userStake.amount -= amount;
        
        // If stake is now 0, mark as inactive
        if (userStake.amount == 0) {
            userStake.active = false;
            builderNFTs[tokenId].stakersCount--;
        }
        
        // Update builder NFT
        builderNFTs[tokenId].totalStaked -= amount;
        
        // Transfer MON back to staker
        payable(msg.sender).transfer(amount);
        
        // Get project ID for the event
        uint256[] memory projectTokens;
        string memory projectId = "";
        
        for (uint256 i = 0; i < projectIds.length; i++) {
            projectTokens = builderNFTContract.getTokensByProject(projectIds[i]);
            for (uint256 j = 0; j < projectTokens.length; j++) {
                if (projectTokens[j] == tokenId) {
                    projectId = projectIds[i];
                    break;
                }
            }
            if (bytes(projectId).length > 0) {
                break;
            }
        }
        
        emit BuilderNFTUnstaked(msg.sender, tokenId, amount, projectId);
    }
    
    /**
     * @dev Get stake information for a user on a project
     * @param projectId The ID of the project
     * @param staker The address of the staker
     * @return amount The amount staked
     * @return timestamp The timestamp of the stake
     * @return active Whether the stake is active
     */
    function getStake(string memory projectId, address staker) public view returns (uint256 amount, uint256 timestamp, bool active) {
        string memory originalId = _getOriginalProjectId(projectId);
        Stake memory userStake = stakes[originalId][staker];
        return (userStake.amount, userStake.timestamp, userStake.active);
    }
    
    /**
     * @dev Get stake information for a user on a builder NFT
     * @param tokenId The token ID of the builder NFT
     * @param staker The address of the staker
     * @return amount The amount staked
     * @return timestamp The timestamp of the stake
     * @return active Whether the stake is active
     */
    function getBuilderNFTStake(uint256 tokenId, address staker) public view returns (uint256 amount, uint256 timestamp, bool active) {
        BuilderStake memory userStake = builderStakes[tokenId][staker];
        return (userStake.amount, userStake.timestamp, userStake.active);
    }
    
    /**
     * @dev Get project information
     * @param projectId The ID of the project
     * @return id The ID of the project
     * @return name The name of the project
     * @return totalStaked The total amount staked on the project
     * @return stakersCount The number of stakers on the project
     * @return active Whether the project is active
     */
    function getProject(string memory projectId) public view returns (string memory id, string memory name, uint256 totalStaked, uint256 stakersCount, bool active) {
        string memory originalId = _getOriginalProjectId(projectId);
        Project memory project = projects[originalId];
        return (project.id, project.name, project.totalStaked, project.stakersCount, project.active);
    }
    
    /**
     * @dev Get builder NFT information
     * @param tokenId The token ID of the builder NFT
     * @return tokenId The token ID
     * @return githubUsername The GitHub username of the builder
     * @return repoName The repository name
     * @return totalStaked The total amount staked on the builder NFT
     * @return stakersCount The number of stakers on the builder NFT
     */
    function getBuilderNFT(uint256 tokenId) public view returns (uint256, string memory githubUsername, string memory repoName, uint256 totalStaked, uint256 stakersCount) {
        BuilderNFT memory builderNFT = builderNFTs[tokenId];
        return (builderNFT.tokenId, builderNFT.githubUsername, builderNFT.repoName, builderNFT.totalStaked, builderNFT.stakersCount);
    }
    
    /**
     * @dev Get all project IDs
     * @return An array of project IDs
     */
    function getAllProjectIds() public view returns (string[] memory) {
        return projectIds;
    }
    
    /**
     * @dev Get all builder NFT token IDs
     * @return An array of builder NFT token IDs
     */
    function getAllBuilderNFTIds() public view returns (uint256[] memory) {
        return builderNFTIds;
    }
    
    /**
     * @dev Get builder NFT token IDs for a specific project
     * @param projectId The ID of the project
     * @return An array of builder NFT token IDs
     */
    function getBuilderNFTsByProject(string memory projectId) public view returns (uint256[] memory) {
        string memory originalId = _getOriginalProjectId(projectId);
        return builderNFTContract.getTokensByProject(originalId);
    }
} 