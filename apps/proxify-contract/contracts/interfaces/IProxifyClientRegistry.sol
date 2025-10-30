// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IProxifyClientRegistry
 * @author DeFAI Protocol
 * @notice Interface for dynamic risk tier client registration and management
 * @dev Supports unlimited custom risk tiers per client
 */
interface IProxifyClientRegistry {

    /**
     * @notice Risk tier configuration for client allocation strategy
     * @dev Each client can define multiple tiers with custom allocations
     * @param tierId Unique identifier for this tier (keccak256 hash, e.g., keccak256("LOW_RISK"))
     * @param name Human-readable tier name (e.g., "Low Risk - Aave/Compound")
     * @param allocationBps Percentage allocation to this tier (basis points, 10000 = 100%)
     * @param isActive Whether this tier is currently active
     */
    struct RiskTier {
        bytes32 tierId;
        string name;
        uint16 allocationBps;
        bool isActive;
    }

    /**
     * @notice Client information stored in the registry
     * @dev All clients must be registered before they can use the Proxify system
     * @param name Human-readable client name
     * @param clientAddress Address to receive fee distributions
     * @param isActive Whether the client can perform operations
     * @param registeredAt Timestamp of registration
     * @param feeBps Client's revenue share from service fees (basis points, e.g., 500 = 5%)
     * @param serviceFeeBps Service fee charged on yield (basis points, e.g., 2000 = 20%)
     * @param clientFeeBps Client's share of service fee (basis points, e.g., 500 = 5%, remaining goes to protocol)
     */
    struct ClientInfo {
        string name;
        address clientAddress;
        bool isActive;
        uint256 registeredAt;
        uint16 feeBps;
        uint16 serviceFeeBps;
        uint16 clientFeeBps;
    }

    // ============ Events ============

    /**
     * @notice Emitted when a new client is registered
     * @param clientId Unique identifier for the client
     * @param clientAddress Address to receive fee distributions
     * @param name Human-readable client name
     */
    event ClientRegistered(bytes32 indexed clientId, address indexed clientAddress, string name);

    /**
     * @notice Emitted when a client is activated or reactivated
     * @param clientId The client's unique identifier
     */
    event ClientActivated(bytes32 indexed clientId);

    /**
     * @notice Emitted when a client is deactivated/suspended
     * @param clientId The client's unique identifier
     */
    event ClientDeactivated(bytes32 indexed clientId);

    /**
     * @notice Emitted when a client's fee address is updated
     * @param clientId The client's unique identifier
     * @param oldAddress Previous fee recipient address
     * @param newAddress New fee recipient address
     */
    event ClientAddressUpdated(bytes32 indexed clientId, address indexed oldAddress, address indexed newAddress);

    /**
     * @notice Emitted when a client's risk tiers are updated
     * @param clientId The client's unique identifier
     * @param tierCount Number of risk tiers configured
     */
    event ClientRiskTiersUpdated(bytes32 indexed clientId, uint256 tierCount);

    /**
     * @notice Emitted when a client's fee configuration is updated
     * @param clientId The client's unique identifier
     * @param feeBps New client revenue share percentage
     * @param serviceFeeBps New service fee percentage
     */
    event ClientFeeConfigUpdated(bytes32 indexed clientId, uint16 feeBps, uint16 serviceFeeBps);

    // ============ Client Management Functions ============

    /**
     * @notice Register a new client in the system
     * @dev Can only be called by authorized oracle role
     * @param clientId Unique identifier for the client (recommend using keccak256(clientName))
     * @param clientAddress Address to receive fee distributions
     * @param name Human-readable name for the client
     * @param feeBps Client's revenue share from service fees (basis points, e.g., 500 = 5%)
     * @param serviceFeeBps Service fee charged on yield (basis points, e.g., 2000 = 20%)
     * @param clientFeeBps Client's share of service fee (basis points, e.g., 500 = 5%, remaining to protocol)
     */
    function registerClient(
        bytes32 clientId,
        address clientAddress,
        string calldata name,
        uint16 feeBps,
        uint16 serviceFeeBps,
        uint16 clientFeeBps
    ) external;

    /**
     * @notice Activate a previously deactivated client
     * @dev Can only be called by admin role
     * @param clientId The client's unique identifier
     */
    function activateClient(bytes32 clientId) external;

    /**
     * @notice Deactivate/suspend a client
     * @dev Can only be called by admin role. Client cannot perform operations when deactivated.
     * @param clientId The client's unique identifier
     */
    function deactivateClient(bytes32 clientId) external;

    /**
     * @notice Update client's fee distribution address
     * @dev Can only be called by admin role
     * @param clientId The client's unique identifier
     * @param newAddress New address to receive fees
     */
    function updateClientAddress(bytes32 clientId, address newAddress) external;

    /**
     * @notice Update client's fee configuration
     * @dev Can only be called by admin role
     * @param clientId The client's unique identifier
     * @param feeBps New client revenue share (basis points)
     * @param serviceFeeBps New service fee percentage (basis points)
     * @param clientFeeBps New client's share of service fee (basis points)
     */
    function updateClientFees(bytes32 clientId, uint16 feeBps, uint16 serviceFeeBps, uint16 clientFeeBps) external;

    // ============ Risk Tier Management Functions ============

    /**
     * @notice Set risk tiers for a client
     * @dev Can only be called by admin role. Total allocationBps must sum to 10000 (100%).
     * @param clientId The client's unique identifier
     * @param riskTiers Array of RiskTier structs defining the client's allocation strategy
     */
    function setClientRiskTiers(bytes32 clientId, RiskTier[] calldata riskTiers) external;

    /**
     * @notice Add a new risk tier to a client's configuration
     * @dev Can only be called by admin role. Must update allocations to maintain 100% total.
     * @param clientId The client's unique identifier
     * @param tier The new RiskTier to add
     */
    function addClientRiskTier(bytes32 clientId, RiskTier calldata tier) external;

    /**
     * @notice Update an existing risk tier's allocation
     * @dev Can only be called by admin role
     * @param clientId The client's unique identifier
     * @param tierId The tier to update
     * @param newAllocationBps New allocation percentage (basis points)
     */
    function updateTierAllocation(bytes32 clientId, bytes32 tierId, uint16 newAllocationBps) external;

    /**
     * @notice Activate or deactivate a specific risk tier
     * @dev Can only be called by admin role
     * @param clientId The client's unique identifier
     * @param tierId The tier to update
     * @param isActive New active status
     */
    function setTierActive(bytes32 clientId, bytes32 tierId, bool isActive) external;

    // ============ View Functions ============

    /**
     * @notice Check if a client is registered and active
     * @param clientId The client's unique identifier
     * @return bool True if client is registered and active, false otherwise
     */
    function isClientActive(bytes32 clientId) external view returns (bool);

    /**
     * @notice Check if a client is registered (regardless of active status)
     * @param clientId The client's unique identifier
     * @return bool True if client is registered, false otherwise
     */
    function isClientRegistered(bytes32 clientId) external view returns (bool);

    /**
     * @notice Get full client information (without risk tiers)
     * @param clientId The client's unique identifier
     * @return info ClientInfo struct containing client data
     */
    function getClientInfo(bytes32 clientId) external view returns (ClientInfo memory info);

    /**
     * @notice Get client's fee recipient address
     * @param clientId The client's unique identifier
     * @return clientAddress Address that receives fee distributions
     */
    function getClientAddress(bytes32 clientId) external view returns (address clientAddress);

    /**
     * @notice Get all risk tiers for a client
     * @param clientId The client's unique identifier
     * @return tiers Array of RiskTier structs
     */
    function getClientRiskTiers(bytes32 clientId) external view returns (RiskTier[] memory tiers);

    /**
     * @notice Get a specific risk tier for a client
     * @param clientId The client's unique identifier
     * @param tierId The tier identifier
     * @return tier The RiskTier struct
     */
    function getClientRiskTier(bytes32 clientId, bytes32 tierId) external view returns (RiskTier memory tier);

    /**
     * @notice Check if a client has a specific risk tier configured
     * @param clientId The client's unique identifier
     * @param tierId The tier identifier
     * @return bool True if tier exists, false otherwise
     */
    function hasTier(bytes32 clientId, bytes32 tierId) external view returns (bool);

    /**
     * @notice Validate that a set of risk tiers sums to 100%
     * @param tiers Array of RiskTier structs to validate
     * @return bool True if allocations sum to 10000 (100%), false otherwise
     */
    function validateTierAllocations(RiskTier[] calldata tiers) external pure returns (bool);
}
