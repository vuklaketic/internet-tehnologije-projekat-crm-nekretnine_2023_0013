import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { clients, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const clientUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  type: z.enum(['kupac', 'prodavac', 'zakupac']).optional(),
  budgetEur: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  notes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { id } = await params;
    const [client] = await db
      .select({
        id: clients.id,
        fullName: clients.fullName,
        email: clients.email,
        phone: clients.phone,
        type: clients.type,
        budgetEur: clients.budgetEur,
        notes: clients.notes,
        createdAt: clients.createdAt,
        ownerId: clients.ownerId,
        ownerName: users.fullName,
      })
      .from(clients)
      .leftJoin(users, eq(clients.ownerId, users.id))
      .where(eq(clients.id, id));

    if (!client) {
      return NextResponse.json({ error: 'Klijent nije pronađen' }, { status: 404 });
    }

    if (user.role !== 'admin' && client.ownerId !== user.id) {
      return NextResponse.json({ error: 'Nemate pristup podacima ovog klijenta' }, { status: 403 });
    }

    return NextResponse.json({ item: client });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri dohvatanju klijenta' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { id } = await params;
    const [existing] = await db.select().from(clients).where(eq(clients.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Klijent nije pronađen' }, { status: 404 });
    }

    if (user.role !== 'admin' && existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za izmenu ovog klijenta' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = clientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(clients)
      .set(parsed.data)
      .where(eq(clients.id, id))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri ažuriranju klijenta' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { id } = await params;
    const [existing] = await db.select().from(clients).where(eq(clients.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Klijent nije pronađen' }, { status: 404 });
    }

    if (user.role !== 'admin' && existing.ownerId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za brisanje ovog klijenta' }, { status: 403 });
    }

    await db.delete(clients).where(eq(clients.id, id));
    return NextResponse.json({ message: 'Klijent je uspešno obrisan' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri brisanju klijenta' }, { status: 500 });
  }
}
