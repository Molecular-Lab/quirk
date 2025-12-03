/**
 * Custom error classes for Proxify SDK
 */

export class ProxifyError extends Error {
  public readonly statusCode?: number
  public readonly details?: any

  constructor(message: string, statusCode?: number, details?: any) {
    super(message)
    this.name = 'ProxifyError'
    this.statusCode = statusCode
    this.details = details
    Object.setPrototypeOf(this, ProxifyError.prototype)
  }
}

export class AuthenticationError extends ProxifyError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, details)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class ValidationError extends ProxifyError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class NotFoundError extends ProxifyError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, details)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class RateLimitError extends ProxifyError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 429, details)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

export class ServerError extends ProxifyError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, details)
    this.name = 'ServerError'
    Object.setPrototypeOf(this, ServerError.prototype)
  }
}

export class NetworkError extends ProxifyError {
  constructor(message: string = 'Network error occurred', details?: any) {
    super(message, undefined, details)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Parse error response and throw appropriate error
 */
export function handleApiError(error: any): never {
  if (error.response) {
    const { status, data } = error.response
    const message = data?.error || data?.message || 'An error occurred'
    const details = data?.details || data

    switch (status) {
      case 400:
        throw new ValidationError(message, details)
      case 401:
        throw new AuthenticationError(message, details)
      case 404:
        throw new NotFoundError(message, details)
      case 429:
        throw new RateLimitError(message, details)
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message, details)
      default:
        throw new ProxifyError(message, status, details)
    }
  }

  if (error.request) {
    throw new NetworkError('No response received from server', error.request)
  }

  throw new ProxifyError(error.message || 'An unknown error occurred')
}
