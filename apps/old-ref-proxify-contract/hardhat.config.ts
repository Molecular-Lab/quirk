import type { HardhatUserConfig } from "hardhat/config"

import { configVariable } from "hardhat/config"

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers"
import hardhatVerify from "@nomicfoundation/hardhat-verify"

const config: HardhatUserConfig = {
	plugins: [hardhatToolboxMochaEthersPlugin, hardhatVerify],
	solidity: {
		profiles: {
			default: {
				version: "0.8.28",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
					viaIR: true,
				},
			},
			production: {
				version: "0.8.28",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
					viaIR: true,
				},
			},
		},
	},
	networks: {
		hardhatMainnet: {
			type: "edr-simulated",
			chainType: "l1",
		},
		hardhatOp: {
			type: "edr-simulated",
			chainType: "op",
		},
		sepolia: {
			type: "http",
			chainType: "l1",
			url: configVariable("SEPOLIA_RPC_URL"),
			accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
		},
	},
	verify: {
		etherscan: {
			apiKey: configVariable("ETHERSCAN_API_KEY"),
			enabled: true,
		},
		blockscout: {
			enabled: true,
		},
	},
}

export default config
