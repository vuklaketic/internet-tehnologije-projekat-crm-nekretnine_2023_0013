import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { properties, users } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, ilike, and, sql, desc } from 'drizzle-orm';

const propertyCreateSchema = z.object({
  title: z.string().min(3, 'Naslov mora imati bar 3 karaktera'),
  type: z.enum(['stan', 'kuca', 'lokal', 'plac']),
  purpose: z.enum(['prodaja', 'izdavanje']),
  priceEur: z.union([z.number(), z.string()]).transform(v => String(v)),
  areaM2: z.number().int().positive('Kvadratura mora biti pozitivan broj'),
  rooms: z.union([z.number(), z.string()]).transform(v => String(v)).default('1'),
  address: z.string().min(2, 'Adresa je obavezna'),
  city: z.string().min(2, 'Grad je obavezan'),
  status: z.enum(['slobodno', 'rezervisano', 'prodato']).default('slobodno'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  agentId: z.string().uuid().optional(),
  lat: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
  lng: z.union([z.number(), z.string()]).transform(v => String(v)).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (q) {
      conditions.push(sql`(${properties.title} ILIKE ${'%' + q + '%'} OR ${properties.address} ILIKE ${'%' + q + '%'} OR ${properties.city} ILIKE ${'%' + q + '%'})`);
    }

    if (status) {
      conditions.push(eq(properties.status, status));
    }

    if (type) {
      conditions.push(eq(properties.type, type));
    }

    if (purpose) {
      conditions.push(eq(properties.purpose, purpose));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderExpr = desc(properties.createdAt);
    if (sort === 'price_asc') {
      orderExpr = sql`cast(${properties.priceEur} as numeric) asc`;
    } else if (sort === 'price_desc') {
      orderExpr = sql`cast(${properties.priceEur} as numeric) desc`;
    } else if (sort === 'area_asc') {
      orderExpr = sql`${properties.areaM2} asc`;
    } else if (sort === 'area_desc') {
      orderExpr = sql`${properties.areaM2} desc`;
    }

    const items = await db
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
        status: properties.status,
        description: properties.description,
        imageUrl: properties.imageUrl,
        createdAt: properties.createdAt,
        agentId: properties.agentId,
        agentName: users.fullName,
      })
      .from(properties)
      .leftJoin(users, eq(properties.agentId, users.id))
      .where(whereClause)
      .orderBy(orderExpr)
      .limit(pageSize)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(whereClause);

    const total = countResult ? countResult.count : 0;

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (err: any) {
    console.error('Fetch properties error:', err);
    return NextResponse.json({ error: 'Greška pri dohvatanju nekretnina' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Niste autorizovani' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = propertyCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neispravni podaci', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newProp = await db
      .insert(properties)
      .values({
        ...parsed.data,
        agentId: parsed.data.agentId || user.id,
      })
      .returning();

    return NextResponse.json({ item: newProp[0] }, { status: 201 });
  } catch (err: any) {
    console.error('Create property error:', err);
    return NextResponse.json({ error: 'Greška pri kreiranju nekretnine' }, { status: 500 });
  }
}
