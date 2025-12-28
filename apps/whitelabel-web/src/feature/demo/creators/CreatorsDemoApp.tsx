/**
 * Creators Demo App
 *
 * Thin wrapper around BaseDemoApp using the creators platform configuration.
 * This maintains backward compatibility while using the shared demo infrastructure.
 */

import { BaseDemoApp, creatorsConfig } from "../shared"

export function CreatorsDemoApp() {
	return <BaseDemoApp config={creatorsConfig} />
}
