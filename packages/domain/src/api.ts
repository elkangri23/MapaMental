/** Error payload shared by JSON API responses and terminal AI generation events. */
export interface ApiErrorResponse {
  code: string;
  message: string;
  correlationId: string;
}
