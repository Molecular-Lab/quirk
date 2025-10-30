// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IProxifyClientRegistry.sol";

/**
 * @title ProxifyClientRegistry
 * @author DeFAI Protocol
 * @notice Dynamic risk tier client registry for Proxify system
 * @dev Supports unlimited custom risk tiers per client
 */
contract ProxifyClientRegistry is IProxifyClientRegistry, AccessControl {

    // ============ Constants ============

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    uint16 public constant MAX_FEE_BPS = 10000; // 100% in basis points
    uint256 public constant MAX_TIERS_PER_CLIENT = 20; // Practical limit for gas optimization

    // ============ Storage ============

    // Client basic information
    mapping(bytes32 => ClientInfo) private clients;

    // Client risk tiers (dynamic array)
    mapping(bytes32 => RiskTier[]) private clientRiskTiers;

    // Quick lookup: clientId => tierId => array index (for O(1) access)
    // Value of MAX_UINT256 means tier doesn't exist
    mapping(bytes32 => mapping(bytes32 => uint256)) private tierIndexMap;

    // ============ Constructor ============

    /**
     * @notice Initialize the registry with admin and oracle roles
     * @param _admin Address with admin privileges (can manage clients and tiers)
     * @param _oracle Address with oracle privileges (can register clients)
     */
    constructor(address _admin, address _oracle) {
        require(_admin != address(0), "Invalid admin address");
        require(_oracle != address(0), "Invalid oracle address");

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _oracle);
    }

    // ============ Client Management Functions ============

    /**
     * @notice Register a new client in the system
     * @dev Can only be called by oracle role. Risk tiers must be set separately.
     * @param clientId Unique identifier for the client
     * @param clientAddress Address to receive fee distributions
     * @param name Human-readable name for the client
     * @param feeBps Client's revenue share from service fees (basis points, e.g., 500 = 5%)
     * @param serviceFeeBps Service fee charged on yield (basis points, e.g., 2000 = 20%)
     * @param clientFeeBps Client's share of service fee (basis points, e.g., 500 = 5%, remaining goes to protocol)
     */
    function registerClient(
        bytes32 clientId,
        address clientAddress,
        string calldata name,
        uint16 feeBps,
        uint16 serviceFeeBps,
        uint16 clientFeeBps
    ) external onlyRole(ORACLE_ROLE) {
        require(clientId != bytes32(0), "Invalid clientId");
        require(clientAddress != address(0), "Invalid client address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!isClientRegistered(clientId), "Client already registered");

        // Validate fee parameters
        require(feeBps <= MAX_FEE_BPS, "Invalid feeBps");
        require(serviceFeeBps <= MAX_FEE_BPS, "Invalid serviceFeeBps");
        require(clientFeeBps <= MAX_FEE_BPS, "Invalid clientFeeBps");
        require(clientFeeBps < 10000, "Client fee cannot exceed 100%");

        clients[clientId] = ClientInfo({
            name: name,
            clientAddress: clientAddress,
            isActive: true,
            registeredAt: block.timestamp,
            feeBps: feeBps,
            serviceFeeBps: serviceFeeBps,
            clientFeeBps: clientFeeBps
        });

        emit ClientRegistered(clientId, clientAddress, name);
        emit ClientActivated(clientId);
    }

    /**
     * @notice Activate a previously deactivated client
     * @param clientId The client's unique identifier
     */
    function activateClient(bytes32 clientId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(!clients[clientId].isActive, "Client already active");

        clients[clientId].isActive = true;
        emit ClientActivated(clientId);
    }

    /**
     * @notice Deactivate/suspend a client
     * @param clientId The client's unique identifier
     */
    function deactivateClient(bytes32 clientId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(clients[clientId].isActive, "Client already inactive");

        clients[clientId].isActive = false;
        emit ClientDeactivated(clientId);
    }

    /**
     * @notice Update client's fee distribution address
     * @param clientId The client's unique identifier
     * @param newAddress New address to receive fees
     */
    function updateClientAddress(bytes32 clientId, address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(newAddress != address(0), "Invalid new address");

        address oldAddress = clients[clientId].clientAddress;
        clients[clientId].clientAddress = newAddress;

        emit ClientAddressUpdated(clientId, oldAddress, newAddress);
    }

    /**
     * @notice Update client's fee configuration
     * @param clientId The client's unique identifier
     * @param feeBps New client revenue share (basis points)
     * @param serviceFeeBps New service fee percentage (basis points)
     * @param clientFeeBps New client's share of service fee (basis points, e.g., 500 = 5%)
     */
    function updateClientFees(
        bytes32 clientId,
        uint16 feeBps,
        uint16 serviceFeeBps,
        uint16 clientFeeBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(feeBps <= MAX_FEE_BPS, "Invalid feeBps");
        require(serviceFeeBps <= MAX_FEE_BPS, "Invalid serviceFeeBps");
        require(clientFeeBps <= MAX_FEE_BPS, "Invalid clientFeeBps");
        require(clientFeeBps <= 5000, "Client fee cannot exceed 50%");

        clients[clientId].feeBps = feeBps;
        clients[clientId].serviceFeeBps = serviceFeeBps;
        clients[clientId].clientFeeBps = clientFeeBps;

        emit ClientFeeConfigUpdated(clientId, feeBps, serviceFeeBps);
    }

    // ============ Risk Tier Management Functions ============

    /**
     * @notice Set risk tiers for a client (replaces existing configuration)
     * @dev Total allocationBps must sum to 10000 (100%)
     * @param clientId The client's unique identifier
     * @param riskTiers Array of RiskTier structs defining the client's allocation strategy
     */
    function setClientRiskTiers(
        bytes32 clientId,
        RiskTier[] calldata riskTiers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(riskTiers.length > 0, "At least one tier required");
        require(riskTiers.length <= MAX_TIERS_PER_CLIENT, "Too many tiers");

        // Validate allocations sum to 100%
        require(validateTierAllocations(riskTiers), "Allocations must sum to 100%");

        // Validate no duplicate tier IDs
        for (uint i = 0; i < riskTiers.length; i++) {
            require(riskTiers[i].tierId != bytes32(0), "Invalid tierId");
            require(bytes(riskTiers[i].name).length > 0, "Tier name required");

            // Check for duplicates in this array
            for (uint j = i + 1; j < riskTiers.length; j++) {
                require(riskTiers[i].tierId != riskTiers[j].tierId, "Duplicate tierId");
            }
        }

        // Clear existing tier index map
        RiskTier[] storage existingTiers = clientRiskTiers[clientId];
        for (uint i = 0; i < existingTiers.length; i++) {
            tierIndexMap[clientId][existingTiers[i].tierId] = type(uint256).max;
        }

        // Delete existing tiers
        delete clientRiskTiers[clientId];

        // Add new tiers
        for (uint i = 0; i < riskTiers.length; i++) {
            clientRiskTiers[clientId].push(riskTiers[i]);
            tierIndexMap[clientId][riskTiers[i].tierId] = i;
        }

        emit ClientRiskTiersUpdated(clientId, riskTiers.length);
    }

    /**
     * @notice Add a new risk tier to a client's configuration
     * @dev Must rebalance existing allocations to maintain 100% total
     * @param clientId The client's unique identifier
     * @param tier The new RiskTier to add
     */
    function addClientRiskTier(
        bytes32 clientId,
        RiskTier calldata tier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(tier.tierId != bytes32(0), "Invalid tierId");
        require(bytes(tier.name).length > 0, "Tier name required");
        require(!hasTier(clientId, tier.tierId), "Tier already exists");

        RiskTier[] storage tiers = clientRiskTiers[clientId];
        require(tiers.length < MAX_TIERS_PER_CLIENT, "Max tiers reached");

        // Calculate new total allocation
        uint256 totalAllocation = tier.allocationBps;
        for (uint i = 0; i < tiers.length; i++) {
            totalAllocation += tiers[i].allocationBps;
        }
        require(totalAllocation == MAX_FEE_BPS, "Allocations must sum to 100%");

        // Add new tier
        uint256 newIndex = tiers.length;
        tiers.push(tier);
        tierIndexMap[clientId][tier.tierId] = newIndex;

        emit ClientRiskTiersUpdated(clientId, tiers.length);
    }

    /**
     * @notice Update an existing risk tier's allocation
     * @dev Total allocations must still sum to 100% after update
     * @param clientId The client's unique identifier
     * @param tierId The tier to update
     * @param newAllocationBps New allocation percentage (basis points)
     */
    function updateTierAllocation(
        bytes32 clientId,
        bytes32 tierId,
        uint16 newAllocationBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(hasTier(clientId, tierId), "Tier not found");

        uint256 tierIndex = tierIndexMap[clientId][tierId];
        RiskTier[] storage tiers = clientRiskTiers[clientId];

        // Calculate total with new allocation
        uint256 totalAllocation = newAllocationBps;
        for (uint i = 0; i < tiers.length; i++) {
            if (i != tierIndex) {
                totalAllocation += tiers[i].allocationBps;
            }
        }
        require(totalAllocation == MAX_FEE_BPS, "Allocations must sum to 100%");

        tiers[tierIndex].allocationBps = newAllocationBps;

        emit ClientRiskTiersUpdated(clientId, tiers.length);
    }

    /**
     * @notice Activate or deactivate a specific risk tier
     * @dev Deactivating a tier doesn't affect allocation percentages
     * @param clientId The client's unique identifier
     * @param tierId The tier to update
     * @param isActive New active status
     */
    function setTierActive(
        bytes32 clientId,
        bytes32 tierId,
        bool isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(hasTier(clientId, tierId), "Tier not found");

        uint256 tierIndex = tierIndexMap[clientId][tierId];
        clientRiskTiers[clientId][tierIndex].isActive = isActive;

        emit ClientRiskTiersUpdated(clientId, clientRiskTiers[clientId].length);
    }

    // ============ View Functions ============

    /**
     * @notice Check if a client is registered and active
     * @param clientId The client's unique identifier
     * @return bool True if client is registered and active, false otherwise
     */
    function isClientActive(bytes32 clientId) external view returns (bool) {
        return clients[clientId].registeredAt != 0 && clients[clientId].isActive;
    }

    /**
     * @notice Check if a client is registered (regardless of active status)
     * @param clientId The client's unique identifier
     * @return bool True if client is registered, false otherwise
     */
    function isClientRegistered(bytes32 clientId) public view returns (bool) {
        return clients[clientId].registeredAt != 0;
    }

    /**
     * @notice Get full client information (without risk tiers)
     * @param clientId The client's unique identifier
     * @return info ClientInfo struct containing client data
     */
    function getClientInfo(bytes32 clientId) external view returns (ClientInfo memory info) {
        require(isClientRegistered(clientId), "Client not registered");
        return clients[clientId];
    }

    /**
     * @notice Get client's fee recipient address
     * @param clientId The client's unique identifier
     * @return clientAddress Address that receives fee distributions
     */
    function getClientAddress(bytes32 clientId) external view returns (address clientAddress) {
        require(isClientRegistered(clientId), "Client not registered");
        return clients[clientId].clientAddress;
    }

    /**
     * @notice Get all risk tiers for a client
     * @param clientId The client's unique identifier
     * @return tiers Array of RiskTier structs
     */
    function getClientRiskTiers(bytes32 clientId) external view returns (RiskTier[] memory tiers) {
        require(isClientRegistered(clientId), "Client not registered");
        return clientRiskTiers[clientId];
    }

    /**
     * @notice Get a specific risk tier for a client
     * @param clientId The client's unique identifier
     * @param tierId The tier identifier
     * @return tier The RiskTier struct
     */
    function getClientRiskTier(
        bytes32 clientId,
        bytes32 tierId
    ) external view returns (RiskTier memory tier) {
        require(isClientRegistered(clientId), "Client not registered");
        require(hasTier(clientId, tierId), "Tier not found");

        uint256 tierIndex = tierIndexMap[clientId][tierId];
        return clientRiskTiers[clientId][tierIndex];
    }

    /**
     * @notice Check if a client has a specific risk tier configured
     * @param clientId The client's unique identifier
     * @param tierId The tier identifier
     * @return bool True if tier exists, false otherwise
     */
    function hasTier(bytes32 clientId, bytes32 tierId) public view returns (bool) {
        uint256 index = tierIndexMap[clientId][tierId];
        if (index == type(uint256).max) {
            return false;
        }
        RiskTier[] storage tiers = clientRiskTiers[clientId];
        if (index >= tiers.length) {
            return false;
        }
        return tiers[index].tierId == tierId;
    }

    /**
     * @notice Validate that a set of risk tiers sums to 100%
     * @param tiers Array of RiskTier structs to validate
     * @return bool True if allocations sum to 10000 (100%), false otherwise
     */
    function validateTierAllocations(RiskTier[] calldata tiers) public pure returns (bool) {
        uint256 totalAllocation = 0;
        for (uint i = 0; i < tiers.length; i++) {
            totalAllocation += tiers[i].allocationBps;
        }
        return totalAllocation == MAX_FEE_BPS;
    }
}
