# CRM Aplikacija za preduzeće za prodaju nekretnina
**Univerzitet u Beogradu – Fakultet organizacionih nauka (FON)**  
**Predmet:** Internet tehnologije (ITEH)  
**Školska godina:** 2026/2027  
**Student:** Vuk Laketić (2023/0013)  

---

## 📌 Opis projekta

CRM veb aplikacija za preduzeće za promet nekretnina omogućava efikasno praćenje nekretnina, upravljanje bazom kupaca, prodavaca i zakupaca, vođenje prodajnih prilika (Leads) kroz faze pregovora putem Kanban table, kao i zakazivanje i evidenciju razgledanja nekretnina na terenu.

Aplikacija je realizovana u skladu sa propisanim standardima Katedre za elektronsko poslovanje (ELAB).

---

## ⚙️ Tehnološki stek

- **Fullstack radni okvir:** [Next.js](https://nextjs.org/) (App Router, React Server & Client komponente, Route Handlers)
- **Jezik:** [TypeScript](https://www.typescriptlang.org/) (stroga tipizacija modela i interfejsa)
- **Frontend & Dizajn:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [@remixicon/react](https://remixicon.com/) ikonice
- **Baza podataka:** [PostgreSQL 17](https://www.postgresql.org/) u Docker kontejneru
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (`drizzle-kit` za migracije i generisanje šeme, `pg` drajver, `tsx` za seed)
- **Autentifikacija & Autorizacija:** JWT (`jsonwebtoken`, HS256 algoritam) u bezbednom `httpOnly` istopolnom kolačiću (`auth`), hešovanje lozinki pomoću `bcrypt` (10 rundi)
- **Validacija podataka:** [Zod](https://zod.dev/) za validaciju ulaznih podataka u API rutama
- **Eksterni API:** Zvanični srednji kurs valuta preko `open.er-api.com` sa keširanjem odgovora
- **Kontejnerizacija & DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)

---

## 🔐 Demo nalozi za testiranje

Za potrebe demonstracije i odbrane rada, baza je unapred inicijalizovana sa sledećim nalozima:

| Uloga | Email | Lozinka | Opis ovlašćenja |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@crm.rs` | `Test1234!` | Potpuni uvid i upravljanje svim nekretninama, klijentima i lead-ovima. |
| **Agent prodaje 1** | `agent1@crm.rs` | `Test1234!` | Pristup sopstvenim nekretninama i dodeljenim klijentima/lead-ovima. |
| **Agent prodaje 2** | `agent2@crm.rs` | `Test1234!` | Pristup sopstvenim nekretninama i dodeljenim klijentima/lead-ovima. |

---

## 🚀 Uputstvo za lokalno pokretanje

### 1. Kloniranje repozitorijuma
```bash
git clone https://github.com/vuklaketic/internet-tehnologije-projekat-crm-nekretnine_2023_0013.git
cd internet-tehnologije-projekat-crm-nekretnine_2023_0013
```

### 2. Podešavanje varijabli okruženja
Kopirajte šablon `.env.example` u `.env`:
```bash
cp .env.example .env
```

### 3. Pokretanje baze podataka putem Docker-a
Pokrenite PostgreSQL bazu u pozadini:
```bash
docker compose up -d db
```

### 4. Instalacija zavisnosti
```bash
npm install
```

### 5. Primena migracija i popunjavanje baze inicijalnim podacima (Seed)
```bash
npm run db:migrate
npm run db:seed
```

### 6. Pokretanje razvojnog servera
```bash
npm run dev
```

Aplikacija će biti dostupna na adresi: [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktura projekta

```text
├── src/
│   ├── app/                    # Next.js App Router stranice i rute
│   │   ├── api/                # REST API Route Handlers
│   │   │   ├── auth/           # Login, Register, Logout, Me
│   │   │   ├── properties/     # CRUD rute za nekretnine
│   │   │   ├── clients/        # CRUD rute za klijente
│   │   │   ├── leads/          # CRUD rute za prodajne prilike
│   │   │   ├── viewings/       # Zakazivanje razgledanja
│   │   │   └── currency/       # Eksterni kursni API servis
│   │   ├── nekretnine/         # Katalog i menadžment nekretnina
│   │   ├── klijenti/           # Evidencija klijenata
│   │   ├── leadovi/            # Kanban levak prodajnih prilika
│   │   ├── razgledanja/        # Raspored termina razgledanja
│   │   ├── login/              # Stranica prijave
│   │   ├── register/           # Stranica registracije
│   │   ├── layout.tsx          # Glavni layout sa sidebarom i ulogama
│   │   └── page.tsx            # Kontrolna tabla (Dashboard) sa metrikama
│   ├── components/             # Reusable UI komponente (Button, Input, Modal, ...)
│   ├── db/                     # Drizzle ORM konfiguracija, šema i seed
│   │   ├── index.ts            # Konekcija ka bazi (Pool + Drizzle)
│   │   ├── schema.ts           # Definicija tabela i relacija
│   │   └── seed.ts             # Idempotentno popunjavanje podacima
│   ├── lib/
│   │   └── auth.ts             # JWT helperi i verifikacija korisnika
│   └── middleware.ts           # Zaštita privatnih ruta na nivou aplikacije
├── .github/workflows/ci.yml    # CI/CD automatizacija (lint & build)
├── docker-compose.yml          # Konfiguracija za Docker kontejnerizaciju
├── Dockerfile                  # Multi-stage produkcioni build
├── drizzle.config.ts           # Drizzle Kit konfiguracija
└── package.json
```

---

## 🛡️ Primenjene mere bezbednosti

1. **Zaštita od SQL Injection-a:** Korišćenje Drizzle ORM-a sa parametrizovanim upitima u celosti eliminiše rizik od SQL injekcija.
2. **Zaštita lozinki:** Sve lozinke se pre skladištenja u bazi hešuju industrijskim standardom `bcrypt` uz 10 bezbednosnih rundi.
3. **Zaštita sesije (XSS & CSRF preventiva):** Autentifikacioni JWT tokeni se čuvaju u `httpOnly` i `sameSite: lax` kolačićima, čime se sprečava njihovo presretanje preko malicioznih JavaScript skripti na klijentu.
4. **Validacija ulaza:** Svi podaci koji pristižu na API rute se striktno validiraju pomoću `zod` biblioteke.
5. **Autorizacija na bazi uloga (RBAC):** Stroga provera uloga na API nivou osigurava da agenti mogu menjati samo svoje klijente i lead-ove, dok administrator ima globalni pristup.
