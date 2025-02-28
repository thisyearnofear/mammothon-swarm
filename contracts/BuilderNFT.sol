// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/access/Ownable2Step.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/security/ReentrancyGuard.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.0/contracts/utils/Strings.sol";

/**
 * @title BuilderNFT
 * @dev A contract for issuing NFTs to builders who contribute to projects.
 * Enhanced with security features, validation, and improved data management.
 */
contract BuilderNFT is ERC721URIStorage, Ownable2Step, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Maximum metadata URI length to prevent gas issues
    uint256 public constant MAX_URI_LENGTH = 2048;
    
    // Mapping from token ID to project ID
    mapping(uint256 => bytes32) public tokenToProject;
    
    // Mapping from GitHub username to token IDs
    mapping(string => uint256[]) private _githubToTokens;
    
    // Mapping from project ID to token IDs
    mapping(bytes32 => uint256[]) private _projectToTokens;
    
    // Mapping to track if a GitHub username has received an NFT for a specific project
    // This prevents duplicate minting for the same contributor/project combination
    mapping(bytes32 => mapping(bytes32 => bool)) private _hasReceivedNFT;
    
    // Contract metadata URI for OpenSea and other platforms
    string private _contractMetadataURI;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Flag to enable/disable minting
    bool public mintingEnabled = true;
    
    // Events
    event BuilderNFTMinted(uint256 indexed tokenId, address indexed recipient, string githubUsername, bytes32 indexed projectId);
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);
    event MintingStatusChanged(bool enabled);
    
    /**
     * @dev Constructor initializes the contract with name, symbol and optional baseURI.
     * @param baseTokenURI Optional base URI for token metadata.
     */
    constructor(string memory baseTokenURI) ERC721("Mammothon Builder NFT", "MBUILDER") {
        _baseTokenURI = baseTokenURI;
    }
    
    /**
     * @dev Checks if the GitHub username and project ID combination has already received an NFT.
     * @param githubUsername The GitHub username.
     * @param projectId The project ID.
     * @return Boolean indicating if the combination has already received an NFT.
     */
    function hasReceivedNFT(string calldata githubUsername, string calldata projectId) public view returns (bool) {
        bytes32 githubHash = keccak256(abi.encodePacked(githubUsername));
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        return _hasReceivedNFT[githubHash][projectHash];
    }
    
    /**
     * @dev Modifier to check if minting is enabled.
     */
    modifier whenMintingEnabled() {
        require(mintingEnabled, "BuilderNFT: minting is disabled");
        _;
    }
    
    /**
     * @dev Mint a new Builder NFT for a developer contributing to a project.
     * @param recipient The address that will receive the NFT.
     * @param tokenURI The metadata URI for the NFT (optional if baseURI is set).
     * @param githubUsername The GitHub username of the builder.
     * @param projectId The project ID string.
     * @return newTokenId The ID of the newly minted NFT.
     */
    function mintBuilderNFT(
        address recipient,
        string calldata tokenURI,
        string calldata githubUsername,
        string calldata projectId
    ) external onlyOwner whenMintingEnabled nonReentrant returns (uint256 newTokenId) {
        require(recipient != address(0), "BuilderNFT: mint to the zero address");
        require(bytes(githubUsername).length > 0, "BuilderNFT: empty GitHub username");
        require(bytes(projectId).length > 0, "BuilderNFT: empty project ID");
        
        if(bytes(tokenURI).length > 0) {
            require(bytes(tokenURI).length <= MAX_URI_LENGTH, "BuilderNFT: URI too long");
        }
        
        // Create hash for GitHub username and project ID
        bytes32 githubHash = keccak256(abi.encodePacked(githubUsername));
        bytes32 projectHash = keccak256(abi.encodePacked(projectId));
        
        // Check if this combination already received an NFT
        if(_hasReceivedNFT[githubHash][projectHash]) {
            revert("BuilderNFT: contributor already received NFT for this project");
        }
        
        _tokenIds.increment();
        newTokenId = _tokenIds.current();
        
        _mint(recipient, newTokenId);
        
        // Only set specific token URI if provided
        if(bytes(tokenURI).length > 0) {
            _setTokenURI(newTokenId, tokenURI);
        }
        
        // Store project ID for this token
        tokenToProject[newTokenId] = projectHash;
        
        // Store token ID for this GitHub username
        _githubToTokens[githubUsername].push(newTokenId);
        
        // Store token ID for this project
        _projectToTokens[projectHash].push(newTokenId);
        
        // Mark this GitHub username and project ID combination as having received an NFT
        _hasReceivedNFT[githubHash][projectHash] = true;
        
        emit BuilderNFTMinted(newTokenId, recipient, githubUsername, projectHash);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint NFTs to multiple recipients.
     * @param recipients Array of recipient addresses.
     * @param tokenURIs Array of token URIs (can be empty if baseURI is set).
     * @param githubUsernames Array of GitHub usernames.
     * @param projectIds Array of project IDs.
     * @return Array of newly minted token IDs.
     */
    function batchMintBuilderNFTs(
        address[] calldata recipients,
        string[] calldata tokenURIs,
        string[] calldata githubUsernames,
        string[] calldata projectIds
    ) external onlyOwner whenMintingEnabled nonReentrant returns (uint256[] memory) {
        uint256 length = recipients.length;
        require(
            length == githubUsernames.length && length == projectIds.length,
            "BuilderNFT: array length mismatch"
        );
        
        // TokenURIs array can be empty if we're using baseURI
        if(tokenURIs.length > 0) {
            require(length == tokenURIs.length, "BuilderNFT: tokenURIs array length mismatch");
        }
        
        uint256[] memory newTokenIds = new uint256[](length);
        
        for(uint256 i = 0; i < length; i++) {
            string memory tokenURI = tokenURIs.length > 0 ? tokenURIs[i] : "";
            try this.mintBuilderNFT(
                recipients[i],
                tokenURI,
                githubUsernames[i],
                projectIds[i]
            ) returns (uint256 newTokenId) {
                newTokenIds[i] = newTokenId;
            } catch {
                // If one mint fails, we continue to the next one
                newTokenIds[i] = 0;
            }
        }
        
        return newTokenIds;
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
     * @dev Get the project ID associated with a token.
     * @param tokenId The token ID.
     * @return The original project ID string.
     * Note: This function cannot return the original string as bytes32 is a hash.
     * It's provided for completeness, but clients will need to map the hash back to the original string.
     */
    function getProjectHashByToken(uint256 tokenId) external view returns (bytes32) {
        require(_exists(tokenId), "BuilderNFT: query for nonexistent token");
        return tokenToProject[tokenId];
    }
    
    /**
     * @dev Get the total number of tokens minted.
     * @return The total number of minted tokens.
     */
    function getTotalTokens() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @dev Set the base URI for all token metadata.
     * @param baseURI The new base URI.
     */
    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev Set the contract metadata URI for platforms like OpenSea.
     * @param newContractURI The new contract URI.
     */
    function setContractURI(string calldata newContractURI) external onlyOwner {
        _contractMetadataURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }
    
    /**
     * @dev Enable or disable minting functionality.
     * @param enabled Whether minting should be enabled.
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingStatusChanged(enabled);
    }
    
    /**
     * @dev Returns the URI for the contract metadata (for OpenSea, etc.)
     */
    function contractURI() external view returns (string memory) {
        return _contractMetadataURI;
    }
    
    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev See {IERC721-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Returns true if the token exists.
     * @param tokenId Token ID to check.
     */
    function _exists(uint256 tokenId) override internal view returns (bool) {
        return tokenId > 0 && tokenId <= _tokenIds.current();
    }
}