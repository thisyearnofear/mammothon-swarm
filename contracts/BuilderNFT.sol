// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable2Step.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC1155/ERC1155.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/security/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/Strings.sol";

/**
 * @title BuilderNFT
 * @dev A simplified ERC1155 contract for issuing NFTs to builders who contribute to projects.
 * This version allows multiple mints for the same GitHub username and project combination.
 */
contract BuilderNFT is ERC1155URIStorage, Ownable2Step, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Maximum metadata URI length to prevent gas issues
    uint256 public constant MAX_URI_LENGTH = 2048;
    
    // Price for minting an NFT (in wei)
    uint256 public mintPrice = 0.001 ether;
    
    // Mapping from token ID to project ID
    mapping(uint256 => bytes32) public tokenToProject;
    
    // Mapping from token ID to repository name
    mapping(uint256 => string) public tokenToRepo;
    
    // Mapping from token ID to GitHub username
    mapping(uint256 => string) public tokenToGithubUsername;
    
    // Mapping from GitHub username to token IDs
    mapping(string => uint256[]) private _githubToTokens;
    
    // Mapping from project ID to token IDs
    mapping(bytes32 => uint256[]) private _projectToTokens;
    
    // Contract metadata URI for OpenSea and other platforms
    string private _contractMetadataURI;
    
    // Flag to enable/disable minting
    bool public mintingEnabled = true;
    
    // Events
    event BuilderNFTMinted(uint256 indexed tokenId, address indexed recipient, string githubUsername, bytes32 indexed projectId, string repoName);
    event MintPriceUpdated(uint256 newPrice);
    event FundsWithdrawn(address to, uint256 amount);
    
    /**
     * @dev Constructor initializes the contract with a base URI.
     * @param baseURI Base URI for token metadata.
     */
    constructor(string memory baseURI) ERC1155(baseURI) {
        // Initialize with base URI
    }
    
    /**
     * @dev Modifier to check if minting is enabled.
     */
    modifier whenMintingEnabled() {
        require(mintingEnabled, "BuilderNFT: minting is disabled");
        _;
    }
    
    /**
     * @dev Set the price for minting an NFT.
     * @param newPrice The new price in wei.
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @dev Withdraw funds from the contract to the owner.
     * @param amount The amount to withdraw (0 for all).
     */
    function withdrawFunds(uint256 amount) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "BuilderNFT: no funds to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "BuilderNFT: insufficient funds");
        
        (bool success, ) = payable(owner()).call{value: withdrawAmount}("");
        require(success, "BuilderNFT: withdrawal failed");
        
        emit FundsWithdrawn(owner(), withdrawAmount);
    }
    
    /**
     * @dev Mint a new Builder NFT for a developer contributing to a project.
     * @param recipient The address that will receive the NFT.
     * @param tokenURI The metadata URI for the NFT.
     * @param githubUsername The GitHub username of the builder.
     * @param projectId The project ID string.
     * @param repoName The repository name.
     * @return newTokenId The ID of the newly minted NFT.
     */
    function mintBuilderNFT(
        address recipient,
        string calldata tokenURI,
        string calldata githubUsername,
        string calldata projectId,
        string calldata repoName
    ) public payable whenMintingEnabled nonReentrant returns (uint256 newTokenId) {
        // Check if sender is owner or has paid the mint price
        if (msg.sender != owner()) {
            require(msg.value >= mintPrice, "BuilderNFT: insufficient payment");
        }
        
        require(recipient != address(0), "BuilderNFT: mint to the zero address");
        require(bytes(githubUsername).length > 0, "BuilderNFT: empty GitHub username");
        require(bytes(projectId).length > 0, "BuilderNFT: empty project ID");
        
        if(bytes(tokenURI).length > 0) {
            require(bytes(tokenURI).length <= MAX_URI_LENGTH, "BuilderNFT: URI too long");
        }
        
        // Create hash for project ID
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        
        // Generate a unique token ID
        _tokenIds.increment();
        newTokenId = _tokenIds.current();
        
        // Mint the token (quantity 1)
        _mint(recipient, newTokenId, 1, "");
        
        // Set the token URI
        if(bytes(tokenURI).length > 0) {
            _setURI(newTokenId, tokenURI);
        }
        
        // Store metadata for this token
        tokenToProject[newTokenId] = projectHash;
        tokenToRepo[newTokenId] = repoName;
        tokenToGithubUsername[newTokenId] = githubUsername;
        
        // Store token ID for this GitHub username
        _githubToTokens[githubUsername].push(newTokenId);
        
        // Store token ID for this project
        _projectToTokens[projectHash].push(newTokenId);
        
        emit BuilderNFTMinted(newTokenId, recipient, githubUsername, projectHash, repoName);
        
        // Refund excess payment if any
        uint256 excess = msg.value > mintPrice ? msg.value - mintPrice : 0;
        if (excess > 0 && msg.sender != owner()) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            require(success, "BuilderNFT: refund failed");
        }
        
        return newTokenId;
    }
    
    /**
     * @dev Get all token IDs associated with a GitHub username.
     * @param githubUsername The GitHub username.
     * @return An array of token IDs.
     */
    function getTokensByGithubUsername(string calldata githubUsername) external view returns (uint256[] memory) {
        return _githubToTokens[githubUsername];
    }
    
    /**
     * @dev Get all token IDs associated with a project ID.
     * @param projectId The project ID (string).
     * @return An array of token IDs.
     */
    function getTokensByProject(string calldata projectId) external view returns (uint256[] memory) {
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        return _projectToTokens[projectHash];
    }
    
    /**
     * @dev Get the project ID hash associated with a token.
     * @param tokenId The token ID.
     * @return The project ID hash.
     */
    function getProjectHashByToken(uint256 tokenId) external view returns (bytes32) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "BuilderNFT: query for nonexistent token");
        return tokenToProject[tokenId];
    }
    
    /**
     * @dev Get the repository name associated with a token.
     * @param tokenId The token ID.
     * @return The repository name.
     */
    function getRepoByToken(uint256 tokenId) external view returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "BuilderNFT: query for nonexistent token");
        return tokenToRepo[tokenId];
    }
    
    /**
     * @dev Get the GitHub username associated with a token.
     * @param tokenId The token ID.
     * @return The GitHub username.
     */
    function getGithubUsernameByToken(uint256 tokenId) external view returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "BuilderNFT: query for nonexistent token");
        return tokenToGithubUsername[tokenId];
    }
    
    /**
     * @dev Get the total number of tokens minted.
     * @return The total number of minted tokens.
     */
    function getTotalTokens() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Set the contract metadata URI for platforms like OpenSea.
     * @param newContractURI The new contract URI.
     */
    function setContractURI(string calldata newContractURI) external onlyOwner {
        _contractMetadataURI = newContractURI;
    }
    
    /**
     * @dev Enable or disable minting functionality.
     * @param enabled Whether minting should be enabled.
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
    }
    
    /**
     * @dev Returns the URI for the contract metadata (for OpenSea, etc.)
     */
    function contractURI() external view returns (string memory) {
        return _contractMetadataURI;
    }
    
    /**
     * @dev Checks if a GitHub username has any NFTs for a specific project.
     * This function performs the check but does not prevent multiple mints for 
     * the same GitHub username and project combination, as per ERC1155 design.
     * @param githubUsername The GitHub username to check.
     * @param projectId The project ID to check.
     * @return hasTokens True if tokens exist for this combination, false otherwise.
     * @return tokenCount The number of tokens this username has for this project.
     */
    function hasReceivedNFT(string calldata githubUsername, string calldata projectId) public view returns (bool hasTokens, uint256 tokenCount) {
        // Get the project hash
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        
        // Get all tokens owned by this GitHub username
        uint256[] memory userTokens = _githubToTokens[githubUsername];
        
        // Count how many tokens this user has for this project
        uint256 count = 0;
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (tokenToProject[userTokens[i]] == projectHash) {
                count++;
            }
        }
        
        // Return both whether tokens exist and how many
        return (count > 0, count);
    }
    
    /**
     * @dev Returns the hash values for a GitHub username and project ID.
     * @param githubUsername The GitHub username.
     * @param projectId The project ID.
     * @return githubHash The hash of the GitHub username.
     * @return projectHash The hash of the project ID.
     */
    function getHashValues(string calldata githubUsername, string calldata projectId) public pure returns (bytes32 githubHash, bytes32 projectHash) {
        githubHash = keccak256(abi.encodePacked(githubUsername));
        projectHash = keccak256(abi.encodePacked(projectId));
        return (githubHash, projectHash);
    }
}