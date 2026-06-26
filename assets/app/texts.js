/**
 * TibetanTEI — texts.js
 * Projekt: Brugnara - TibetanTEI
 * Autor:   Albert Brugnara
 *
 * Erstellt: 2025-05-14T10:00:00+02:00
 * Geändert: 2026-05-16T00:00:00+02:00
 *
 * Pfad: assets/app/texts.js
 *       (Verzeichnis heißt app/, nicht js/)
 *
 * Änderungshistorie:
 *   2026-05-14  name-Feld in jedem Texteintrag ergänzt;
 *               Dokumentation der Datenstruktur.
 *   2026-05-14  Verzeichnis assets/js/ → assets/app/ umbenannt.
 *
 * Beschreibung:
 *   Statische Konfigurationsdaten für das TibetanTEI-Projekt.
 *
 *   `texts`      — Array aller verfügbaren Texte mit ihren XML-Dateipfaden.
 *   `references` — Lookup-Tabelle für externe Referenztypen (BUDA, DOHO, …).
 */

"use strict";

/**
 * @typedef {{ id: string, name: string, url: string }} TextEntry
 *   id   — eindeutiger Bezeichner (Ganzzahl als String); wird als URL-Parameter
 *           ?id=... übergeben.
 *   name — Anzeigename für das Dropdown und spätere Textlisten.
 *   url  — relativer Pfad zur TEI-XML-Datei.
 */

/** @type {TextEntry[]} */
const texts = [
    { id: "1", name: "Gampopa",                         url: "content/1_gompopa.xml"              },
    { id: "2", name: "Dignāga",                         url: "content/2_dignaga.xml"              },
    { id: "3", name: "Ganden",                          url: "content/3_ganden.xml"               },
    { id: "4", name: "Śrīsena",                         url: "content/4_shrisena.xml"             },
    { id: "5", name: "Klong chen rab 'byams",           url: "content/5_klong_chen_ran_'byam.xml" },
    { id: "6", name: "Śāntideva — Bodhicaryāvatāra",    url: "content/6_shantideva_bca.xml"       },
    { id: "7", name: "Gong dkar rDo rje gdan pa",       url: "content/7_r103.xml"                 },
    { id: "8", name: "bu ston dignaga",                 url: "content/8_bu_ston_dignaga.xml"      },
    { id: "9", name: "Vimalaprabha",                    url: "content/9_Vimalaprabha.xml"         },
];

/**
 * @typedef {{ type: string, url: string }} ReferenceEntry
 *   type — Kürzel des Referenzsystems (z. B. "BUDA", "rKTs").
 *   url  — Basis-URL; die konkrete ID wird angehängt.
 */

/** @type {ReferenceEntry[]} */
const references = [
    { type: "BUDA", url: "https://library.bdrc.io/show/bdr:" },
    { type: "DOHO", url: "https://library.bdrc.io/show/bdr:" },
    { type: "rKTs", url: "http://www.rkts.org/" },
    { type: "SRS",  url: "" }, /* URL noch nicht bekannt */
    { type: "SRC",  subtype: "persons", url: "https://sakyaresearch.org/persons/" },
    { type: "SRC",  subtype: "places",  url: "https://sakyaresearch.org/places/" },
    { type: "SRC",  subtype: "sources", url: "https://sakyaresearch.org/sources/" },
];
