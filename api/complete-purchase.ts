import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Must match quantallm-sdk LicenseKey.kt derivation exactly:
//   SECRET_HASH = "quantallm-sdk-v1" (bytes)
//   SECRET_SALT = "QLM-2026-license" (bytes)
//   SHA-256(SECRET_HASH + SECRET_SALT) = derived secret
const SECRET_HASH = Buffer.from('quantallm-sdk-v1', 'utf-8');
const SECRET_SALT = Buffer.from('QLM-2026-license', 'utf-8');
const DERIVED_SECRET = crypto.createHash('sha256').update(Buffer.concat([SECRET_HASH, SECRET_SALT])).digest();

// Lifetime expiry — 9999-12-31
const LIFETIME_EXP = 253402300799;

interface Payload {
  pkg: string;
  exp: number;
  iat: number;
  tier: string;
}

function base64UrlEncode(data: Buffer): string {
  return data.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateLicenseKey(pkgName: string, tier: string): string {
  const now = Math.floor(Date.now() / 1000);

  const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payloadObj: Payload = { pkg: pkgName, exp: LIFETIME_EXP, iat: now, tier };
  const payload = base64UrlEncode(Buffer.from(JSON.stringify(payloadObj)));

  const signInput = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', DERIVED_SECRET).update(signInput).digest();
  const sigB64 = base64UrlEncode(signature);

  return `${header}.${payload}.${sigB64}`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept GET (Dodo redirect) and POST (Dodo webhook)
  if (req.method === 'GET') {
    // Dodo redirect after payment
    const { license_key: dodoKey, payment_id, status } = req.query;

    if (status !== 'succeeded' && status !== 'completed') {
      res.redirect(302, '/developer/success?status=failed');
      return;
    }

    if (!dodoKey) {
      res.redirect(302, '/developer/success?status=failed&reason=no_license_key');
      return;
    }

    // Generate proper HMAC-signed license key
    // Developer tier uses '*' wildcard — accepted by any package
    const hmacKey = generateLicenseKey('*', 'developer');

    console.log(`[complete-purchase] Dodo key=${dodoKey} payment=${payment_id} status=${status}`);
    console.log(`[complete-purchase] Generated HMAC key for tier=developer`);

    res.redirect(
      302,
      `/developer/success?license_key=${encodeURIComponent(hmacKey)}&payment_id=${payment_id || ''}`
    );
    return;
  }

  if (req.method === 'POST') {
    // Dodo webhook — for future use (async fulfillment)
    res.status(200).json({ received: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
