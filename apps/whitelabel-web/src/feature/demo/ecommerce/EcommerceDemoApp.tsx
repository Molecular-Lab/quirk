/**
 * E-commerce Demo App
 *
 * Thin wrapper around BaseDemoApp using the ecommerce platform configuration.
 * This maintains backward compatibility while using the shared demo infrastructure.
 */

import { BaseDemoApp, ecommerceConfig } from "../shared"

export function EcommerceDemoApp() {
	return <BaseDemoApp config={ecommerceConfig} />
}
