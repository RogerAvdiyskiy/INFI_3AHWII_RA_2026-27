# HÜ vom 15.09.2026 (Sondereinheit Agentic Coding, nur X-Gruppe)

**Stellung:** `GRG-INFI/3ahwii/2026-09-15_agentic-coding-einstieg/README.md` → HÜ.
Fällig: zur nächsten UE (22.09.2026).

## Nachweis-Checkliste

- [x] `opencode` installiert und lauffähig — Nachweis: `opencode.cmd --version` → `1.18.32`
  (Hinweis: In PowerShell 5.1 ist das `opencode.ps1`-Shim per ExecutionPolicy
  blockiert — Aufruf über `opencode.cmd` umgeht das. Dauerhaft löst es
  `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`,
  siehe Setup-Anleitung der Einheit.)
- [x] Freier Provider verbunden (eigene `/connect`-Einrichtung, kein Secret im Repo).
- [x] `AGENTS.md` im eigenen Repo angelegt und an dieses Repo angepasst
  (siehe `/AGENTS.md` im Repo-Root) — **noch zu committen** (Commit durch mich,
  nicht durch den Agenten).
- [x] Keine Secrets/API-Keys im Repo.

## Was `AGENTS.md` steuert (kurze Notiz zur Abgabe)

`AGENTS.md` ist die Projekt-Anweisung für Coding-Agenten (opencode liest sie
automatisch): Stack (Deno + `node:sqlite`, kein Node/npm), SQL-Stil (Keywords
GROSS, deutsche Kommentare, `deno fmt`), Ordner-Schema (`Hausuebungen/` je
Datum, `*.db` nie committen) und Arbeitsregeln (Diff prüfen vor Commit, kleine
Commits, keine Secrets). Damit verhält sich jeder Agent im Repo gleich —
liest man es, weiß man sofort, wie hier gearbeitet wird.
