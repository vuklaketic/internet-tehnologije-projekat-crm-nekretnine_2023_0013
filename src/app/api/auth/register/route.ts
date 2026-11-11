import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signAuthToken, AUTH_COOKIE, cookieOpts } from '@/lib/auth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ime i prezime moraju imati bar 2 karaktera'),
  email: z.string().email('Neispravna email adresa'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  role: z.enum(['admin', 'agent', 'kupac']).default('kupac'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, email, password, role } = parsed.data;

    // Provera da li korisnik već postoji
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, email.toLowerCase())) // wait, email column
      .limit(1);

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Korisnik sa ovim email-om već postoji' },
        { status: 400 }
      );
    }

    const passHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        email: email.toLowerCase(),
        passHash,
        role,
      })
      .returning({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    const token = signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({ user: newUser }, { status: 201 });
    response.cookies.set(AUTH_COOKIE, token, cookieOpts);
    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Greška pri registraciji' }, { status: 500 });
  }
}
