import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { leads, clients, properties, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql, desc } from 'drizzle-orm';

const leadCreateSchema = z.object({
  clientId: z.string().uuid('Neispravan ID klijenta'),
  propertyId: z.string().uuid().optional().nullable(),
  stage: z.enum(['novi', 'kontaktiran', 'razgledanje', 'ponuda', 'zakljuceno', 'izgubljeno']).default('novi'),
  valueEur: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  note: z.string().optional(),
  agentId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (user.role !== 'admin') {
      conditions.push(eq(leads.agentId, user.id));
    }

    if (stage) {
      conditions.push(eq(leads.stage, stage));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: leads.id,
        stage: leads.stage,
        valueEur: leads.valueEur,
        note: leads.note,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        clientId: leads.clientId,
        clientName: clients.fullName,
        clientEmail: clients.email,
        clientPhone: clients.phone,
        propertyId: leads.propertyId,
        propertyTitle: properties.title,
        propertyCity: properties.city,
        agentId: leads.agentId,
        agentName: users.fullName,
      })
      .from(leads)
      .leftJoin(clients, eq(leads.clientId, clients.id))
      .leftJoin(properties, eq(leads.propertyId, properties.id))
      .leftJoin(users, eq(leads.agentId, users.id))
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(whereClause);

    const total = countResult ? countResult.count : 0;

    return NextResponse.json({ items, total, page, pageSize });
  } catch (err: any) {
    console.error('Fetch leads error:', err);
    return NextResponse.json({ error: 'Greška pri dohvatanju prodajnih prilika' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = leadCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [newLead] = await db
      .insert(leads)
      .values({
        ...parsed.data,
        agentId: user.role === 'admin' && parsed.data.agentId ? parsed.data.agentId : user.id,
      })
      .returning();

    return NextResponse.json({ item: newLead }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri kreiranju prodajne prilike' }, { status: 500 });
  }
}
