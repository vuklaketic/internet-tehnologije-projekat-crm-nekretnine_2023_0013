import { describe, it, expect } from 'vitest';
import { signAuthToken, verifyAuthToken } from '../src/lib/auth';
import bcrypt from 'bcrypt';

describe('Autentifikacija & JWT Helperi', () => {
  const dummyUser = {
    userId: '11111111-1111-1111-1111-111111111111',
    email: 'test@crm.rs',
    role: 'agent',
  };

  it('uspešno potpisuje i verifikuje validan JWT token', () => {
    const token = signAuthToken(dummyUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const payload = verifyAuthToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(dummyUser.userId);
    expect(payload?.email).toBe(dummyUser.email);
    expect(payload?.role).toBe(dummyUser.role);
  });

  it('vraća null kada je token neispravan ili modifikovan', () => {
    const invalidToken = 'neispravan.jwt.token';
    const result = verifyAuthToken(invalidToken);
    expect(result).toBeNull();
  });

  it('pravilno hešuje lozinku i proverava bcrypt validnost', async () => {
    const plainPassword = 'TajnaLozinka123!';
    const hash = await bcrypt.hash(plainPassword, 10);

    expect(hash).not.toBe(plainPassword);

    const isMatch = await bcrypt.compare(plainPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('PogresnaLozinka', hash);
    expect(isWrongMatch).toBe(false);
  });
});
