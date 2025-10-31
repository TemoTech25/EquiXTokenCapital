export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (code: string, message: string) => new HttpError(400, code, message);
export const unauthorized = (message = "Unauthorized") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Forbidden") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Not Found") => new HttpError(404, "NOT_FOUND", message);
