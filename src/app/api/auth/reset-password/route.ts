import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Neispravna email adresa'),
    newPassword: z.string().min(6, 'Nova lozinka mora imati najmanje 6 karaktera'),
    confirmPassword: z.string().min(6, 'Potvrda lozinke mora imati najmanje 6 karaktera'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Neispravni podaci';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, newPassword } = parsed.data;

    // Provera da li nalog postoji
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Nalog sa navedenom email adresom nije pronađen' },
        { status: 404 }
      );
    }

    const newPassHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ passHash: newPassHash })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { message: 'Lozinka je uspešno resetovana. Možete se prijaviti sa novom lozinkom.' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Password reset error:', err);
    return NextResponse.json(
      { error: 'Greška pri resetovanju lozinke na serveru' },
      { status: 500 }
    );
  }
}
