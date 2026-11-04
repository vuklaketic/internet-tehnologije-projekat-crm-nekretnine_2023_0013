import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

const leadUpdateSchema = z.object({
  stage: z.enum(['novi', 'kontaktiran', 'razgledanje', 'ponuda', 'zakljuceno', 'izgubljeno']).optional(),
  valueEur: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  note: z.string().optional(),
  agentId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional().nullable(),
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
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));

    if (!lead) {
      return NextResponse.json({ error: 'Prodajna prilika nije pronađena' }, { status: 404 });
    }

    if (user.role !== 'admin' && lead.agentId !== user.id) {
      return NextResponse.json({ error: 'Nemate pristup ovoj prodajnoj prilici' }, { status: 403 });
    }

    return NextResponse.json({ item: lead });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri dohvatanju prodajne prilike' }, { status: 500 });
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
    const [existing] = await db.select().from(leads).where(eq(leads.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Prodajna prilika nije pronađena' }, { status: 404 });
    }

    if (user.role !== 'admin' && existing.agentId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za izmenu ove prodajne prilike' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(leads)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri ažuriranju prodajne prilike' }, { status: 500 });
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
    const [existing] = await db.select().from(leads).where(eq(leads.id, id));
    if (!existing) {
      return NextResponse.json({ error: 'Prodajna prilika nije pronađena' }, { status: 404 });
    }

    if (user.role !== 'admin' && existing.agentId !== user.id) {
      return NextResponse.json({ error: 'Nemate dozvolu za brisanje ove prodajne prilike' }, { status: 403 });
    }

    await db.delete(leads).where(eq(leads.id, id));
    return NextResponse.json({ message: 'Prodajna prilika je uspešno obrisana' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Greška pri brisanju' }, { status: 500 });
  }
}
