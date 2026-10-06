# HÜ vom 06.10.2026 — Normalisierung 1NF–3NF (mit Prisma 7 & SQLite)

**Klasse:** 3AHWII (X-Gruppe) · **Fach:** INFI (KM5, WS 2026/27)  
**Stellung im Semester:** `GRG-INFI/3ahwii/README.md` (Eintrag 2026-10-06 Normalformen) & `unterricht/KM5-02-normalisierung/hausaufgabe.md`  
**Besondere Anweisung:** *„mit prisma!!"* (vollständige Modellierung & Verifikation über Prisma 7 ORM)

---

## 📁 Projektstruktur

```
Hausuebungen/2026-10-06_normalisierung/
├── README.md                 # Vollständige Ausarbeitung & theoretische Begründung
├── schema.sql                # Normalisierte Tabellen in 3NF (reines SQLite DDL)
├── seed.sql                  # Beispieldaten (mindestens 3 Zeilen pro Tabelle)
├── queries.sql               # Rekonstruktions-Queries (JOIN) & Konsistenznachweis
├── deno.json                 # Deno Task-Runner (kein npm für Deno-Teil)
├── demo.ts                   # Konsolen-Demo der 1NF-, 2NF- und 3NF-Anomalien
├── demo_test.ts              # 4 Deno-Tests für die Anomalien und Fixes
├── KM5-02-normalisierung/    # Kopie der Unterrichtsunterlagen (Lesson, Hausaufgabe)
└── praxis/                   # Vollständiges Prisma 7 Projekt ("mit prisma!!")
    ├── package.json          # Node.js ESM-Setup mit Prisma 7 Scripts
    ├── prisma7.config.ts     # Prisma 7 Konfiguration mit Driver-Adapter-URL
    ├── .env                  # DATABASE_URL="file:./dev.db"
    ├── .gitignore            # Ignoriert dev.db und node_modules
    ├── prisma/
    │   ├── schema.prisma     # 3NF-Datenmodelle (Bestellung, Track, Plz, Bank, Klasse)
    │   └── migrations/       # Versionierte SQL-Migrationen
    ├── src/
    │   ├── prisma.js         # Initialisierung des PrismaClient mit better-sqlite3
    │   ├── seed.js           # Idempotentes Seeden aller 3NF-Modelle
    │   └── queries.js        # Relationale Abfragen (include) & Konsistenzprüfung
    └── test/
        └── normalisierung.test.js # 7 automatische Unit-Tests (node:test)
```

---

## 1. Vorhersage (vor dem Zerlegen)

### Ausgangssituation: `bestellung_denorm`

Betrachtet wird die Tabelle `bestellung_denorm(bestell_nr, kunde, plz, ort)` bzw. die um Bestellpositionen erweiterte Lesson-Variante `bestellung_denorm(bestell_nr, kunde, tracks, plz, ort)`.

| Attribut / Spalte | Verletzte Normalform | Begründung & Ursache |
| :--- | :--- | :--- |
| **`tracks`** *(falls Liste)* | **1NF** (Atomarität) | Enthält eine kommagetrennte Liste (z. B. `'1, 2, 3'`) oder Wiederholgruppen (`track1, track2`). Dadurch ist der Inhalt **nicht atomar (unteilbar)**. Eine gezielte Suche nach einem Track (`WHERE tracks = 2`) schlägt fehl; Integritätsprüfungen sind unmöglich. |
| **`bestell_nr`** (PK) | *keine* | Primärschlüssel der Entität Bestellung. |
| **`kunde`** | *keine* | Hängt voll funktional direkt vom Primärschlüssel `bestell_nr` ab (`bestell_nr → kunde`). |
| **`plz`** | *keine* | Beschreibt die Lieferadresse der Bestellung (`bestell_nr → plz`). |
| **`ort`** | **3NF** (Transitivität) | **Verletzt die 3. Normalform.** Es gilt die funktionale Abhängigkeitskette: <br>`bestell_nr → plz` und `plz → ort`. <br>`ort` hängt funktionell von der Postleitzahl ab (`plz → ort`) und nicht direkt von `bestell_nr`. Da `plz` ein Nichtschlüsselattribut ist, handelt es sich um eine **transitive Abhängigkeit über einen Nichtschlüssel**. |

### Warum ist die 2NF bei `bestellung_denorm` kein Thema?

> **Merksatz:** Die 2. Normalform ist **nur bei einem zusammengesetzten Primärschlüssel** relevant.  
> Hat eine Tabelle einen einfachen Schlüssel aus nur einer Spalte (wie `bestell_nr`), existieren keine echten Teilmengen des Schlüssels. Eine partielle Abhängigkeit von einem „Schlüsselteil" ist logisch unmöglich — **die 2NF ist somit automatisch erfüllt**.  
> Erst wenn wir im Zuge der 1NF-Auflösung eine Kindtabelle mit zusammengesetztem Schlüssel wie `bestellposition(bestell_nr, track_id, track_titel)` anlegen, wird die 2NF schlagend, weil `track_titel` nur von `track_id` abhängt.

### Die drei klassischen Schema-Anomalien von `bestellung_denorm`:

1. **Änderungs-Anomalie (Update Anomaly):**  
   Bekommt die PLZ `1020` einen neuen Namen (z. B. `Wien-Leopoldstadt`), müssen *alle* Zeilen mit dieser PLZ geändert werden. Vergisst man eine Zeile, entstehen widersprüchliche Datenzustände.
2. **Einfüge-Anomalie (Insert Anomaly):**  
   Eine neu vergebene Postleitzahl (z. B. `8010` für `Graz`) kann nicht im System hinterlegt werden, solange kein Kunde eine Bestellung mit dieser PLZ getätigt hat (oder man müsste verbotene Dummy-Bestellungen mit NULL-Werten anlegen).
3. **Lösch-Anomalie (Delete Anomaly):**  
   Löscht man die einzige Bestellung für Linz (`4020`), wird gleichzeitig das Wissen vernichtet, dass `4020` die Stadt `Linz` ist.

---

## 2. Zerlegen bis 3NF (Schrittweise mit Abhängigkeitspfeilen)

### Ausgangsrelation (0NF / Denormalisiert)
$$\text{bestellung\_denorm}(\underline{\text{bestell\_nr}}, \text{kunde}, \text{tracks}, \text{plz}, \text{ort})$$

---

### Schritt 1: Überführung in die 1. Normalform (1NF)
* **Regel:** Jedes Attribut muss atomare (unteilbare) Werte enthalten; keine Listen in Zellen, keine Wiederholgruppen als Spalten.
* **Aktion:** Das zusammengesetzte Listenattribut `tracks` wird in eine eigenständige Positionstabelle mit Positionsnummer bzw. Track-ID aufgelöst.
* **Relationen:**
  $$\text{bestellung\_1nf}(\underline{\text{bestell\_nr}}, \text{kunde}, \text{plz}, \text{ort})$$
  $$\text{bestellposition\_1nf}(\underline{\text{bestell\_nr}, \text{track\_id}}, \text{track\_titel}, \text{dauer\_sek}, \text{menge})$$
* **Abhängigkeiten (Pfeile):**
  $$\text{bestell\_nr} \rightarrow \text{kunde}, \text{plz}, \text{ort}$$
  $$(\text{bestell\_nr}, \text{track\_id}) \rightarrow \text{menge}$$
  $$\text{track\_id} \rightarrow \text{track\_titel}, \text{dauer\_sek} \quad \text{\textbf{(Problem für 2NF!)}}$$

---

### Schritt 2: Überführung in die 2. Normalform (2NF)
* **Regel:** Kein Nichtschlüsselattribut darf von einem *Teil* eines zusammengesetzten Primärschlüssels abhängen (jede funktionale Abhängigkeit muss voll sein).
* **Aktion:**
  * In $\text{bestellposition\_1nf}$ ist der Primärschlüssel $(\text{bestell\_nr}, \text{track\_id})$.
  * Die Attribute $\text{track\_titel}$ und $\text{dauer\_sek}$ hängen **nur vom Teilschlüssel** $\text{track\_id}$ ab, unabhängig davon, in welcher Bestellung sie gekauft werden.
  * Wir lagern die Entität $\text{track}$ in eine eigene Tabelle aus.
* **Relationen:**
  $$\text{track}(\underline{\text{track\_id}}, \text{titel}, \text{dauer\_sek})$$
  $$\text{bestellposition}(\underline{\text{bestell\_nr}, \text{track\_id}}, \text{menge})$$
* **Abhängigkeiten (Pfeile):**
  $$\text{track\_id} \rightarrow \text{titel}, \text{dauer\_sek} \quad \text{(voll abhängig vom eigenen PK)}$$
  $$(\text{bestell\_nr}, \text{track\_id}) \rightarrow \text{menge} \quad \text{(voll abhängig vom zusammengesetzten PK)}$$

---

### Schritt 3: Überführung in die 3. Normalform (3NF)
* **Regel:** Kein Nichtschlüsselattribut darf *transitiv* (über einen Nichtschlüssel) vom Primärschlüssel abhängen („hängt vom Schlüssel ab, vom ganzen Schlüssel und von nichts als dem Schlüssel").
* **Aktion:**
  * In $\text{bestellung\_1nf}$ gilt: $\text{bestell\_nr} \rightarrow \text{plz}$ und $\text{plz} \rightarrow \text{ort}$.
  * $\text{ort}$ ist transitiv abhängig: $\text{bestell\_nr} \rightarrow \text{plz} \rightarrow \text{ort}$.
  * Wir lagern die Zuordnung $\text{plz} \rightarrow \text{ort}$ in eine eigene Faktentabelle aus und verweisen per Fremdschlüssel.
* **Relationen:**
  $$\text{plz}(\underline{\text{plz}}, \text{ort})$$
  $$\text{bestellung}(\underline{\text{bestell\_nr}}, \text{kunde}, \text{plz})$$
* **Abhängigkeiten (Pfeile):**
  $$\text{plz} \rightarrow \text{ort} \quad \text{(isoliert in eigener Tabelle)}$$
  $$\text{bestell\_nr} \rightarrow \text{kunde}, \text{plz} \quad \text{(direkt am Schlüssel)}$$

### Endergebnis des normalisierten Schemas (3NF):
1. **`plz`** $(\underline{\text{plz}}, \text{ort})$
2. **`bestellung`** $(\underline{\text{bestell\_nr}}, \text{kunde}, \text{plz}^\uparrow)$
3. **`track`** $(\underline{\text{track\_id}}, \text{titel}, \text{dauer\_sek})$
4. **`bestellposition`** $(\underline{\text{bestell\_nr}^\uparrow, \text{track\_id}^\uparrow}, \text{menge})$

---

## 3. Zwei eigene Quiz-Tabellen zerlegen

Aus den Quizfragen der Lesson wurden die folgenden beiden klassischen Denormalisierungs-Fälle ausgewählt und in 3NF überführt:

### 1. Quiz-Tabelle 1: `konto_denorm` (Bankverbindung)
* **Ausgangssituation:** `konto_denorm(iban PK, inhaber, blz, bankname)`
* **Transitive Kette:** $\text{iban} \rightarrow \text{blz} \rightarrow \text{bankname}$ (`bankname` hängt an der Bankleitzahl `blz`, nicht am Girokonto).
* **3NF-Zerlegung:**
  1. `bank(blz PK, bankname)`
  2. `konto(iban PK, inhaber, blz FK)`

#### SQL-Definitionen (`CREATE TABLE`):
```sql
CREATE TABLE bank (
  blz      TEXT PRIMARY KEY,
  bankname TEXT NOT NULL
);

CREATE TABLE konto (
  iban    TEXT PRIMARY KEY,
  inhaber TEXT NOT NULL,
  blz     TEXT NOT NULL,
  FOREIGN KEY (blz) REFERENCES bank(blz) ON UPDATE CASCADE ON DELETE RESTRICT
);
```

#### Beispieldatensätze (je 3 Zeilen):
```sql
INSERT INTO bank (blz, bankname) VALUES
  ('12000', 'Bank Austria'),
  ('20111', 'Erste Bank'),
  ('32000', 'Raiffeisenlandesbank');

INSERT INTO konto (iban, inhaber, blz) VALUES
  ('AT611200000012345678', 'Anna Auer',   '12000'),
  ('AT892011100098765432', 'Bernd Beck',  '20111'),
  ('AT422011100055443322', 'Clara Cevik', '20111');
```

---

### 2. Quiz-Tabelle 2: `schueler_denorm` (Schule & Klassen)
* **Ausgangssituation:** `schueler_denorm(matr_nr PK, name, klasse, klassensprecher)`
* **Transitive Kette:** $\text{matr\_nr} \rightarrow \text{klasse} \rightarrow \text{klassensprecher}$ (Der Klassensprecher ist eine Eigenschaft der Klasse, nicht des einzelnen Schülers).
* **3NF-Zerlegung:**
  1. `klasse(klasse PK, klassensprecher)`
  2. `schueler(matr_nr PK, name, klasse FK)`

#### SQL-Definitionen (`CREATE TABLE`):
```sql
CREATE TABLE klasse (
  klasse          TEXT PRIMARY KEY,
  klassensprecher TEXT NOT NULL
);

CREATE TABLE schueler (
  matr_nr INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  klasse  TEXT NOT NULL,
  FOREIGN KEY (klasse) REFERENCES klasse(klasse) ON UPDATE CASCADE ON DELETE RESTRICT
);
```

#### Beispieldatensätze (je 3 Zeilen):
```sql
INSERT INTO klasse (klasse, klassensprecher) VALUES
  ('3AHWII', 'David Demir'),
  ('3BHWII', 'Elena Egger'),
  ('3CHWII', 'Felix Frei');

INSERT INTO schueler (matr_nr, name, klasse) VALUES
  (1001, 'Anna Auer',   '3AHWII'),
  (1002, 'Bernd Beck',  '3AHWII'),
  (1003, 'Clara Cevik', '3BHWII');
```

---

## 4. Interleaving: Rekonstruktion per JOIN

Um zu beweisen, dass die Normalisierung verlustfrei war, rekonstruiert folgende SQL-Abfrage die vollständige Ausgangsansicht der Bestellungen:

```sql
SELECT 
  b.bestell_nr,
  b.kunde,
  p.plz,
  p.ort,
  bp.track_id,
  t.titel AS track_titel,
  t.dauer_sek,
  bp.menge
FROM bestellung b
JOIN plz p ON b.plz = p.plz
JOIN bestellposition bp ON b.bestell_nr = bp.bestell_nr
JOIN track t ON bp.track_id = t.track_id
ORDER BY b.bestell_nr, bp.track_id;
```

### Abfrage-Ergebnis:
```
bestell_nr  kunde  plz   ort   track_id  track_titel   dauer_sek  menge
----------  -----  ----  ----  --------  ------------  ---------  -----
101         Auer   1020  Wien  1         Silent Lines  215        1    
101         Auer   1020  Wien  2         Night Ferry   240        2    
102         Beck   1020  Wien  1         Silent Lines  215        1    
102         Beck   1020  Wien  3         Dust Choir    198        1    
103         Cevik  4020  Linz  2         Night Ferry   240        3    
```

---

## 5. Nachweis der Demo-Ausführung (`deno task demo`)

Die Demo aus `Beispielprojekte/km5-02-normalisierung/` wurde erfolgreich ausgeführt:

### Konsolenprotokoll `deno task demo`:
```text
> deno task demo
Task demo deno run --allow-read --allow-write demo.ts
1NF: WHERE hobbys = 'Schwimmen' findet 0 Zeilen (die Zelle ist eine Liste).
1NF-Fix: eine Zeile pro Wert -> 1 Treffer.
2NF: song_id 1 hat 2 verschiedene Titel (Titel hängt nur an song_id).
2NF-Fix: der Titel steht 1 Mal fuer song_id 1.
3NF: PLZ 1020 hat 2 verschiedene Orte (Ort hängt an PLZ).
```

### Konsolenprotokoll `deno task test`:
```text
> deno task test
Task test deno test demo_test.ts
Check demo_test.ts
running 4 tests from ./demo_test.ts
1NF: Liste in der Zelle bricht die Gleichheitssuche ... ok (0ms)
2NF: partielle Abhängigkeit erlaubt widersprüchliche Titel ... ok (0ms)
3NF: transitive Abhängigkeit erlaubt widersprüchliche Orte ... ok (0ms)
3NF-Fix: PLZ -> Ort steht genau einmal ... ok (0ms)

ok | 4 passed | 0 failed (8ms)
```

---

## 6. Das Prisma 7-Projekt („mit prisma!!")

Im Unterordner `praxis/` wurde die Aufgabe gemäß Unterrichtsvorgabe mit dem modernen ORM **Prisma 7** umgesetzt.

### 1. Modellierung in `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model Plz {
  plz          String       @id
  ort          String
  bestellungen Bestellung[]
}

model Track {
  id                Int               @id @default(autoincrement())
  titel             String
  dauerSek          Int
  bestellpositionen Bestellposition[]
}

model Bestellung {
  bestellNr  Int               @id
  kunde      String
  plz        String
  plzRel     Plz               @relation(fields: [plz], references: [plz])
  positionen Bestellposition[]
}

model Bestellposition {
  bestellNr  Int
  trackId    Int
  menge      Int        @default(1)
  bestellung Bestellung @relation(fields: [bestellNr], references: [bestellNr], onDelete: Cascade)
  track      Track      @relation(fields: [trackId], references: [id])

  @@id([bestellNr, trackId])
}

model Bank {
  blz      String  @id
  bankname String
  konten   Konto[]
}

model Konto {
  iban    String @id
  inhaber String
  blz     String
  bank    Bank   @relation(fields: [blz], references: [blz])
}

model Klasse {
  klasse          String     @id
  klassensprecher String
  schueler        Schueler[]
}

model Schueler {
  matrNr     Int    @id
  name       String
  klasseName String
  klasse     Klasse @relation(fields: [klasseName], references: [klasse])
}
```

### 2. Seeden & Ausführen der relationalen Abfragen
Befehle im Ordner `praxis/`:
* `npm run db:seed`
* `npm run run`

**Konsolenausgabe von `npm run run`:**
```text
=== 1) Rekonstruierte Bestellungen (JOIN via Prisma include) ===
┌─────────┬───────────┬─────────┬────────┬────────┬─────────┬────────────────┬──────────┬───────┐
│ (index) │ bestellNr │ kunde   │ plz    │ ort    │ trackId │ trackTitel     │ dauerSek │ menge │
├─────────┼───────────┼─────────┼────────┼────────┼─────────┼────────────────┼──────────┼───────┤
│ 0       │ 101       │ 'Auer'  │ '1020' │ 'Wien' │ 1       │ 'Silent Lines' │ 215      │ 1     │
│ 1       │ 101       │ 'Auer'  │ '1020' │ 'Wien' │ 2       │ 'Night Ferry'  │ 240      │ 2     │
│ 2       │ 102       │ 'Beck'  │ '1020' │ 'Wien' │ 1       │ 'Silent Lines' │ 215      │ 1     │
│ 3       │ 102       │ 'Beck'  │ '1020' │ 'Wien' │ 3       │ 'Dust Choir'   │ 198      │ 1     │
│ 4       │ 103       │ 'Cevik' │ '4020' │ 'Linz' │ 2       │ 'Night Ferry'  │ 240      │ 3     │
└─────────┴───────────┴─────────┴────────┴────────┴─────────┴────────────────┴──────────┴───────┘

=== 2) Quiz 1: Konten & Banken (3NF aufgelöst) ===
┌─────────┬────────────────────────┬───────────────┬─────────┬────────────────┐
│ (index) │ iban                   │ inhaber       │ blz     │ bankname       │
├─────────┼────────────────────────┼───────────────┼─────────┼────────────────┤
│ 0       │ 'AT422011100055443322' │ 'Clara Cevik' │ '20111' │ 'Erste Bank'   │
│ 1       │ 'AT611200000012345678' │ 'Anna Auer'   │ '12000' │ 'Bank Austria' │
│ 2       │ 'AT892011100098765432' │ 'Bernd Beck'  │ '20111' │ 'Erste Bank'   │
└─────────┴────────────────────────┴───────────────┴─────────┴────────────────┘

=== 3) Quiz 2: Schüler & Klassen (3NF aufgelöst) ===
┌─────────┬────────┬───────────────┬──────────┬─────────────────┐
│ (index) │ matrNr │ name          │ klasse   │ klassensprecher │
├─────────┼────────┼───────────────┼──────────┼─────────────────┤
│ 0       │ 1001   │ 'Anna Auer'   │ '3AHWII' │ 'David Demir'   │
│ 1       │ 1002   │ 'Bernd Beck'  │ '3AHWII' │ 'David Demir'   │
│ 2       │ 1003   │ 'Clara Cevik' │ '3BHWII' │ 'Elena Egger'   │
└─────────┴────────┴───────────────┴──────────┴─────────────────┘

=== 4) 3NF-Konsistenzprobe (Update auf PLZ 1020) ===
┌─────────┬───────────┬────────┬────────┬─────────────────────┐
│ (index) │ bestellNr │ kunde  │ plz    │ ort                 │
├─────────┼───────────┼────────┼────────┼─────────────────────┤
│ 0       │ 101       │ 'Auer' │ '1020' │ 'Wien (Hauptstadt)' │
│ 1       │ 102       │ 'Beck' │ '1020' │ 'Wien (Hauptstadt)' │
└─────────┴───────────┴────────┴────────┴─────────────────────┘
```

### 3. Automatisierte Tests (`npm test`)
7 Unit-Tests mit `node:test` belegen die fehlerfreie Normalisierung:
```text
> km5-02-normalisierung-praxis@1.0.0 test
> node --test

Seed erfolgreich durchgeführt: Alle 3NF-Tabellen befüllt.
✔ 1NF: Jede Bestellposition ist eine atomare Zeile (keine Listen im Attribut) (208ms)
✔ 2NF: Track existiert unabhängig von Bestellungen (keine partielle Abhängigkeit) (4ms)
✔ 3NF: Ort hängt nur an PLZ (keine transitive Abhängigkeit in Bestellung) (2ms)
✔ Interleaving: Vollständige Rekonstruktion aller Bestellungen mit JOIN (6ms)
✔ Quiz 1: Bank & Konto sind sauber 3NF-normalisiert (1ms)
✔ Quiz 2: Klasse & Schüler sind sauber 3NF-normalisiert (1ms)
✔ Anomaliefreiheit: Update auf PLZ aktualisiert alle verknüpften Bestellungen konsistent (11ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
```

---

## 7. Selbst ausprobieren & nachvollziehen

### Deno-Tests (ohne npm / ohne Node):
```powershell
cd "c:\Users\roger\Desktop\aktive repos\INFI_2026-27\INFI_3AHWII_RA_2026-27\Hausuebungen\2026-10-06_normalisierung"
deno task demo
deno task test
```

### Reines SQLite per CLI testen:
```powershell
Get-Content schema.sql, seed.sql, queries.sql | sqlite3 :memory:
```

### Prisma-Projekt testen:
```powershell
cd praxis
npm run db:seed
npm run run
npm test
```

