import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { clients, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, desc } from 'drizzle-orm';

const clientCreateSchema = z.object({
  fullName: z.string().min(2, 'Ime i prezime su obavezni'),
  email: z.string().email('Neispravna email adresa'),
  phone: z.string().min(5, 'Broj telefona je obavezan'),
  type: z.enum(['kupac', 'prodavac', 'zakupac']),
  budgetEur: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  notes: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;

    const conditions = [];

    // Role check: ako je agent, vidi samo svoje klijente
    if (user.role !== 'admin') {
      conditions.push(eq(clients.ownerId, user.id));
    }

    if (q) {
      conditions.push(sql`(${clients.fullName} ILIKE ${'%' + q + '%'} OR ${clients.email} ILIKE ${'%' + q + '%'} OR ${clients.phone} ILIKE ${'%' + q + '%'})`);
    }

    if (type) {
      conditions.push(eq(clients.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
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
      .where(whereClause)
      .orderBy(desc(clients.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients)
      .where(whereClause);

    const total = countResult ? countResult.count : 0;

    return NextResponse.json({ items, total, page, pageSize });
  } catch (err: any) {
    console.error('Fetch clients error:', err);
    return NextResponse.json({ error: 'Greška pri dohvatanju klijenata' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = clientCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [newClient] = await db
      .insert(clients)
      .values({
        ...parsed.data,
        ownerId: user.role === 'admin' && parsed.data.ownerId ? parsed.data.ownerId : user.id,
      })
      .returning();

    return NextResponse.json({ item: newClient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri kreiranju klijenta' }, { status: 500 });
  }
}
