import { NextResponse } from 'next/server';

export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'CRM Nekretnine API',
      version: '1.0.0',
      description: 'Zvanična REST API dokumentacija za sistem upravljanja nekretninama i klijentima (FON Internet Tehnologije).',
      contact: {
        name: 'Vuk Laketić',
        email: 'vuklaketic@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Lokalno razvojno okruženje',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth',
          description: 'JWT token skladišten u httpOnly i sameSite: lax kolačiću pod nazivom auth.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'agent'] },
          },
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['stan', 'kuca', 'lokal', 'plac'] },
            purpose: { type: 'string', enum: ['prodaja', 'izdavanje'] },
            priceEur: { type: 'string' },
            areaM2: { type: 'integer' },
            rooms: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            status: { type: 'string', enum: ['slobodno', 'rezervisano', 'prodato'] },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            type: { type: 'string', enum: ['kupac', 'prodavac', 'zakupac'] },
            budgetEur: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid', nullable: true },
            stage: { type: 'string', enum: ['novi', 'kontaktiran', 'razgledanje', 'ponuda', 'zakljuceno', 'izgubljeno'] },
            valueEur: { type: 'string' },
            note: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          summary: 'Prijava na sistem',
          tags: ['Autentifikacija'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Uspešna prijava, postavljen auth cookie' },
            400: { description: 'Neispravni podaci tela zahteva' },
            401: { description: 'Pogrešan email ili lozinka' },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Registracija novog naloga',
          tags: ['Autentifikacija'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullName', 'email', 'password'],
                  properties: {
                    fullName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    role: { type: 'string', enum: ['admin', 'agent'], default: 'agent' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Korisnik uspešno registrovan' },
            400: { description: 'Korisnik već postoji ili neispravni podaci' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Trenutno prijavljeni korisnik',
          tags: ['Autentifikacija'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Podaci o ulogovanom korisniku' },
            401: { description: 'Neautorizovan pristup' },
          },
        },
      },
      '/properties': {
        get: {
          summary: 'Izlistavanje nekretnina sa filterima i paginacijom',
          tags: ['Nekretnine'],
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Pretraga po naslovu/adresi/gradu' },
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Tip nekretnine (stan, kuca, lokal, plac)' },
            { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Status (slobodno, rezervisano, prodato)' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Lista nekretnina sa ukupnim brojem' },
          },
        },
        post: {
          summary: 'Kreiranje nove nekretnine',
          tags: ['Nekretnine'],
          security: [{ cookieAuth: [] }],
          responses: {
            201: { description: 'Nekretnina uspešno kreirana' },
            400: { description: 'Validaciona greška' },
          },
        },
      },
      '/properties/{id}': {
        get: {
          summary: 'Detalji pojedinačne nekretnine',
          tags: ['Nekretnine'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Pronađena nekretnina' },
            404: { description: 'Nije pronađena' },
          },
        },
        put: {
          summary: 'Ažuriranje nekretnine',
          tags: ['Nekretnine'],
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Nekretnina ažurirana' },
            403: { description: 'Nedovoljna ovlašćenja' },
          },
        },
        delete: {
          summary: 'Brisanje nekretnine',
          tags: ['Nekretnine'],
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Obrisana' },
            403: { description: 'Nedovoljna ovlašćenja' },
          },
        },
      },
      '/currency': {
        get: {
          summary: 'Dohvatanje zvaničnog kursa EUR/RSD preko eksternog API-ja',
          tags: ['Eksterni API'],
          responses: {
            200: { description: 'Kurs EUR u odnosu na RSD sa serverskim keširanjem' },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
