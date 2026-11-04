import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { viewings, clients, properties, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

const viewingCreateSchema = z.object({
  propertyId: z.string().uuid(),
  clientId: z.string().uuid(),
  agentId: z.string().uuid().optional(),
  scheduledAt: z.string().transform(v => new Date(v)),
  status: z.enum(['zakazano', 'odrzano', 'otkazano']).default('zakazano'),
  note: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const items = await db
      .select({
        id: viewings.id,
        scheduledAt: viewings.scheduledAt,
        status: viewings.status,
        note: viewings.note,
        createdAt: viewings.createdAt,
        clientName: clients.fullName,
        clientPhone: clients.phone,
        propertyTitle: properties.title,
        propertyAddress: properties.address,
        propertyCity: properties.city,
        agentName: users.fullName,
      })
      .from(viewings)
      .leftJoin(clients, eq(viewings.clientId, clients.id))
      .leftJoin(properties, eq(viewings.propertyId, properties.id))
      .leftJoin(users, eq(viewings.agentId, users.id))
      .orderBy(desc(viewings.scheduledAt));

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri dohvatanju razgledanja' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = viewingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neispravni podaci', details: parsed.error.format() }, { status: 400 });
    }

    const [newViewing] = await db
      .insert(viewings)
      .values({
        ...parsed.data,
        agentId: parsed.data.agentId || user.id,
      })
      .returning();

    return NextResponse.json({ item: newViewing }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri zakazivanju' }, { status: 500 });
  }
}
