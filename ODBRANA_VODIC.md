# Vodič i Pitanja za Usmenu Odbranu Projekta
## Predmet: Internet Tehnologije (Fakultet organizacionih nauka, Univerzitet u Beogradu)
**Student:** Vuk Laketić  
**Broj indeksa:** 2023/0013  
**Naziv projekta:** CRM aplikacija na primeru preduzeća za prodaju nekretnina  
**Repozitorijum:** `internet-tehnologije-projekat-crm-nekretnine_2023_0013`

---

## 1. Arhitektura Aplikacije i Next.js (App Router)

### Šta je Next.js i zašto se koristi App Router umesto starog Pages Routera?
Next.js je React radni okvir (framework) za izradu modernih veb aplikacija sa hibridnim renderovanjem (Server-Side Rendering - SSR, Static Site Generation - SSG i Client-Side Rendering - CSR). App Router uvodi:
- **React Server Components (RSC):** Komponente se po defaultu izvršavaju na serveru, smanjujući veličinu JavaScript paketa koji se šalje klijentu i omogućavajući direktan pristup bazi podataka.
- **Ugnježdeni rasporedi (`layout.tsx`):** Zajednički elementi korisničkog interfejsa (poput bočne navigacije `Sidebar`) ostaju montirani i ne renderuju se ponovo pri navigaciji.
- **Konvencija fajlova:** `page.tsx` za stranice, `layout.tsx` za rasporede, `loading.tsx` za streaming skeletona, `error.tsx` za boundary grešaka i `route.ts` za REST API rute.

### Koja je razlika između Server i Client komponenti (`'use client'`)?
- **Server komponente (podrazumevano):** Renderuju se isključivo na Node.js serveru. Mogu direktno pristupati bazi podataka (`db.select()`), čitati environment varijable i tajne ključeve bez izlaganja browseru. Ne mogu koristiti React hookove (`useState`, `useEffect`) niti handlere događaja (`onClick`, `onChange`).
- **Client komponente (označene sa `'use client'` na samom vrhu fajla):** Hidriraju se i izvršavaju u klijentskom browseru. Koriste se kada je potrebna interaktivnost korisnika (forme, modalni dijalozi, grafikoni sa animacijama, rad sa pretraživačkim API-jima poput Leaflet mapa ili geolokacije).

### Kako funkcioniše dinamičko rutiranje u Next.js?
Direktorijum sa uglastim zagradama `src/app/nekretnine/[id]/page.tsx` definiše dinamički segment rute. Next.js automatski prosleđuje vrednost iz URL-a kroz `params` objekat (asinhroni prop u Next.js 16: `const { id } = await params;`).

### Šta radi Middleware (`src/middleware.ts`)?
Middleware presreće svaki HTTP zahtev pre nego što stigne do odgovarajuće rute. U našem projektu:
1. Proverava da li se pristupa zaštićenoj ruti (sve osim `/login`, `/register`, `/api/auth/*`, statičkih fajlova).
2. Čita `auth` kolačić (HTTP-Only JWT).
3. Ako kolačić ne postoji, preusmerava korisnika na `/login`.
4. Ako ulogovan korisnik pokuša da ode na `/login`, automatski ga preusmerava na kontrolnu tablu `/`.

---

## 2. React Hook-ovi i Upravljanje Stanjem

### Koje hook-ove koristite u projektu i čemu služe?
1. **`useState`:** Upravlja lokalnim stanjem unutar komponente (npr. trenutna stranica paginacije, tekst za pretragu, podaci unutar forme, stanje otvaranja modala).
2. **`useEffect`:** Izvršava sporedne efekte (side-effects) nakon renderovanja komponente (npr. osluškivanje promena filtera i ponovno okidanje dohvatanja podataka).
3. **`useCallback`:** Memorizuje referencu na funkciju kako se ne bi kreirala nova instanca pri svakom ponovnom renderovanju, što sprečava beskonačne petlje u `useEffect` dependency nizu.
4. **`useRouter` & `usePathname`:** Next.js hookovi za programatsku navigaciju (`router.push('/login')`) i određivanje aktivnog linka u navigaciji (`pathname === '/nekretnine'`).

### Kako su implementirani i zašto se koriste Custom Hook-ovi?
U direktorijumu `src/hooks/` kreirani su sopstveni višekratno iskoristivi hook-ovi:
- **`useProperties` (`src/hooks/useProperties.ts`):** Enkapsulira asinhrono dohvatanje liste nekretnina sa servera, rukuje parametrima paginacije (`page`, `pageSize`) i filterima (`q`, `type`, `status`), upravlja stanjima `loading` i `error`, i izlaže funkciju `refetch()` za osvežavanje nakon dodavanja ili brisanja nekretnine.
- **`useCurrency` (`src/hooks/useCurrency.ts`):** Obezbeđuje live kurs EUR/RSD sa internog keširanog servisa, omogućava automatsku konverziju iznosa (`eurToRsd` i `rsdToEur`) i napaja vidžet kursa u bočnoj traci (`Sidebar`).

---

## 3. Baza Podataka, Drizzle ORM i PostgreSQL

### Zašto je izabran Drizzle ORM umesto Prisma ORM-a?
1. **TypeScript-First & Tip Bezbednost bez koda za generisanje:** Drizzle koristi čisti TypeScript za definisanje šeme (`pgTable`), bez potrebe za eksternim binarnim engine-om (Prisma Query Engine) koji uvećava Docker imidž i usporava serverless funkcije.
2. **SQL-like Sintaksa:** Drizzle je tanak sloj iznad SQL-a (`db.select().from(table).where(...)`), što obezbeđuje maksimalne performanse, predvidivost generisanog SQL upita i lakšu kontrolu indeksa i spajanja tabela (JOIN).

### Opišite šemu baze podataka i relacije:
Šema je definisana u `src/db/schema.ts` i obuhvata:
- **`users`:** Agent i admin nalozi (`id` UUID primarni ključ, `email` jedinstven, `passHash` hešovana lozinka, `role` 'admin' ili 'agent').
- **`properties`:** Podaci o nekretninama (`priceEur`, `areaM2`, `rooms`, `address`, `city`, `lat`, `lng`, `status`, `agentId` spoljni ključ ka `users.id`).
- **`clients`:** Kupci, prodavci i zakupci (`ownerId` spoljni ključ ka `users.id`).
- **`leads`:** Prodajne prilike povezane sa klijentom i opciono nekretninom (`clientId`, `propertyId`, `agentId`, `stage` po Kanban fazama, `valueEur`).
- **`viewings`:** Zakazana razgledanja sa vremenom (`scheduledAt`), statusom ('zakazano', 'obavljeno', 'otkazano') i vezama ka klijentu, nekretnini i agentu.

---

## 4. Autentifikacija, Autorizacija i Sigurnost

### Kako funkcioniše JWT autentifikacija u aplikaciji?
- Prilikom prijave (`POST /api/auth/login`), server proverava lozinku korišćenjem `bcrypt.compare`.
- Ako su kredencijali ispravni, generiše se JSON Web Token (JWT) potpisan tajnim ključem (`JWT_SECRET`) algoritmom HS256 sa rokom važenja od 7 dana.
- Token se upisuje u **HTTP-Only kolačić** (`auth`).

### Koje su tri korisničke uloge u sistemu i kako se razlikuju njihove funkcionalnosti?
U skladu sa ispitnim zahtevom za minimum 3 uloge, u sistemu postoje:
1. **`admin` (Administrator sistema):** Puni uvid u sve aspekte poslovanja – upravljanje svim nekretninama, svim klijentima, prodajnim prilikama svih agenata, analitičkim izveštajima i nalozima.
2. **`agent` (Agent prodaje):** Pristup internoj CRM evidenciji – upravljanje dodeljenim klijentima, praćenje sopstvenih prodajnih prilika kroz Kanban levak, dodavanje i ažuriranje nekretnina, zakazivanje razgledanja.
3. **`kupac` (Registrovani korisnik / Kupac):** Korisnički portal – pregled kataloga sa pretragom, filtriranjem i sortiranjem, uvid u interaktivnu mapu, mogućnost zakazivanja razgledanja za željenu nekretninu, i pregled isključivo sopstvenih zakazanih termina ("Moja razgledanja"). Kupac nema pristup internim CRM podacima agencije niti može brisati nekretnine.

### Kako je implementiran oporavak zaboravljene lozinke?
Kreirana je javna ruta `/zaboravljena-lozinka` i prateći endpoint `POST /api/auth/reset-password`:
- Korisnik unosi registrovanu email adresu, novu lozinku i potvrdu lozinke.
- Validacija proverava format i poklapanje lozinki (minimalno 6 karaktera).
- Nova lozinka se hešuje algoritmom `bcrypt` (10 rundi) i trajno ažurira u bazi podataka.

### Zašto čuvamo JWT u HTTP-Only Cookie-ju umesto u `localStorage`?
- Podaci u `localStorage` su dostupni klijentskom JavaScript kodu, što znači da u slučaju XSS (Cross-Site Scripting) ranjivosti napadač može jednostavno ukrasti token (`localStorage.getItem('token')`).
- `httpOnly: true` sprečava JavaScript pristup kolačiću u browseru.
- `sameSite: 'lax'` sprečava CSRF (Cross-Site Request Forgery) napade prilikom navigacije sa eksternih sajtova.

### Koja je razlika između HTTP 401 i HTTP 403 status koda?
- **401 Unauthorized:** Korisnik **nije autentifikovan** (nema validan JWT token ili token je istekao).
- **403 Forbidden:** Korisnik je **autentifikovan**, ali **nema dovoljne privilegije** (autorizaciju) za izvršenje akcije (npr. kupac pokušava da pristupi administratorskim funkcijama ili agent pokušava da obriše tuđeg klijenta).

---

## 5. Eksterni API Servisi i Obrada Podataka

### Koji eksterni API-ji se koriste u projektu (zahtev za ocenu 10)?
1. **Open Exchange Rates API (`https://open.er-api.com/v6/latest/EUR`):**
   - Dohvata ažurne kurseve valuta (`EUR`, `RSD`, `USD`, `CHF`, `GBP`).
   - Implementirano je serversko keširanje (Next.js `revalidate: 3600` i u memoriji) radi zaštite od rate-limita.
   - **Zahtev za ocenu 10:** U aplikaciji nije implementiran samo prosti kalkulator unosa, već **globalni Combo Box birač valuta** (`CurrencySelector`). Izborom bilo koje valute (npr. RSD, USD, CHF, GBP) **cene svih nekretnina u katalogu, na karticama, detaljnom prikazu i kontrolnoj tabli automatski se u realnom vremenu rekalkulišu i formatiraju**.
2. **OpenStreetMap Nominatim Geocoding API + Leaflet:**
   - Prilikom kreiranja i prikaza nekretnine, adresa i grad se geokodiraju u geografsku širinu i dužinu (`lat`, `lng`).
   - Na detaljnoj stranici nekretnine renderuje se interaktivna mapa sa prilagođenim pinom i kontrolama zumiranja bez zavisnosti od komercijalnih Google Maps ključeva.

### Kako je realizovano sortiranje i pretraga?
- Na stranici `/nekretnine` omogućen je kombinovani upit: tekstualna pretraga (`q`), filtriranje po tipu i statusu, i **sortiranje po 5 kriterijuma** (Najnovije, Cena rastuće, Cena opadajuće, Kvadratura manja, Kvadratura veća).
- API ruta `/api/properties` dinamički gradi SQL upit sa `ORDER BY` klauzulom i odgovarajućim indeksima.

### Navedite 5 različitih tipova migracija u bazi podataka:
U `src/db/migrations` implementirano je 5 distinktivnih operacija migracije:
1. `CREATE TABLE`: Kreiranje osnovnih tabela (`users`, `properties`, `clients`, `leads`, `viewings`).
2. `ADD CONSTRAINT ... FOREIGN KEY`: Definisanje referencijalnog integriteta između tabela sa `ON DELETE CASCADE / SET NULL`.
3. `ADD CONSTRAINT ... UNIQUE`: Definisanje jedinstvenih ograničenja (`users_email_unique`).
4. `ALTER COLUMN SET DEFAULT`: Izmena defaultne vrednosti kolone u postojećoj tabeli (`users.role` promenjen na `kupac`).
5. `CREATE INDEX`: Kreiranje B-tree indeksa za optimizaciju upita nad kolonama `city`, `type` i `status` na tabeli `properties`.

### Kako je rešen izvoz podataka (CSV Export)?
Na stranicama `/nekretnine` i `/klijenti` omogućeno je klijentsko generisanje CSV fajla:
- Podaci se formatiraju u standardni CSV format (sa pravilnim escaping-om navodnika i zarezima).
- Kreira se `Blob` objekat sa MIME tipom `text/csv;charset=utf-8;`.
- Generiše se privremeni `<a>` tag sa `URL.createObjectURL(blob)` i automatskim klikom preuzima fajl sa vremenskim žigom u imenu.

---

## 6. Git Flow, CI/CD i Docker

### Koja je razlika između `git add` i `git commit`?
- `git add <file>` dodaje promene u radnom direktorijumu u pripremnu zonu (tzv. *Staging Area* ili *Index*).
- `git commit -m "<poruka>"` uzima pripremljene promene iz staging zone i trajno kreira novi commit objekat u lokalnoj Git istoriji sa autorom, vremenom i roditeljskim commit hash-om.

### Objasnite grananje u projektu (Git Flow):
- **`main`:** Glavna produkciona grana. Sadrži isključivo stabilne verzije označene tagovima (`v0.1-mvp`, `v1.0-final`).
- **`develop`:** Glavna razvojna grana u koju se spajaju sve funkcionalnosti.
- **`feature/*`:** Namenske grane za pojedinačne funkcionalnosti (npr. `feature/auth`, `feature/properties`, `feature/leads-kanban`, `feature/custom-hooks`). Svaka grana je spojena sa `develop` korišćenjem `--no-ff` (no-fast-forward) zastavice kako bi se očuvala eksplicitna istorija i graf spajanja.

### Koja je razlika između Docker Imidža (Image) i Kontejnera (Container)?
- **Docker Image:** Nepromenljiv (read-only) šablon sa uputstvima za kreiranje kontejnera (operativni sistem, Node.js runtime, zavisnosti, kod).
- **Docker Container:** Živa, izolovana instanca pokrenutog imidža sa sopstvenim procesima, mrežnim interfejsom i read-write slojem.

### Čemu služi GitHub Actions Workflow (`.github/workflows/ci.yml`)?
Pruža automatizovanu kontinuiranu integraciju (CI). Pri svakom `push` ili `pull_request` događaju na `main` i `develop` granama, na čistoj Ubuntu virtuelnoj mašini automatski se:
1. Klonira repozitorijum.
2. Instalira Node.js i zavisnosti (`npm ci`).
3. Pokreće statička analiza koda (`npm run lint`).
4. Izvršavaju automatizovani jedinični testovi (`npm run test`).
5. Gradi produkcioni paket (`npm run build`) kako bi se garantovalo da nema sintaksnih ili TypeScript grešaka.
