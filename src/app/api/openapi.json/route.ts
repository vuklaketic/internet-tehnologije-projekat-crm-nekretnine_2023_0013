import { NextResponse } from 'next/server';

export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'CRM Nekretnine REST API',
      version: '1.2.0',
      description: 'Zvanična REST API specifikacija za CRM sistem preduzeća za promet nekretnina (FON Internet Tehnologije, 2026/2027).',
      contact: {
        name: 'Vuk Laketić',
        email: 'vuklaketic@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Lokalni razvojni server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth',
          description: 'Sigurni JWT token (HS256) skladišten u httpOnly i sameSite: lax kolačiću.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'agent', 'kupac'] },
            createdAt: { type: 'string', format: 'date-time' },
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
            lat: { type: 'string', nullable: true },
            lng: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['slobodno', 'rezervisano', 'prodato'] },
            description: { type: 'string', nullable: true },
            imageUrl: { type: 'string', nullable: true },
            agentId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
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
            budgetEur: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            ownerId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid', nullable: true },
            stage: { type: 'string', enum: ['novi', 'kontaktiran', 'razgledanje', 'ponuda', 'zakljuceno', 'izgubljeno'] },
            valueEur: { type: 'string', nullable: true },
            note: { type: 'string', nullable: true },
            agentId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Viewing: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            propertyId: { type: 'string', format: 'uuid' },
            clientId: { type: 'string', format: 'uuid' },
            agentId: { type: 'string', format: 'uuid', nullable: true },
            scheduledAt: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['zakazano', 'odrzano', 'otkazano'] },
            note: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
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
            400: { description: 'Neispravni kredencijali' },
            401: { description: 'Pogrešna lozinka ili email' },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Registracija novog naloga (3 uloge)',
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
                    role: { type: 'string', enum: ['admin', 'agent', 'kupac'], default: 'kupac' },
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
      '/auth/reset-password': {
        post: {
          summary: 'Oporavak zaboravljene lozinke',
          tags: ['Autentifikacija'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'newPassword', 'confirmPassword'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    newPassword: { type: 'string', minLength: 6 },
                    confirmPassword: { type: 'string', minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Lozinka uspešno resetovana' },
            400: { description: 'Lozinke se ne poklapaju ili su prekratke' },
            404: { description: 'Korisnik nije pronađen' },
          },
        },
      },
      '/auth/me': {
        get: {
          summary: 'Podaci o trenutno prijavljenom korisniku',
          tags: ['Autentifikacija'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Objekat sa ulogom i podacima korisnika' },
            401: { description: 'Neautorizovan pristup' },
          },
        },
      },
      '/auth/logout': {
        post: {
          summary: 'Odjava korisnika i brisanje kolačića',
          tags: ['Autentifikacija'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Kolačić uspešno obrisan' },
          },
        },
      },
      '/properties': {
        get: {
          summary: 'Paginirani katalog nekretnina sa pretragom i sortiranjem',
          tags: ['Nekretnine'],
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Pretraga po naslovu/adresi/gradu' },
            { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Tip (stan, kuca, lokal, plac)' },
            { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Status (slobodno, rezervisano, prodato)' },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'area_asc', 'area_desc'] }, description: 'Kriterijum sortiranja' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Niz nekretnina sa ukupnim brojem' },
          },
        },
        post: {
          summary: 'Dodavanje nove nekretnine (Admin i Agent)',
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
            200: { description: 'Pronađena nekretnina sa agentom i koordinatama' },
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
          summary: 'Brisanje nekretnine iz baze',
          tags: ['Nekretnine'],
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Uspešno obrisana' },
            403: { description: 'Nedovoljna ovlašćenja' },
          },
        },
      },
      '/upload': {
        post: {
          summary: 'Otpremanje slike nekretnine na server',
          tags: ['Upload'],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Slika uspešno sačuvana, vraća URL /uploads/...' },
            400: { description: 'Pogrešan format ili veličina preko 5MB' },
          },
        },
      },
      '/clients': {
        get: {
          summary: 'Baza klijenata (filtrirana po ulozi i vlasniku)',
          tags: ['Klijenti'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Lista klijenata' },
          },
        },
        post: {
          summary: 'Unos novog klijenta (kupac, prodavac, zakupac)',
          tags: ['Klijenti'],
          security: [{ cookieAuth: [] }],
          responses: {
            201: { description: 'Klijent kreiran' },
          },
        },
      },
      '/leads': {
        get: {
          summary: 'Prodajne prilike po fazama za Kanban tablu',
          tags: ['Prodajne prilike'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Niz prilika' },
          },
        },
        post: {
          summary: 'Kreiranje nove prodajne prilike',
          tags: ['Prodajne prilike'],
          security: [{ cookieAuth: [] }],
          responses: {
            201: { description: 'Kreirana prilika' },
          },
        },
      },
      '/viewings': {
        get: {
          summary: 'Raspored termina razgledanja (svi za agente/admina, sopstveni za kupca)',
          tags: ['Razgledanja'],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Lista zakazanih termina' },
          },
        },
        post: {
          summary: 'Zakazivanje novog razgledanja',
          tags: ['Razgledanja'],
          security: [{ cookieAuth: [] }],
          responses: {
            201: { description: 'Termin uspešno zabeležen' },
          },
        },
      },
      '/currency': {
        get: {
          summary: 'Dohvatanje live kursa valuta preko open.er-api.com (EUR, RSD, USD, CHF, GBP)',
          tags: ['Eksterni API'],
          responses: {
            200: { description: 'Rečnik kurseva sa bazom EUR i trajanjem keša od 1h' },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
