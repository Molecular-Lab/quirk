export interface ErrorResponse<T = string> {
	errorCode: T
	message: string
}

export interface APIResponse<T> {
	result: T
}
