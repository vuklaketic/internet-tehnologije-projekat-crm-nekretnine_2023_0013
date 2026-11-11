import { pgTable, uuid, varchar, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Korisnici sistema
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passHash: varchar('pass_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('kupac'), // 'admin' | 'agent' | 'kupac'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Nekretnine
export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'stan' | 'kuca' | 'lokal' | 'plac'
  purpose: varchar('purpose', { length: 50 }).notNull(), // 'prodaja' | 'izdavanje'
  priceEur: numeric('price_eur', { precision: 12, scale: 2 }).notNull(),
  areaM2: integer('area_m2').notNull(),
  rooms: numeric('rooms', { precision: 3, scale: 1 }).notNull().default('1'),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  lng: numeric('lng', { precision: 10, scale: 7 }),
  status: varchar('status', { length: 50 }).notNull().default('slobodno'), // 'slobodno' | 'rezervisano' | 'prodato'
  description: text('description'),
  imageUrl: text('image_url'),
  agentId: uuid('agent_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Klijenti
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 150 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'kupac' | 'prodavac' | 'zakupac'
  budgetEur: numeric('budget_eur', { precision: 12, scale: 2 }),
  notes: text('notes'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Prodajne prilike (Leads)
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'set null' }),
  stage: varchar('stage', { length: 50 }).notNull().default('novi'), // 'novi' | 'kontaktiran' | 'razgledanje' | 'ponuda' | 'zakljuceno' | 'izgubljeno'
  valueEur: numeric('value_eur', { precision: 12, scale: 2 }),
  note: text('note'),
  agentId: uuid('agent_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zakazana razgledanja (Viewings)
export const viewings = pgTable('viewings', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  agentId: uuid('agent_id').references(() => users.id, { onDelete: 'set null' }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('zakazano'), // 'zakazano' | 'odrzano' | 'otkazano'
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Istorija aktivnosti (Activities)
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'poziv' | 'mejl' | 'sastanak' | 'beleska'
  text: text('text').notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relacije
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  clients: many(clients),
  leads: many(leads),
  viewings: many(viewings),
  activities: many(activities),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(users, {
    fields: [properties.agentId],
    references: [users.id],
  }),
  leads: many(leads),
  viewings: many(viewings),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  owner: one(users, {
    fields: [clients.ownerId],
    references: [users.id],
  }),
  leads: many(leads),
  viewings: many(viewings),
  activities: many(activities),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  client: one(clients, {
    fields: [leads.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [leads.propertyId],
    references: [properties.id],
  }),
  agent: one(users, {
    fields: [leads.agentId],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const viewingsRelations = relations(viewings, ({ one }) => ({
  property: one(properties, {
    fields: [viewings.propertyId],
    references: [properties.id],
  }),
  client: one(clients, {
    fields: [viewings.clientId],
    references: [clients.id],
  }),
  agent: one(users, {
    fields: [viewings.agentId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  client: one(clients, {
    fields: [activities.clientId],
    references: [clients.id],
  }),
  lead: one(leads, {
    fields: [activities.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));
