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
    case 507: return 'INSUFFICIENT_STORAGE';
    default: return statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED';
  }
}

export function sendApiError(request: FastifyRequest, reply: FastifyReply, statusCode: number, message: string) {
  const safeMessage = statusCode === 507
    ? 'No hay espacio suficiente para guardar los cambios. Libera espacio e inténtalo de nuevo.'
    : statusCode >= 500
      ? 'No se pudo completar la petición. Revisa el estado del servicio e inténtalo de nuevo.'
      : message;
  return reply.code(statusCode).send({ code: apiErrorCode(statusCode), message: safeMessage, correlationId: request.id });
}

/** Keep expected application errors useful while hiding unexpected library and storage errors. */
export function sendCaughtApiError(request: FastifyRequest, reply: FastifyReply, error: unknown) {
  const failure = error as { statusCode?: unknown; message?: unknown; name?: unknown; code?: unknown } | null;
  const statusCode = failure?.code === 'ENOSPC' ? 507 : Number.isInteger(failure?.statusCode)
    && (failure!.statusCode as number) >= 400 && (failure!.statusCode as number) < 500
    ? failure!.statusCode as number
    : 500;
  if (statusCode >= 500) {
    request.log.error({ reqId: request.id, name: typeof failure?.name === 'string' ? failure.name : 'UnknownError' }, 'Error interno de una operación protegida; detalle omitido.');
  }
  const message = statusCode === 507
    ? 'No hay espacio suficiente para guardar los cambios. Libera espacio e inténtalo de nuevo.'
    : statusCode >= 500
      ? 'No se pudo completar la operación. Inténtalo de nuevo.'
      : typeof failure?.message === 'string' ? failure.message : 'No se pudo completar la operación.';
  return sendApiError(request, reply, statusCode, message);
}

export function normalizeApiErrorPayload(request: FastifyRequest, statusCode: number, payload: string): string {
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(payload);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) body = parsed as Record<string, unknown>;
  } catch { /* Replace malformed error payloads with the standard safe envelope. */ }

  const message = statusCode === 507
    ? 'No hay espacio suficiente para guardar los cambios. Libera espacio e inténtalo de nuevo.'
    : statusCode >= 500
      ? 'No se pudo completar la petición. Revisa el estado del servicio e inténtalo de nuevo.'
      : typeof body.message === 'string' ? body.message : 'No se pudo completar la petición.';
  return JSON.stringify({
    ...body,
    code: apiErrorCode(statusCode),
    message,
    correlationId: request.id,
  });
}
