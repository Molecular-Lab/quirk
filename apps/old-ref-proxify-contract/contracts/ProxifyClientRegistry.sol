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

    /// @inheritdoc IProxifyClientRegistry
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

    /// @inheritdoc IProxifyClientRegistry
    function activateClient(bytes32 clientId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(!clients[clientId].isActive, "Client already active");

        clients[clientId].isActive = true;
        emit ClientActivated(clientId);
    }

    /// @inheritdoc IProxifyClientRegistry
    function deactivateClient(bytes32 clientId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(clients[clientId].isActive, "Client already inactive");

        clients[clientId].isActive = false;
        emit ClientDeactivated(clientId);
    }

    /// @inheritdoc IProxifyClientRegistry
    function updateClientAddress(bytes32 clientId, address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(newAddress != address(0), "Invalid new address");

        address oldAddress = clients[clientId].clientAddress;
        clients[clientId].clientAddress = newAddress;

        emit ClientAddressUpdated(clientId, oldAddress, newAddress);
    }

    /// @inheritdoc IProxifyClientRegistry
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

    /// @inheritdoc IProxifyClientRegistry
    function setClientRiskTiers(
        bytes32 clientId,
        RiskTier[] calldata riskTiers
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(riskTiers.length > 0, "At least one tier required");
        require(riskTiers.length <= MAX_TIERS_PER_CLIENT, "Too many tiers");

        // Validate no duplicate tier IDs and proper tier data
        for (uint i = 0; i < riskTiers.length; i++) {
            require(riskTiers[i].tierId != bytes32(0), "Invalid tierId");
            require(bytes(riskTiers[i].name).length > 0, "Tier name required");

            // Check for duplicates in this array
            for (uint j = i + 1; j < riskTiers.length; j++) {
                require(riskTiers[i].tierId != riskTiers[j].tierId, "Duplicate tierId");
            }
        }

        // Validate allocations sum to 100%
        require(validateTierAllocations(riskTiers), "Allocations must sum to 100%");

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

    /// @inheritdoc IProxifyClientRegistry
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

        // Add new tier with provided allocation and active status
        uint256 newIndex = tiers.length;
        tiers.push(tier);
        tierIndexMap[clientId][tier.tierId] = newIndex;

        emit ClientRiskTiersUpdated(clientId, tiers.length);
    }

    /// @inheritdoc IProxifyClientRegistry
    function updateTierAllocation(
        bytes32 clientId,
        bytes32 tierId,
        uint16 newAllocationBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClientRegistered(clientId), "Client not registered");
        require(hasTier(clientId, tierId), "Tier not found");
        require(newAllocationBps <= MAX_FEE_BPS, "Allocation exceeds 100%");

        uint256 tierIndex = tierIndexMap[clientId][tierId];
        RiskTier[] storage tiers = clientRiskTiers[clientId];

        tiers[tierIndex].allocationBps = newAllocationBps;

        emit ClientRiskTiersUpdated(clientId, tiers.length);
    }

    /// @inheritdoc IProxifyClientRegistry
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

    /// @inheritdoc IProxifyClientRegistry
    function isClientActive(bytes32 clientId) external view returns (bool) {
        return clients[clientId].registeredAt != 0 && clients[clientId].isActive;
    }

    /// @inheritdoc IProxifyClientRegistry
    function isClientRegistered(bytes32 clientId) public view returns (bool) {
        return clients[clientId].registeredAt != 0;
    }

    /// @inheritdoc IProxifyClientRegistry
    function getClientInfo(bytes32 clientId) external view returns (ClientInfo memory info) {
        require(isClientRegistered(clientId), "Client not registered");
        return clients[clientId];
    }

    /// @inheritdoc IProxifyClientRegistry
    function getClientAddress(bytes32 clientId) external view returns (address clientAddress) {
        require(isClientRegistered(clientId), "Client not registered");
        return clients[clientId].clientAddress;
    }

    /// @inheritdoc IProxifyClientRegistry
    function getClientRiskTiers(bytes32 clientId) external view returns (RiskTier[] memory tiers) {
        require(isClientRegistered(clientId), "Client not registered");
        return clientRiskTiers[clientId];
    }

    /// @inheritdoc IProxifyClientRegistry
    function getClientRiskTier(
        bytes32 clientId,
        bytes32 tierId
    ) external view returns (RiskTier memory tier) {
        require(isClientRegistered(clientId), "Client not registered");
        require(hasTier(clientId, tierId), "Tier not found");

        uint256 tierIndex = tierIndexMap[clientId][tierId];
        return clientRiskTiers[clientId][tierIndex];
    }

    /// @inheritdoc IProxifyClientRegistry
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

    /// @inheritdoc IProxifyClientRegistry
    function validateTierAllocations(RiskTier[] calldata tiers) public pure returns (bool) {
        uint256 totalAllocation = 0;
        for (uint i = 0; i < tiers.length; i++) {
            totalAllocation += tiers[i].allocationBps;
        }
        return totalAllocation == MAX_FEE_BPS;
    }

    /// @inheritdoc IProxifyClientRegistry
    function getClientTotalAllocation(bytes32 clientId) external view returns (uint256 totalAllocation) {
        require(isClientRegistered(clientId), "Client not registered");
        
        RiskTier[] storage tiers = clientRiskTiers[clientId];
        for (uint i = 0; i < tiers.length; i++) {
            totalAllocation += tiers[i].allocationBps;
        }
        return totalAllocation;
    }

    /// @inheritdoc IProxifyClientRegistry
    function isClientAllocationValid(bytes32 clientId) external view returns (bool) {
        require(isClientRegistered(clientId), "Client not registered");
        
        RiskTier[] storage tiers = clientRiskTiers[clientId];
        uint256 totalAllocation = 0;
        for (uint i = 0; i < tiers.length; i++) {
            totalAllocation += tiers[i].allocationBps;
        }
        return totalAllocation == MAX_FEE_BPS;
    }
}
