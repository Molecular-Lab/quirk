/**
 * Gig Workers Demo App
 *
 * Thin wrapper around BaseDemoApp using the gig workers platform configuration.
 * This maintains backward compatibility while using the shared demo infrastructure.
 */

import { BaseDemoApp, gigWorkersConfig } from "../shared"

export function GigWorkersDemoApp() {
	return <BaseDemoApp config={gigWorkersConfig} />
}
