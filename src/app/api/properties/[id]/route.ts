import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { properties, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const propertyUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(['stan', 'kuca', 'lokal', 'plac']).optional(),
  purpose: z.enum(['prodaja', 'izdavanje']).optional(),
  priceEur: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  areaM2: z.number().int().positive().optional(),
  rooms: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  address: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  status: z.enum(['slobodno', 'rezervisano', 'prodato']).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  agentId: z.string().uuid().optional(),
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
    const [prop] = await db
      .select({
        id: properties.id,
        title: properties.title,
        type: properties.type,
        purpose: properties.purpose,
        priceEur: properties.priceEur,
        areaM2: properties.areaM2,
        rooms: properties.rooms,
        address: properties.address,
        city: properties.city,
        lat: properties.lat,
        lng: properties.lng,
        status: properties.status,
        description: properties.description,
        imageUrl: properties.imageUrl,
        createdAt: properties.createdAt,
        agentId: properties.agentId,
        agentName: users.fullName,
      })
      .from(properties)
      .leftJoin(users, eq(properties.agentId, users.id))
      .where(eq(properties.id, id));

    if (!prop) {
      return NextResponse.json({ error: 'Nekretnina nije pronađena' }, { status: 404 });
    }

    return NextResponse.json({ item: prop });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri dohvatanju nekretnine' }, { status: 500 });
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
    const [existing] = await db.select().from(properties).where(eq(properties.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Nekretnina nije pronađena' }, { status: 404 });
    }

    // Role check: samo admin ili agent zadužen za tu nekretninu
    if (user.role !== 'admin' && existing.agentId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za izmenu ove nekretnine' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = propertyUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(properties)
      .set(parsed.data)
      .where(eq(properties.id, id))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri ažuriranju nekretnine' }, { status: 500 });
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
    const [existing] = await db.select().from(properties).where(eq(properties.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Nekretnina nije pronađena' }, { status: 404 });
    }

    if (user.role !== 'admin' && existing.agentId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za brisanje ove nekretnine' }, { status: 403 });
    }

    await db.delete(properties).where(eq(properties.id, id));
    return NextResponse.json({ message: 'Nekretnina je uspešno obrisana' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri brisanju nekretnine' }, { status: 500 });
  }
}
