# CRM Tech-Team Adventskalender

Ein interaktiver Adventskalender mit Supabase-Anbindung, gehostet auf IONOS.

## Vorbereitung

Stelle sicher, dass du [Node.js](https://nodejs.org/) auf deinem Computer installiert hast.

1.  Lade alle Projektdateien in einen Ordner auf deinem Computer herunter.
2.  Öffne das Terminal (Eingabeaufforderung/PowerShell) in diesem Ordner.
3.  Installiere die notwendigen Pakete (falls noch nicht geschehen):
    ```bash
    npm install
    ```

---

## Anleitung zum Hosting auf IONOS (Schritt für Schritt)

IONOS "Webhosting" dient dazu, **statische Dateien** bereitzustellen. Wir müssen deine React-App also erst in solche statischen Dateien umwandeln.

### Schritt 1: Projekt bauen ("Build")

Führe im Terminal folgenden Befehl aus:

```bash
npm run build
```

**Was passiert jetzt?**
*   Der Computer rechnet kurz.
*   Es entsteht ein neuer Ordner in deinem Projektverzeichnis namens **`dist`**.
*   Dieser Ordner enthält alles, was du brauchst (eine `index.html` und einen `assets`-Ordner).

### Schritt 2: Bei IONOS einloggen

1.  Logge dich in dein [IONOS Konto](https://login.ionos.de/) ein.
2.  Klicke im Menü auf **"Hosting"**.
3.  Wähle deinen Vertrag aus (falls du mehrere hast).
4.  Suche nach dem Punkt **"Webspace nutzen"** oder **"Webspace Explorer"** und klicke darauf.

### Schritt 3: Den richtigen Ordner finden

Du siehst nun die Ordnerstruktur deines Servers.
*   Du musst wissen, auf welchen Ordner deine Domain (z.B. `deinedomain.de`) zeigt.
*   *Tipp:* Oft ist das das Hauptverzeichnis (`/`) oder ein Unterordner wie `/clickandbuilds/MeinProjekt`.
*   Falls du unsicher bist: Gehe im IONOS Menü kurz auf "Domains", klicke auf deine Domain und schau unter "Verwendungsart", welches Zielverzeichnis eingestellt ist.

### Schritt 4: Dateien hochladen

1.  Öffne auf deinem **eigenen Computer** den Ordner **`dist`**, der in Schritt 1 erstellt wurde.
2.  Du solltest dort eine `index.html` und einen `assets` Ordner sehen.
3.  Markiere **den INHALT** des `dist` Ordners (nicht den Ordner `dist` selbst!).
4.  Ziehe diese Dateien (`index.html`, `assets`, etc.) per Drag & Drop in das Browser-Fenster des **IONOS Webspace Explorers**.

**WICHTIG:**
Die Datei `index.html` muss direkt in dem Verzeichnis liegen, auf das deine Domain zeigt.
*   Richtig: `deinedomain.de/index.html` (wird automatisch geladen)
*   Falsch: `deinedomain.de/dist/index.html`

### Schritt 5: Testen

Rufe deine Domain im Browser auf.
*   Der Adventskalender sollte erscheinen.
*   Das Logo sollte laden.
*   Login/Registrierung sollten funktionieren (da die Datenbank bei Supabase liegt und von überall erreichbar ist).

---

## Fehlerbehebung

*   **Seite bleibt weiß?**
    Prüfe im IONOS Webspace, ob die `index.html` wirklich da ist.
*   **Bilder fehlen?**
    Prüfe, ob der Ordner `assets` erfolgreich hochgeladen wurde.
*   **Supabase Fehler?**
    Da die Datenbank extern läuft, muss an IONOS nichts konfiguriert werden. Stelle sicher, dass der `supabaseClient.ts` die korrekten Keys enthält (ist im Code bereits hinterlegt).
