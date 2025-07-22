export interface EmailTokenPayload {
  identifier: string;
  t: 'verify-email';
}

export function isEmailTokenPayload(
  payload: unknown,
): payload is EmailTokenPayload {
  if (typeof payload !== 'object' || payload === null) return false;

  const obj = payload as Record<string, unknown>;

  return typeof obj.identifier === 'string' && obj.t === 'verify-email';
}
