export interface OkResponse<T> {
	result: T
}

export interface ErrorResponse<Code extends string> {
	code: Code
	error: string
}

export type HandlerResponse<Data = unknown, ErrorCode extends string = string> =
	| OkResponse<Data>
	| ErrorResponse<ErrorCode>
