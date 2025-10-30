export const LACC_CONTROLLER_ABI = [
	{
		"inputs": [
			{ "internalType": "address", "name": "_laac", "type": "address" },
			{ "internalType": "address", "name": "_adminMultisig", "type": "address" },
			{ "internalType": "address", "name": "_guardian", "type": "address" },
			{ "internalType": "address", "name": "_oracle", "type": "address" }
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{ "inputs": [], "name": "AccessControlBadConfirmation", "type": "error" },
	{
		"inputs": [
			{ "internalType": "address", "name": "account", "type": "address" },
			{ "internalType": "bytes32", "name": "neededRole", "type": "bytes32" }
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{ "inputs": [], "name": "EnforcedPause", "type": "error" },
	{ "inputs": [], "name": "ExpectedPause", "type": "error" },
	{
		"inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "guardian", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "EmergencyPaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "admin", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "EmergencyUnpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "protocol", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "ProtocolRemovedFromWhitelist",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "protocol", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "ProtocolWhitelisted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" },
			{ "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" }
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "indexed": true, "internalType": "address", "name": "account", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "indexed": true, "internalType": "address", "name": "account", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "token", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "TokenAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "token", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "TokenRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "token", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "protocol", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "dailyTotal", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "TransferExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [{ "indexed": false, "internalType": "address", "name": "account", "type": "address" }],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "token", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
		],
		"name": "UnstakedFromProtocol",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GUARDIAN_ROLE",
		"outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ORACLE_ROLE",
		"outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
		"name": "addSupportedToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "protocol", "type": "address" }],
		"name": "addWhitelistedProtocol",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "address", "name": "token", "type": "address" },
			{ "internalType": "uint256", "name": "amount", "type": "uint256" }
		],
		"name": "confirmUnstake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{ "inputs": [], "name": "emergencyPause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{
		"inputs": [
			{ "internalType": "address", "name": "token", "type": "address" },
			{ "internalType": "address", "name": "protocol", "type": "address" },
			{ "internalType": "uint256", "name": "amount", "type": "uint256" }
		],
		"name": "executeTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "bytes32", "name": "role", "type": "bytes32" }],
		"name": "getRoleAdmin",
		"outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "internalType": "address", "name": "account", "type": "address" }
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "internalType": "address", "name": "account", "type": "address" }
		],
		"name": "hasRole",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isPaused",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "protocol", "type": "address" }],
		"name": "isProtocolWhitelisted",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
		"name": "isTokenSupported",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "laac",
		"outputs": [{ "internalType": "contract ILAAC", "name": "", "type": "address" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "token", "type": "address" }],
		"name": "removeSupportedToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "protocol", "type": "address" }],
		"name": "removeWhitelistedProtocol",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "internalType": "address", "name": "callerConfirmation", "type": "address" }
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "role", "type": "bytes32" },
			{ "internalType": "address", "name": "account", "type": "address" }
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "supportedTokens",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }],
		"name": "supportsInterface",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{ "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
	{
		"inputs": [
			{ "internalType": "address", "name": "token", "type": "address" },
			{ "internalType": "uint256", "name": "newIndex", "type": "uint256" }
		],
		"name": "updateVaultIndex",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "whitelistedProtocols",
		"outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "bytes32", "name": "clientId", "type": "bytes32" },
			{ "internalType": "bytes32", "name": "userId", "type": "bytes32" },
			{ "internalType": "address", "name": "token", "type": "address" },
			{ "internalType": "uint256", "name": "amount", "type": "uint256" },
			{ "internalType": "address", "name": "to", "type": "address" }
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
