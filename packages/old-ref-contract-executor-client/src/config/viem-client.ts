import { Account, Address, createPublicClient, createWalletClient, Hex, http, PublicClient, WalletClient } from "viem"
import { getChainConfig, type SupportedChainId } from "./chain"
import { privateKeyToAccount } from "viem/accounts"
import { ProxifyAccessControl, ProxifyAccessControlType } from "@proxify/core"

export class ViemClient {
    private static readonly publicClients: Map<SupportedChainId, PublicClient> = new Map();
    private static readonly walletClients: Map<SupportedChainId, Map<ProxifyAccessControlType, WalletClient>> = new Map();
    private static oracleSigner: Account;
    private static guardianSigner: Account;

    public static init(config: { oraclePrivateKey: Hex; guardianPrivateKey: Hex }) {
        ViemClient.oracleSigner = privateKeyToAccount(config.oraclePrivateKey);
        ViemClient.guardianSigner = privateKeyToAccount(config.guardianPrivateKey);
    }

    public static getPublicClient(chainId: SupportedChainId): PublicClient {
        if (!ViemClient.publicClients.has(chainId)) {
            const chainConfig = getChainConfig(chainId)
            const client = createPublicClient({
                chain: chainConfig.chain,
                transport: http(chainConfig.rpcUrl),
            })
            ViemClient.publicClients.set(chainId, client)
        }

        return ViemClient.publicClients.get(chainId)!
    }

    public static getWalletClient(chainId: SupportedChainId, role: ProxifyAccessControlType): WalletClient {
        const signer = ViemClient.getViemAccountByRole(role)

        if (!ViemClient.walletClients.has(chainId)) {
            ViemClient.walletClients.set(chainId, new Map())
        }
        const chainWallets = ViemClient.walletClients.get(chainId)!

        if (!chainWallets.has(role)) {
            const chainConfig = getChainConfig(chainId)

            const client = createWalletClient({
                account: signer,
                chain: chainConfig.chain,
                transport: http(chainConfig.rpcUrl),
            })

            chainWallets.set(role, client)
        }

        return chainWallets.get(role)!
    }

    public static getViemClients(chainId: SupportedChainId, role: ProxifyAccessControlType) {
        return {
            publicClient: ViemClient.getPublicClient(chainId),
            walletClient: ViemClient.getWalletClient(chainId, role),
        }
    }

    private static getViemAccountByRole(role: ProxifyAccessControlType) {
        switch (role) {
            case ProxifyAccessControl.Enum.ORACLE_ROLE:
                return ViemClient.oracleSigner
            case ProxifyAccessControl.Enum.GUARDIAN_ROLE:
                return ViemClient.guardianSigner
            default:
                throw new Error("Signer role not supported")
        }
    }
}
