// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ProjectStaking
 * @dev A simple staking contract for Mammothon projects
 */
contract ProjectStaking is Ownable {
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
    
    // Mapping from project ID to Project
    mapping(string => Project) public projects;
    
    // Mapping from project ID to staker address to Stake
    mapping(string => mapping(address => Stake)) public stakes;
    
    // Array of project IDs
    string[] public projectIds;
    
    // Events
    event ProjectAdded(string projectId, string name);
    event Staked(address staker, string projectId, uint256 amount);
    event Unstaked(address staker, string projectId, uint256 amount);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Add a new project
     * @param projectId The ID of the project
     * @param name The name of the project
     */
    function addProject(string memory projectId, string memory name) public onlyOwner {
        require(bytes(projects[projectId].id).length == 0, "Project already exists");
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            totalStaked: 0,
            stakersCount: 0,
            active: true
        });
        
        projectIds.push(projectId);
        
        emit ProjectAdded(projectId, name);
    }
    
    /**
     * @dev Stake ETH on a project
     * @param projectId The ID of the project
     */
    function stake(string memory projectId) public payable {
        require(bytes(projects[projectId].id).length > 0, "Project does not exist");
        require(projects[projectId].active, "Project is not active");
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        Stake storage userStake = stakes[projectId][msg.sender];
        
        // If this is a new stake for this user on this project
        if (!userStake.active) {
            projects[projectId].stakersCount++;
        }
        
        // Update stake
        userStake.amount += msg.value;
        userStake.timestamp = block.timestamp;
        userStake.active = true;
        
        // Update project
        projects[projectId].totalStaked += msg.value;
        
        emit Staked(msg.sender, projectId, msg.value);
    }
    
    /**
     * @dev Unstake ETH from a project
     * @param projectId The ID of the project
     * @param amount The amount to unstake
     */
    function unstake(string memory projectId, uint256 amount) public {
        require(bytes(projects[projectId].id).length > 0, "Project does not exist");
        
        Stake storage userStake = stakes[projectId][msg.sender];
        require(userStake.active, "No active stake");
        require(userStake.amount >= amount, "Insufficient stake");
        
        // Update stake
        userStake.amount -= amount;
        
        // If stake is now 0, mark as inactive
        if (userStake.amount == 0) {
            userStake.active = false;
            projects[projectId].stakersCount--;
        }
        
        // Update project
        projects[projectId].totalStaked -= amount;
        
        // Transfer ETH back to staker
        payable(msg.sender).transfer(amount);
        
        emit Unstaked(msg.sender, projectId, amount);
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
        Stake memory userStake = stakes[projectId][staker];
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
        Project memory project = projects[projectId];
        return (project.id, project.name, project.totalStaked, project.stakersCount, project.active);
    }
    
    /**
     * @dev Get all project IDs
     * @return An array of project IDs
     */
    function getAllProjectIds() public view returns (string[] memory) {
        return projectIds;
    }
} 