/**
 * Base Router class for domain routers
 */

import { type AppRouter } from "@ts-rest/core";
import { type RawAPIClient } from "./rawClient";

export class Router<T extends AppRouter> {
	constructor(protected readonly client: RawAPIClient<T>) {}
}
