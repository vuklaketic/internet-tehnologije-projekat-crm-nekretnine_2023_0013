import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { viewings, clients, properties, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

const viewingCreateSchema = z.object({
  propertyId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  agentId: z.string().uuid().optional(),
  scheduledAt: z.string().transform((v) => new Date(v)),
  status: z.enum(['zakazano', 'odrzano', 'otkazano']).default('zakazano'),
  note: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const whereClause = user.role === 'kupac' ? eq(clients.email, user.email) : undefined;

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
      .where(whereClause)
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

    let finalClientId = parsed.data.clientId;

    if (!finalClientId && user.role === 'kupac') {
      const [existingClient] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.email, user.email))
        .limit(1);

      if (existingClient) {
        finalClientId = existingClient.id;
      } else {
        const [createdClient] = await db
          .insert(clients)
          .values({
            fullName: user.fullName,
            email: user.email,
            phone: '0601234567',
            type: 'kupac',
          })
          .returning({ id: clients.id });
        finalClientId = createdClient.id;
      }
    }

    if (!finalClientId) {
      return NextResponse.json({ error: 'Morate izabrati klijenta za razgledanje' }, { status: 400 });
    }

    // Odredi agenta nekretnine ako nije poslat
    let finalAgentId = parsed.data.agentId;
    if (!finalAgentId) {
      const [prop] = await db
        .select({ agentId: properties.agentId })
        .from(properties)
        .where(eq(properties.id, parsed.data.propertyId))
        .limit(1);
      finalAgentId = prop?.agentId || (user.role === 'agent' ? user.id : null);
    }

    const [newViewing] = await db
      .insert(viewings)
      .values({
        propertyId: parsed.data.propertyId,
        clientId: finalClientId,
        agentId: finalAgentId,
        scheduledAt: parsed.data.scheduledAt,
        status: parsed.data.status,
        note: parsed.data.note,
      })
      .returning();

    return NextResponse.json({ item: newViewing }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri zakazivanju' }, { status: 500 });
  }
}
