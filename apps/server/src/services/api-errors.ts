import type { FastifyReply, FastifyRequest } from 'fastify';

export function apiErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400: return 'INVALID_REQUEST';
    case 401: return 'AUTHENTICATION_REQUIRED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 408: return 'REQUEST_TIMEOUT';
    case 409: return 'CONFLICT';
    case 413: return 'PAYLOAD_TOO_LARGE';
    case 415: return 'UNSUPPORTED_MEDIA_TYPE';
    case 422: return 'VALIDATION_FAILED';
    case 428: return 'REAUTHENTICATION_REQUIRED';
    case 429: return 'RATE_LIMITED';
    case 500: return 'INTERNAL_ERROR';
    case 502: return 'UPSTREAM_ERROR';
    case 503: return 'SERVICE_UNAVAILABLE';
    default: return statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
  }
}

export function sendApiError(request: FastifyRequest, reply: FastifyReply, statusCode: number, message: string) {
  const safeMessage = statusCode >= 500
    ? 'No se pudo completar la petición. Revisa el estado del servicio e inténtalo de nuevo.'
    : message;
  return reply.code(statusCode).send({ code: apiErrorCode(statusCode), message: safeMessage, correlationId: request.id });
}

export function normalizeApiErrorPayload(request: FastifyRequest, statusCode: number, payload: string): string {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(payload);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
  } catch { /* Replace malformed error payloads with the standard safe envelope. */ }

  const message = statusCode >= 500
    ? 'No se pudo completar la petición. Revisa el estado del servicio e inténtalo de nuevo.'
    : typeof body.message === 'string' ? body.message : 'No se pudo completar la petición.';
  return JSON.stringify({
    ...body,
    code: apiErrorCode(statusCode),
    message,
    correlationId: request.id,
  });
}
