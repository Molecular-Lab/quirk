import type {
	ProxifyClientRegistryClientAdapter,
	ProxifyClientRegistryRepository,
	ProxifyControllerClientAdapter,
	ProxifyControllerRepository,
	ProxifyRepository,
	ProxifyVaultClientAdapter,
	SafeClientAdapter,
} from "@proxify/core"
import { ClientRegistryService, ControllerService, ProxifyService } from "../services"

export interface DIContainer {
	// Services
	proxifyService: ProxifyService
	controllerService: ControllerService
	clientRegistryService: ClientRegistryService

	// Repositories
	proxifyRepository: ProxifyRepository
	controllerRepository: ProxifyControllerRepository<string>
	clientRegistryRepository: ProxifyClientRegistryRepository<string>

	// Clients
	proxifyVaultClient: ProxifyVaultClientAdapter
	controllerClient: ProxifyControllerClientAdapter
	clientRegistryClient: ProxifyClientRegistryClientAdapter
	safeClient?: SafeClientAdapter
}

export class ServiceContainer implements DIContainer {
	public readonly proxifyService: ProxifyService
	public readonly controllerService: ControllerService
	public readonly clientRegistryService: ClientRegistryService

	constructor(
		public readonly proxifyRepository: ProxifyRepository,
		public readonly controllerRepository: ProxifyControllerRepository<string>,
		public readonly clientRegistryRepository: ProxifyClientRegistryRepository<string>,
		public readonly proxifyVaultClient: ProxifyVaultClientAdapter,
		public readonly controllerClient: ProxifyControllerClientAdapter,
		public readonly clientRegistryClient: ProxifyClientRegistryClientAdapter,
		public readonly safeClient?: SafeClientAdapter,
	) {
		// Initialize services with their dependencies
		this.proxifyService = new ProxifyService({
			proxifyRepository: this.proxifyRepository,
			safeClient: this.safeClient,
		})

		this.controllerService = new ControllerService({
			controllerRepository: this.controllerRepository,
		})

		this.clientRegistryService = new ClientRegistryService({
			clientRegistryRepository: this.clientRegistryRepository,
		})
	}
}

// Factory function to create the container
export function createServiceContainer(
	proxifyRepository: ProxifyRepository,
	controllerRepository: ProxifyControllerRepository<string>,
	clientRegistryRepository: ProxifyClientRegistryRepository<string>,
	proxifyVaultClient: ProxifyVaultClientAdapter,
	controllerClient: ProxifyControllerClientAdapter,
	clientRegistryClient: ProxifyClientRegistryClientAdapter,
	safeClient?: SafeClientAdapter,
): DIContainer {
	return new ServiceContainer(
		proxifyRepository,
		controllerRepository,
		clientRegistryRepository,
		proxifyVaultClient,
		controllerClient,
		clientRegistryClient,
		safeClient,
	)
}
