import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signAuthToken, AUTH_COOKIE, cookieOpts } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Neispravna email adresa'),
  password: z.string().min(1, 'Lozinka je obavezna'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci za prijavu', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Pogrešan email ili lozinka' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passHash);
    if (!match) {
      return NextResponse.json(
        { error: 'Pogrešan email ili lozinka' },
        { status: 401 }
      );
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({ user: safeUser }, { status: 200 });
    response.cookies.set(AUTH_COOKIE, token, cookieOpts);
    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Greška pri prijavi' }, { status: 500 });
  }
}
