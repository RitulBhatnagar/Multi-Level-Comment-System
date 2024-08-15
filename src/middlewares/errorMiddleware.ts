export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED_REQUEST = 401,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  BAD_INPUT = 422,
  INTERNAL_SERVER_ERROR = 500,
  ALREADY_EXISTS = 409,
  SUCCESS = 200,
  SUCCESS_CREATED = 201,
  SUCCESS_NO_CONTENT = 204,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHERS = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  UNAUTHORIZED = 403,
  FORBIDDEN = 401,
  NOT_ALLOWED = 405,
  INTERNAL_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  PCP_CONSTRAINT = 400,
}

class BaseError extends Error {
  public readonly name: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(
    name: string,
    httpCode: HttpStatusCode,
    isOperational: boolean,
    description: string
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export default class APIError extends BaseError {
  constructor(
    name = "INTERNAL_ERROR",
    httpCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational = false,
    description = "Internal server error"
  ) {
    super(name, httpCode, isOperational, description);
  }
}
