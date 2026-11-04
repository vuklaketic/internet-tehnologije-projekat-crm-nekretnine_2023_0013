import { config } from 'dotenv';
config({ path: '.env' });

import bcrypt from 'bcrypt';
import { db } from './index';
import { users, properties, clients, leads, viewings, activities } from './schema';

async function main() {
  console.log('Seeding database...');

  const passHash = await bcrypt.hash('Test1234!', 10);

  // 1. Korisnici
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const agent1Id = 'a0000000-0000-0000-0000-000000000002';
  const agent2Id = 'a0000000-0000-0000-0000-000000000003';

  // Obriši postojeće podatke radi idempotencije
  await db.delete(activities);
  await db.delete(viewings);
  await db.delete(leads);
  await db.delete(properties);
  await db.delete(clients);
  await db.delete(users);

  await db.insert(users).values([
    {
      id: adminId,
      email: 'admin@crm.rs',
      passHash,
      fullName: 'Vuk Laketić (Administrator)',
      role: 'admin',
    },
    {
      id: agent1Id,
      email: 'agent1@crm.rs',
      passHash,
      fullName: 'Marko Petrović',
      role: 'agent',
    },
    {
      id: agent2Id,
      email: 'agent2@crm.rs',
      passHash,
      fullName: 'Jelena Jovanović',
      role: 'agent',
    },
  ]);

  // 2. Klijenti
  const client1Id = 'b0000000-0000-0000-0000-000000000001';
  const client2Id = 'b0000000-0000-0000-0000-000000000002';
  const client3Id = 'b0000000-0000-0000-0000-000000000003';
  const client4Id = 'b0000000-0000-0000-0000-000000000004';
  const client5Id = 'b0000000-0000-0000-0000-000000000005';
  const client6Id = 'b0000000-0000-0000-0000-000000000006';

  await db.insert(clients).values([
    {
      id: client1Id,
      fullName: 'Nikola Đorđević',
      email: 'nikola.djordjevic@gmail.com',
      phone: '+381 64 123 4567',
      type: 'kupac',
      budgetEur: '180000',
      notes: 'Traži dvoiposoban stan na Vračaru ili Novom Beogradu, kreditni kupac.',
      ownerId: agent1Id,
    },
    {
      id: client2Id,
      fullName: 'Milica Simić',
      email: 'milica.simic@gmail.com',
      phone: '+381 63 987 6543',
      type: 'prodavac',
      budgetEur: null,
      notes: 'Prodaje porodičnu kuću na Dedinju, nije hitno.',
      ownerId: agent1Id,
    },
    {
      id: client3Id,
      fullName: 'Stefan Radulović',
      email: 'stefan.radulovic@techcorp.rs',
      phone: '+381 60 555 4433',
      type: 'zakupac',
      budgetEur: '2000',
      notes: 'Zakup poslovnog prostora za IT firmu od 15-20 ljudi.',
      ownerId: agent2Id,
    },
    {
      id: client4Id,
      fullName: 'Ana Todorović',
      email: 'ana.todorovic@yahoo.com',
      phone: '+381 65 333 2211',
      type: 'kupac',
      budgetEur: '95000',
      notes: 'Jednosoban stan za investiciju / izdavanje.',
      ownerId: agent2Id,
    },
    {
      id: client5Id,
      fullName: 'Dragan Ilić',
      email: 'dragan.ilic@gmail.com',
      phone: '+381 62 888 9900',
      type: 'prodavac',
      budgetEur: null,
      notes: 'Prodaje građevinski plac u okolini Novog Sada.',
      ownerId: adminId,
    },
    {
      id: client6Id,
      fullName: 'Jovana Lukić',
      email: 'jovana.lukic@gmail.com',
      phone: '+381 64 777 6655',
      type: 'kupac',
      budgetEur: '320000',
      notes: 'Traži luksuzan stan u Beogradu na Vodi, gotovinsko plaćanje.',
      ownerId: agent1Id,
    },
  ]);

  // 3. Nekretnine
  const prop1Id = 'c0000000-0000-0000-0000-000000000001';
  const prop2Id = 'c0000000-0000-0000-0000-000000000002';
  const prop3Id = 'c0000000-0000-0000-0000-000000000003';
  const prop4Id = 'c0000000-0000-0000-0000-000000000004';
  const prop5Id = 'c0000000-0000-0000-0000-000000000005';
  const prop6Id = 'c0000000-0000-0000-0000-000000000006';

  await db.insert(properties).values([
    {
      id: prop1Id,
      title: 'Moderan dvoiposoban stan kod Hrama',
      type: 'stan',
      purpose: 'prodaja',
      priceEur: '175000',
      areaM2: 68,
      rooms: '2.5',
      address: 'Kneginje Zorke 18',
      city: 'Beograd',
      lat: '44.8000500',
      lng: '20.4682000',
      status: 'slobodno',
      description: 'Prelep renoviran stan u srcu Vračara, centralno grejanje, lift, parking u dvorištu zgrade.',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      agentId: agent1Id,
    },
    {
      id: prop2Id,
      title: 'Luksuzna vila sa bazenom na Dedinju',
      type: 'kuca',
      purpose: 'prodaja',
      priceEur: '890000',
      areaM2: 340,
      rooms: '6.0',
      address: 'Mihaila Mike Jankovića 7',
      city: 'Beograd',
      lat: '44.7794000',
      lng: '20.4578000',
      status: 'slobodno',
      description: 'Ekskluzivna kuća na parceli od 12 ari, bazen, teretana, garaža za 3 automobila, pametna kuća.',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      agentId: agent1Id,
    },
    {
      id: prop3Id,
      title: 'Poslovni prostor u Airport City-ju',
      type: 'lokal',
      purpose: 'izdavanje',
      priceEur: '2400',
      areaM2: 120,
      rooms: '4.0',
      address: 'Omladinskih brigada 88',
      city: 'Beograd',
      lat: '44.8142000',
      lng: '20.4005000',
      status: 'slobodno',
      description: 'Moderan open-space kancelarijski prostor, recepcija, 24/7 obezbeđenje, optički internet, garažno mesto.',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      agentId: agent2Id,
    },
    {
      id: prop4Id,
      title: 'Jednosoban stan za investiciju na Limanu',
      type: 'stan',
      purpose: 'prodaja',
      priceEur: '88000',
      areaM2: 38,
      rooms: '1.0',
      address: 'Bulevar cara Lazara 42',
      city: 'Novi Sad',
      lat: '45.2415000',
      lng: '19.8433000',
      status: 'slobodno',
      description: 'Funkcionalan stan na odličnoj lokaciji u blizini Univerziteta i Štranda. Idealan za rentiranje.',
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      agentId: agent2Id,
    },
    {
      id: prop5Id,
      title: 'Građevinski plac sa pogledom na Dunav',
      type: 'plac',
      purpose: 'prodaja',
      priceEur: '65000',
      areaM2: 1400,
      rooms: '0.0',
      address: 'Fruškogorski put bb',
      city: 'Sremska Kamenica',
      lat: '45.2166000',
      lng: '19.8350000',
      status: 'rezervisano',
      description: 'Građevinsko zemljište u zoni porodične gradnje, struja, voda i asfaltirani prilaz do placa.',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      agentId: adminId,
    },
    {
      id: prop6Id,
      title: 'Trosoban stan u kuli Belgrade Waterfront',
      type: 'stan',
      purpose: 'prodaja',
      priceEur: '315000',
      areaM2: 85,
      rooms: '3.0',
      address: 'Hercegovačka 14',
      city: 'Beograd',
      lat: '44.8091000',
      lng: '20.4502000',
      status: 'slobodno',
      description: 'Vrhunski stan sa panoramskim pogledom na reku Savu, terasom, recepcijom i podzemnom garažom.',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      agentId: agent1Id,
    },
  ]);

  // 4. Prodajne prilike (Leads)
  const lead1Id = 'd0000000-0000-0000-0000-000000000001';
  const lead2Id = 'd0000000-0000-0000-0000-000000000002';
  const lead3Id = 'd0000000-0000-0000-0000-000000000003';
  const lead4Id = 'd0000000-0000-0000-0000-000000000004';

  await db.insert(leads).values([
    {
      id: lead1Id,
      clientId: client1Id,
      propertyId: prop1Id,
      stage: 'razgledanje',
      valueEur: '175000',
      note: 'Zakazano razgledanje za petak. Klijent je odobren za stambeni kredit kod Intese.',
      agentId: agent1Id,
    },
    {
      id: lead2Id,
      clientId: client3Id,
      propertyId: prop3Id,
      stage: 'ponuda',
      valueEur: '2400',
      note: 'Klijent poslao ponudu na 2.200 EUR mesečno uz ugovor na minimum 2 godine.',
      agentId: agent2Id,
    },
    {
      id: lead3Id,
      clientId: client4Id,
      propertyId: prop4Id,
      stage: 'kontaktiran',
      valueEur: '88000',
      note: 'Prosleđene fotografije i tlocrt stana. Čeka se odgovor klijenta.',
      agentId: agent2Id,
    },
    {
      id: lead4Id,
      clientId: client6Id,
      propertyId: prop6Id,
      stage: 'ponuda',
      valueEur: '310000',
      note: 'Dato kaparisano obećanje, čeka se overa kod javnog beležnika.',
      agentId: agent1Id,
    },
  ]);

  // 5. Razgledanja
  await db.insert(viewings).values([
    {
      propertyId: prop1Id,
      clientId: client1Id,
      agentId: agent1Id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Za 2 dana
      status: 'zakazano',
      note: 'Naći se ispred zgrade, poneti ključeve i vlasnički list.',
    },
    {
      propertyId: prop3Id,
      clientId: client3Id,
      agentId: agent2Id,
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Pre 3 dana
      status: 'odrzano',
      note: 'Klijenti zadovoljni prostorom, traže dodatno garažno mesto.',
    },
  ]);

  // 6. Aktivnosti
  await db.insert(activities).values([
    {
      clientId: client1Id,
      leadId: lead1Id,
      type: 'poziv',
      text: 'Telefonski razgovor oko uslova kupovine i zakazivanja termina za obilazak.',
      userId: agent1Id,
    },
    {
      clientId: client3Id,
      leadId: lead2Id,
      type: 'sastanak',
      text: 'Održan sastanak u prostorijama agencije sa direktorom IT firme.',
      userId: agent2Id,
    },
    {
      clientId: client4Id,
      leadId: lead3Id,
      type: 'mejl',
      text: 'Poslat zvanični katalog nekretnina i specifikacija stana na Limanu.',
      userId: agent2Id,
    },
  ]);

  console.log('Database seeded successfully!');
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
