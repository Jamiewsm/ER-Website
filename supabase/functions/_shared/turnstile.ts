// Cloudflare Turnstile 토큰 검증

export async function verifyTurnstileToken(token: string, secret: string, remoteIp?: string): Promise<boolean> {
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY missing — skipping verification');
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.success);
}
