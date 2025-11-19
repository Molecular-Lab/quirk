import { type AppRouter } from "@ts-rest/core"

import { RawAPIClient } from "../rawClient"

export class Router<T extends AppRouter> {
	constructor(protected client: RawAPIClient<T>) {}
}
