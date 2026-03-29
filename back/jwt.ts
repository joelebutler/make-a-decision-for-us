import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = Bun.env.JWT_SECRET || 'supersecretkey';
const encoder = new TextEncoder();

export async function signJwt(payload: object, expiresIn = '7d') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(JWT_SECRET));
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}
