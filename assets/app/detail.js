/**
 * TibetanTEI — detail.js
 * Projekt: Brugnara - TibetanTEI
 * Autor:   Albert Brugnara
 *
 * Erstellt: 2025-05-14T10:00:00+02:00
 * Geändert: 2026-05-21T00:00:00+02:00
 *
 * Pfad: assets/app/detail.js
 *
 * Änderungshistorie:
 *   2025-05-14  Erstkorrektur und Grundstruktur.
 *   2026-05-15  Register: Häufigkeit, Seitenlinks, Wylie-Transliteration,
 *               alphabetische Sortierung nach Wylie. Rollenregister:
 *               buildRoleList(), Mehrfachrollen. checkXmlConsistency().
 *               isValidUrl(), resolveUrlFromText(). fillPane().
 *               Faksimile: Zoom, Drag, Reset.
 *   2026-05-16  Tab-Labels: Faks./XML/Tibetan/Wylie/De/En/Pers./Orte/Rolle.
 *               Rollenregister: Seitenlinks. event.stopPropagation().
 *   2026-05-17  Register-Highlight: pendingHighlightId, scrollIntoView().
 *   2026-05-18  jQuery entfernt — fetch() + DOMParser statt $.ajax().
 *               xmlInnerHTML(), findByLang(). fillPane() wiederhergestellt.
 *               TEI <s>-Tags → <span class="tei-s">. attachParallelText().
 *               Microsoft Himalaya als primärer Tibetan-Font.
 *               Unabhängiges Spalten-Scrollen, schmaler Scrollbalken.
 *   2026-05-19  <w>-Tags im Tibetan-Pane entfernt für korrektes Shaping.
 *               Suchzähler: input/change/keyup Events.
 *   2026-05-21  Vokabelregister: buildVocabList(), highlightWord().
 *               projectData.vocab, interp-Loading. Vok.-Tab.
 *
 * Beschreibung:
 *   Kernlogik der Detail-Ansicht:
 *   • Lädt eine TEI-XML-Datei via fetch() + DOMParser.
 *   • Rendert Faksimile, Tibetisch, Deutsch, Englisch, Wylie und XML.
 *   • Volltextsuche mit Trefferliste und Navigation.
 *   • Personen-/Ortsregister, Rollenregister, Vokabelregister.
 *   • Paralleltext-Abfrage per Klick auf tibetische Sätze.
 */

"use strict";

/* ── Verben/Partikel: gepunktete Unterstreichung — 2026-05-29 ─────────── */
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Alle-Textzeugen Ergebnispanel — 2026-05-30 */
        #alleErgebnisPanel {
            position: fixed; bottom: 0; left: 0; right: 0;
            max-height: 220px; overflow-y: auto;
            background: #fff; border-top: 2px solid #5a3e2b;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.15);
            z-index: 9999; font-size: 0.82rem; display: none;
        }
        #alleErgebnisPanel .ae-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 4px 12px; background: #5a3e2b; color: #fff;
            font-weight: bold; position: sticky; top: 0;
        }
        #alleErgebnisPanel .ae-header button {
            background: none; border: none; color: #fff;
            font-size: 1rem; cursor: pointer; padding: 0 4px;
        }
        #alleErgebnisPanel .ae-item {
            padding: 5px 12px; border-bottom: 1px solid #eee;
            cursor: pointer; display: flex; gap: 8px; align-items: baseline;
        }
        #alleErgebnisPanel .ae-item:hover { background: #f5ede6; }
        #alleErgebnisPanel .ae-item.ae-aktiv {
            background: #f5ede6; border-left: 3px solid #5a3e2b; font-weight: bold;
        }
        #alleErgebnisPanel .ae-textname {
            color: #5a3e2b; font-weight: bold; min-width: 130px; flex-shrink: 0;
        }
        #alleErgebnisPanel .ae-seite {
            color: #888; min-width: 36px; flex-shrink: 0;
        }
        #alleErgebnisPanel .ae-snippet {
            color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        /* Verb/Partikel-Regeln werden dynamisch per wtypeAktualisieren() gesetzt */
        .wtype-legende {
            margin-top: 0.75rem;
            padding-top: 0.5rem;
            border-top: 1px solid #e5e5e5;
            font-size: 0.78rem;
            color: #666;
            display: flex;
            gap: 1.2rem;
            flex-wrap: wrap;
        }
        .wtype-legende label {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            cursor: pointer;
        }
        .wtype-legende input[type="checkbox"] {
            cursor: pointer;
            accent-color: #5a3e2b;
        }
        .wtype-legende .verb-demo {
            text-decoration: underline dotted #16a34a;
            text-decoration-thickness: 1.5px;
            text-underline-offset: 2px;
            font-size: 0.85rem;
        }
        .wtype-legende .part-demo {
            text-decoration: underline dotted #dc2626;
            text-decoration-thickness: 1.5px;
            text-underline-offset: 2px;
            font-size: 0.85rem;
        }
    `;


    document.head.appendChild(style);
})();

/* ── Verb/Partikel/Vok.-Markierung: Zustand (wird durch Checkboxen gesteuert) — 2026-05-29 */
let wtypeVerbenAn   = true;
let wtypePartikelAn = true;
let wtypeVokAn      = true;

function wtypeAktualisieren() {
    /* Dynamische Style-Regeln ein-/ausschalten */
    let css = '';
    if (wtypeVerbenAn) {
        css += '[data-wid][data-type="verb"] { ' +
               'text-decoration: underline dotted #16a34a; ' +
               'text-decoration-thickness: 1.5px; text-underline-offset: 2px; }';
    }
    if (wtypePartikelAn) {
        css += '[data-wid][data-type="particle"] { ' +
               'text-decoration: underline dotted #dc2626; ' +
               'text-decoration-thickness: 1.5px; text-underline-offset: 2px; }';
    }
    if (wtypeVokAn) {
        css += '.vocab-linked { ' +
               'text-decoration: underline dotted var(--color-place, #c47d00); ' +
               'text-decoration-thickness: 1.5px; text-underline-offset: 4px; }';
    }
    let dynStyle = document.getElementById('wtype-dyn-style');
    if (!dynStyle) {
        dynStyle = document.createElement('style');
        dynStyle.id = 'wtype-dyn-style';
        document.head.appendChild(dynStyle);
    }
    dynStyle.textContent = css;

    /* Checkboxen in allen Legenden synchronisieren */
    document.querySelectorAll('.wtype-cb-verb').forEach(cb => {
        cb.checked = wtypeVerbenAn;
    });
    document.querySelectorAll('.wtype-cb-part').forEach(cb => {
        cb.checked = wtypePartikelAn;
    });
    document.querySelectorAll('.wtype-cb-vok').forEach(cb => {
        cb.checked = wtypeVokAn;
    });
}

/* =========================================================
   Globaler Zustand
   ========================================================= */

/**
 * @typedef {{ id: string, name: string, url: string }} RegisterEntry
 * @typedef {{ n: string, facsimile: string, translations: Array<{lang: string, text: string}>, xmlRaw: string }} Page
 * @typedef {{ pages: Page[], listPerson: RegisterEntry[], listPlaces: RegisterEntry[] }} ProjectData
 * @typedef {{ n: string, query: string, snippet: string }} SearchMatch
 */

/** @type {ProjectData} */
let projectData = { pages: [], listPerson: [], listPlaces: [], listRoles: {}, occurrences: {}, vocab: [] };

/** Aktuell geladener Texteintrag aus texts.js */
let currentEntry = null;

/** @type {SearchMatch[]} Alle gefundenen Suchtreffer über alle Seiten */
let searchMatches = [];

/** @type {number} Index des aktuell hervorgehobenen Treffers (-1 = keiner) */
let currentMatchIndex = -1;

/* =========================================================
   DOM-Referenzen (Links- und Rechtsspalte)
   ========================================================= */

/**
 * Hilfsfunktion: gibt ein DOM-Element anhand seiner ID zurück oder null.
 * Zentralisiert alle getElementById-Aufrufe für bessere Wartbarkeit.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function el(id) {
    return document.getElementById(id);
}

/** DOM-Referenzen für die linke Spalte */
const left = {
    facsimile: el("facsimile-left"),
    german:    el("german-left"),
    tibetan:   el("tibetan-left"),
    english:   el("english-left"),
    wylie:     el("wylie-left"),
    sanskrit:  el("sanskrit-left"),
    xml:       el("xml-left"),
    persons:   el("persons-left"),
    places:    el("places-left"),
    roles:     el("roles-left"),
    vocab:     el("vocab-left")
};

/** DOM-Referenzen für die rechte Spalte */
const right = {
    facsimile: el("facsimile-right"),
    german:    el("german-right"),
    tibetan:   el("tibetan-right"),
    english:   el("english-right"),
    wylie:     el("wylie-right"),
    sanskrit:  el("sanskrit-right"),
    xml:       el("xml-right"),
    persons:   el("persons-right"),
    places:    el("places-right"),
    roles:     el("roles-right"),
    vocab:     el("vocab-right")
};

/* =========================================================
   Hilfsfunktionen
   ========================================================= */

/**
 * Maskiert HTML-Sonderzeichen für die sichere Ausgabe im XML-Pane.
 *
 * @param {string} unsafe  Rohtext mit möglichen HTML-Sonderzeichen
 * @returns {string}       Maskierter Text
 */
const escapeXml = (unsafe) =>
    unsafe.replace(/[&<>"']/g, m => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#039;"
    })[m]);

/**
 * Extrahiert ein Kontext-Snippet um den ersten Treffer eines Suchbegriffs.
 * Gibt je drei Wörter vor und nach dem Treffer zurück.
 *
 * @param {string} text   Volltext (HTML oder XML)
 * @param {string} query  Suchbegriff
 * @returns {string}      Snippet mit „..." als Auslassung
 */
function getSnippet(text, query) {
    /* Bei XML-Suche (enthält = oder <) bleibt HTML-Markup erhalten. */
    const isXmlSearch = query.includes("=") || query.includes("<");
    const cleanText   = isXmlSearch ? text : text.replace(/<[^>]*>/g, " ");
    const words       = cleanText.split(/\s+/);
    const queryFirst  = query.split(/[ ="<>]/)[0].toLowerCase();
    const matchIdx    = words.findIndex(w => w.toLowerCase().includes(queryFirst));

    if (matchIdx === -1) return "...";

    const start = Math.max(0, matchIdx - 3);
    const end   = Math.min(words.length, matchIdx + 4);
    return `…${words.slice(start, end).join(" ")}…`;
}

/* =========================================================
   Initialisierung
   ========================================================= */

window.onload = function () {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
        loadText(id);
    } else {
        console.warn("TibetanTEI: Kein Text-ID in der URL gefunden (?id=...).");
    }
    initTabs();
    initFacsimileZoom();
};

/* =========================================================
   XML laden & parsen
   ========================================================= */

/**
 * Löst eine URL aus dem XML-Text auf — native DOMParser-Version.
 * Geändert: 2026-05-18 — jQuery → nativer DOMParser
 *
 * @param {string}   id      xml:id des Eintrags (ohne #)
 * @param {Document} xmlDoc  geparster XML-DOM
 * @returns {string}         URL oder leerer String
 */
function resolveUrlFromText(id, xmlDoc) {
    /* Im XML-DOM sind Namespace-Attributselektoren nicht zuverlässig.
     * Wir suchen alle persName/placeName/title und prüfen corresp manuell. */
    const selectors = [
        { tags: ['persName'], type: 'person' },
        { tags: ['placeName'], type: 'place' },
        { tags: ['title'],    type: 'title'  },
    ];
    let elem = null, elemType = 'person';
    for (const { tags, type } of selectors) {
        for (const tag of tags) {
            const found = Array.from(xmlDoc.querySelectorAll(tag))
                .find(el => el.getAttribute('corresp') === `#${id}`);
            if (found) { elem = found; elemType = type; break; }
        }
        if (elem) break;
    }
    if (!elem) return "";

    const key  = elem.getAttribute("key")  || "";
    const type = elem.getAttribute("type") || "";
    if (!key || key === "???") return "";

    if (type === "SRC") {
        if (elemType === "person") return `https://sakyaresearch.org/persons/${key}`;
        if (elemType === "place")  return `https://sakyaresearch.org/places/${key}`;
        if (elemType === "title")  return `https://sakyaresearch.org/sources/${key}`;
        return "";
    }

    const ref = typeof references !== "undefined"
        ? references.find(r => r.type === type && !r.subtype)
        : null;
    if (!ref || !ref.url) return "";
    return ref.url + key;
}

/**
 * Hilfsfunktion: Serialisiert den Inhalt eines XML-Elements zu HTML-String.
 * XMLSerializer fügt xmlns-Attribute auf alle Tags ein — diese werden entfernt.
 * Geändert: 2026-05-18 — für DOMParser XML-DOM
 *
 * @param {Element} el  XML-Element dessen Inhalt serialisiert werden soll
 * @returns {string}    Innerer HTML-String ohne xmlns-Attribute
 */
function xmlInnerHTML(el) {
    const serialized = new XMLSerializer().serializeToString(el);
    /* Äußerstes Tag entfernen */
    const inner = serialized
        .replace(/^<[^>]+>/, '')
        .replace(/<\/[^>]+>$/, '');
    /* xmlns-Attribute entfernen die XMLSerializer auf allen Tags einfügt */
    return inner.replace(/\s+xmlns(?::[^=]*)?\s*=\s*"[^"]*"/g, '');
}

/**
 * Hilfsfunktion: Findet erstes Element mit xml:lang-Attribut.
 * querySelector('[xml:lang=...]') ist im XML-DOM nicht zuverlässig.
 * Geändert: 2026-05-18
 *
 * @param {Element} parent  Elternelement
 * @param {string}  tag     Tagname (z.B. "persName")
 * @param {string}  lang    Sprachwert (z.B. "bo-Latn")
 * @returns {Element|null}
 */
function findByLang(parent, tag, lang) {
    return Array.from(parent.querySelectorAll(tag))
        .find(el =>
            el.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'lang') === lang
            || el.getAttribute('xml:lang') === lang
        ) || null;
}

/**
 * Lädt die TEI-XML-Datei via fetch() + DOMParser (kein jQuery).
 * Geändert: 2026-05-18 — jQuery $.ajax() → nativer fetch() + DOMParser
 *
 * @param {string} id  Text-ID (aus texts.js)
 */



function loadText(id) {
    projectData.pages       = [];
    projectData.listPerson  = [];
    projectData.listPlaces  = [];
    projectData.listRoles   = {};
    projectData.occurrences = {};
    projectData.vocab       = [];

    const entry = typeof texts !== "undefined" ? texts.find(t => t.id === id) : null;
    if (!entry) {
        console.warn(`TibetanTEI: Kein Texteintrag für ID "${id}" gefunden.`);
        return;
    }
    currentEntry = (typeof texts !== 'undefined') ? (texts.find(t => t.id === id) || null) : null;
    /* Wenn manuell gewechselt: Ursprungs-Eintrag zurücksetzen */
    if (window.tibetanTEIOriginalEntry &&
        window.tibetanTEIOriginalEntry.id === id) {
        window.tibetanTEIOriginalEntry = null;
    }

    fetch(entry.url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${entry.url}`);
            return response.text();
        })
        .then(text => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "application/xml");

            const parseErr = xmlDoc.querySelector("parsererror");
            if (parseErr) throw new Error(`XML-Parsefehler: ${parseErr.textContent.slice(0, 100)}`);

            /* --- Externes standOff laden falls @source gesetzt — 2026-05-29 */
            const standOffEl = xmlDoc.querySelector("standOff[source]");
            const standOffSrc = standOffEl ? standOffEl.getAttribute("source") : null;

            /* Hilfsfunktion: Register aus einem xmlDoc-Fragment aufbauen */
            function parseStandOff(doc, overwrite = false) {
        /* xml:id namespace-sicher lesen — 2026-05-29 */
        const XML_ID_NS = 'http://www.w3.org/XML/1998/namespace';
        const getXmlId = (el) =>
            el.getAttributeNS(XML_ID_NS, 'id') ||
            el.getAttribute('xml:id') || '';
                /* Vokabelregister — fvLib/fs TEI-P5-konform */
                doc.querySelectorAll("fvLib fs[type='vocab']").forEach(fs => {
                    const id  = getXmlId(fs);
                    const get = name => fs.querySelector(`f[name="${name}"] string`)?.textContent.trim() || '';
                    projectData.vocab.push({
                        id,
                        lemmaUchen: get('lemma_uchen'),
                        lemmaWylie: get('lemma_wylie'),
                        pos:        get('pos'),
                        subc:       get('subc'),
                        defDe:      get('def_de'),
                        defEn:      get('def_en'),
                    });
                });

                /* Personenregister — namespace-sicher — 2026-05-29 */
                const TEI_NS2 = "http://www.tei-c.org/ns/1.0";
                const ns = (tag) => Array.from(doc.getElementsByTagNameNS(TEI_NS2, tag));

                ns("person").forEach(person => {
                    const xmlId = getXmlId(person);
                    if (xmlId.endsWith('_placeholder')) return;
                    /* Wylie: erste bo-Latn persName OHNE type="title" — 2026-05-29 */
                    const allePersNames = Array.from(
                        person.getElementsByTagNameNS(TEI_NS2, "persName")
                    );
                    const wylieElem = allePersNames.find(el => {
                        const lang = el.getAttributeNS(
                            'http://www.w3.org/XML/1998/namespace', 'lang')
                            || el.getAttribute('xml:lang') || '';
                        const typ  = el.getAttribute('type') || '';
                        return (lang === 'bo-Latn' || lang === 'wylie')
                               && typ !== 'title';
                    });
                    const wylie = wylieElem ? wylieElem.textContent.trim()
                                           : xmlId.replace(/-/g, " ");

                    /* Name: bo bevorzugen, dann sa, dann erste persName — 2026-05-29 */
                    const nameElem = allePersNames.find(el => {
                        const lang = el.getAttributeNS(
                            'http://www.w3.org/XML/1998/namespace', 'lang')
                            || el.getAttribute('xml:lang') || '';
                        return lang === 'bo';
                    }) || allePersNames.find(el => {
                        const lang = el.getAttributeNS(
                            'http://www.w3.org/XML/1998/namespace', 'lang')
                            || el.getAttribute('xml:lang') || '';
                        return lang === 'sa';
                    }) || allePersNames[0];

                    const idnoEl = person.getElementsByTagNameNS(TEI_NS2, "idno")[0] || null;
                    let url = idnoEl ? idnoEl.textContent.trim() : "";
                    if (!isValidUrl(url)) url = resolveUrlFromText(xmlId, doc);
                    const bestehenIdx = projectData.listPerson.findIndex(p => p.id === xmlId);
                    const neuerEintrag = {
                        id:    xmlId,
                        name:  nameElem?.textContent.trim() || "(unbekannte Person)",
                        wylie: wylie,
                        url:   url
                    };
                    if (xmlId === 'shriharsa' || xmlId === 'zab-mo') {
                        console.log(`[TIBETANTEI] Person '${xmlId}': name='${neuerEintrag.name}' wylie='${neuerEintrag.wylie}' overwrite=${overwrite} existing=${bestehenIdx >= 0}`);
                    }
                    if (bestehenIdx >= 0 && overwrite) {
                        projectData.listPerson[bestehenIdx] = neuerEintrag;
                    } else if (bestehenIdx < 0) {
                        projectData.listPerson.push(neuerEintrag);
                    }
                });

                /* Ortsregister — namespace-sicher */
                ns("place").forEach(place => {
                    const xmlId     = getXmlId(place);
                    if (xmlId.endsWith('_placeholder')) return;
                    const wylieElem = findByLang(place, "placeName", "bo-Latn")
                                   || findByLang(place, "placeName", "wylie");
                    const wylie     = wylieElem ? wylieElem.textContent.trim() : xmlId.replace(/-/g, " ");
                    const idnoEl    = place.getElementsByTagNameNS(TEI_NS2, "idno")[0] || null;
                    let url = idnoEl ? idnoEl.textContent.trim() : "";
                    if (!isValidUrl(url)) url = resolveUrlFromText(xmlId, doc);
                    const bestehenIdxPl = projectData.listPlaces.findIndex(p => p.id === xmlId);
                    const firstPlaceName = place.getElementsByTagNameNS(TEI_NS2, "placeName")[0];
                    const neuerOrt = {
                        id:    xmlId,
                        name:  firstPlaceName?.textContent.trim() || "(unbekannter Ort)",
                        wylie: wylie,
                        url:   url
                    };
                    if (bestehenIdxPl >= 0 && overwrite) {
                        projectData.listPlaces[bestehenIdxPl] = neuerOrt;
                    } else if (bestehenIdxPl < 0) {
                        projectData.listPlaces.push(neuerOrt);
                    }
                });

                /* Rollenregister — namespace-sicher */
                ns("person").forEach(person => {
                    const xmlId = getXmlId(person);
                    if (xmlId.endsWith('_placeholder')) return;
                    const roleNotes = [];
                    Array.from(person.getElementsByTagNameNS(TEI_NS2, "note")).forEach(n => {
                        if (n.getAttribute("type") === "role") {
                            const r = n.textContent.trim();
                            if (r) roleNotes.push(r);
                        }
                    });
                    if (xmlId && roleNotes.length > 0) {
                        roleNotes.forEach(role => {
                            if (!projectData.listRoles[role]) projectData.listRoles[role] = new Set();
                            projectData.listRoles[role].add(xmlId);
                        });
                    }
                });
            }

            /* Wenn externes standOff: zuerst standoff.xml laden,
               dann lokale Datei parsen und zusammenführen */
            const doFinish = () => {
                /* Rollen-Sets → Arrays mit Person-Objekten */
                Object.entries(projectData.listRoles).forEach(([role, idSet]) => {
                    if (idSet instanceof Set) {
                        projectData.listRoles[role] = [...idSet].map(id =>
                            projectData.listPerson.find(p => p.id === id) ||
                            { id, name: id, wylie: id, url: "" }
                        );
                    }
                });
                afterStandOff(xmlDoc);
            };

            if (standOffSrc) {
                /* standoff.xml relativ zur aktuellen HTML-Seite (detail.html im Repo-Root)
                   Funktioniert lokal UND auf GitHub Pages / custom domain — 2026-05-29 */
                const standOffUrl = new URL(standOffSrc, window.location.href).href;
                console.log('TibetanTEI: Lade standoff.xml von', standOffUrl);
                fetch(standOffUrl)
                    .then(r => r.ok ? r.text() : Promise.reject(`HTTP ${r.status}: ${standOffUrl}`))
                    .then(soText => {
                        const soDoc = parser.parseFromString(soText, "application/xml");
                        console.log('TibetanTEI: standoff.xml geladen, parse...');
                        /* standoff.xml hat Vorrang: zuerst laden, dann lokal */
                        parseStandOff(xmlDoc, false);  /* lokal: nur hinzufügen */
                        parseStandOff(soDoc,  true);   /* extern: überschreiben */
                        console.log('TibetanTEI: listPerson:', projectData.listPerson.length, 'Einträge');
                        doFinish();
                    })
                    .catch(err => {
                        console.warn(`TibetanTEI: standoff.xml FEHLER: ${err}`);
                        parseStandOff(xmlDoc, false);
                        doFinish();
                    });
            } else {
                /* Kein externes standOff – wie bisher */
                parseStandOff(xmlDoc);
                doFinish();
            }
        })
        .catch(err => {
            console.warn(`TibetanTEI: XML konnte nicht geladen werden (${entry.url}):`, err.message);
        });
}

/**
 * Wird nach dem Laden beider standOff-Quellen aufgerufen.
 * Enthält die bisherige Seitenlogik.
 */
function afterStandOff(xmlDoc) {
            /* --- Seiten ---
             * Nur direkte Kind-divs des body — nicht verschachtelte divs */
            /* Namespace-sichere Suche — TEI-Elemente haben xmlns:tei — 2026-05-29 */
            const TEI_NS = "http://www.tei-c.org/ns/1.0";
            const bodyEls = xmlDoc.getElementsByTagNameNS(TEI_NS, "body");
            const bodyEl  = bodyEls.length > 0 ? bodyEls[0]
                          : xmlDoc.querySelector("body");
            if (!bodyEl) {
                throw new Error("Kein <body>-Element gefunden.");
            }

            Array.from(bodyEl.children).forEach(div => {
                if (div.localName !== "div") return;

                /* <pb> namespace-sicher */
                const pbs = div.getElementsByTagNameNS(TEI_NS, "pb");
                const pb  = pbs.length > 0 ? pbs[0]
                          : div.querySelector("pb");
                if (!pb || !pb.getAttribute("n")) return;

                const trans = [];
                Array.from(div.children).forEach(child => {
                    if (child.localName !== "p") return;
                    const lang = child.getAttribute("xml:lang") || "";
                    if (lang) {
                        trans.push({ lang, text: xmlInnerHTML(child) });
                    }
                });

                const rawFacs = (pb.getAttribute("facs") || "").trim();
                const facs    = rawFacs.startsWith('../content/') ? rawFacs.slice(3) : rawFacs;

                projectData.pages.push({
                    n:            (pb.getAttribute("n") || "").toString().trim(),
                    facsimile:    facs,
                    translations: trans,
                    xmlRaw:       xmlInnerHTML(div)
                });

                /* --- Vorkommen zählen — namespace-sicher — 2026-05-29 --- */
                const pageN = (pb.getAttribute("n") || "").toString().trim();

                const zaehleVorkommen = (tagName) => {
                    Array.from(div.getElementsByTagNameNS(TEI_NS, tagName)).forEach(el => {
                        const rawId = (el.getAttribute("corresp") || "").replace(/^#/, "");
                        if (!rawId) return;
                        if (!projectData.occurrences[rawId]) projectData.occurrences[rawId] = [];
                        if (!projectData.occurrences[rawId].includes(pageN)) {
                            projectData.occurrences[rawId].push(pageN);
                        }
                    });
                };
                zaehleVorkommen("persName");
                zaehleVorkommen("placeName");
            });

            initializeUI();
            checkXmlConsistency();
}

/* =========================================================
   UI aufbauen
   ========================================================= */

/**
 * Prüft das geladene XML auf Konsistenzprobleme und gibt Meldungen
 * in der Browser-Konsole aus (F12 → Console).
 *
 * Zwei Kategorien:
 *   FEHLER (⚠, console.warn, gelb) — echte Probleme die behoben werden müssen:
 *     • Dubletten im Register (gleicher Name, verschiedene xml:id)
 *     • corresp-Referenzen im Text ohne Register-Gegenstück
 *
 *   HINWEISE (ℹ, console.info, blau) — offene Datenlücken, kein Fehler:
 *     • Fehlende BUDA/TBRC-URLs — Person/Ort noch nicht in externer DB erfasst
 */
function checkXmlConsistency() {
    const errors = [];   /* echte Fehler — müssen behoben werden */
    const infos  = [];   /* Datenlücken — können später ergänzt werden */

    /* --- 1. Dubletten im Personenregister --- */
    const personNames = {};
    projectData.listPerson.forEach(p => {
        const name = p.name.trim();
        if (!personNames[name]) personNames[name] = [];
        personNames[name].push(p.id);
    });
    Object.entries(personNames).forEach(([name, ids]) => {
        if (ids.length > 1) {
            errors.push(
                `⚠ DUBLETTE Person: "${name}" hat ${ids.length} IDs: ` +
                `${ids.map(i => `xml:id="${i}"`).join(", ")} → bitte im XML bereinigen`
            );
        }
    });

    /* --- 2. Dubletten im Ortsregister --- */
    const placeNames = {};
    projectData.listPlaces.forEach(p => {
        const name = p.name.trim();
        if (!placeNames[name]) placeNames[name] = [];
        placeNames[name].push(p.id);
    });
    Object.entries(placeNames).forEach(([name, ids]) => {
        if (ids.length > 1) {
            errors.push(
                `⚠ DUBLETTE Ort: "${name}" hat ${ids.length} IDs: ` +
                `${ids.map(i => `xml:id="${i}"`).join(", ")} → bitte im XML bereinigen`
            );
        }
    });

    /* --- 3. corresp-Referenzen ohne Register-Gegenstück --- */
    const allIds = new Set([
        ...projectData.listPerson.map(p => p.id),
        ...projectData.listPlaces.map(p => p.id)
    ]);
    Object.keys(projectData.occurrences).forEach(id => {
        if (!allIds.has(id)) {
            errors.push(
                `⚠ FEHLENDE REGISTER-ID: corresp="#${id}" im Text gefunden, ` +
                `aber kein xml:id="${id}" im standOff → bitte im XML ergänzen`
            );
        }
    });

    /* --- 4. Fehlende URLs — Hinweise, keine Fehler --- */
    projectData.listPerson.forEach(p => {
        if (p.id === 'person_placeholder') return;  /* Platzhalter ignorieren */
        if (!isValidUrl(p.url)) {
            infos.push(
                `ℹ Kein BUDA-Link: Person xml:id="${p.id}" ("${p.name}") — ` +
                `idno-URL noch nicht ermittelt`
            );
        }
    });
    projectData.listPlaces.forEach(p => {
        if (p.id === 'place_placeholder') return;  /* Platzhalter ignorieren */
        if (!isValidUrl(p.url)) {
            infos.push(
                `ℹ Kein BUDA-Link: Ort xml:id="${p.id}" ("${p.name}") — ` +
                `idno-URL noch nicht ermittelt`
            );
        }
    });

    /* --- Ausgabe --- */
    if (errors.length === 0 && infos.length === 0) {
        console.info("✓ TibetanTEI Konsistenzprüfung: Keine Probleme gefunden.");
        return;
    }

    /* Echte Fehler — gelb, sofort sichtbar */
    if (errors.length > 0) {
        console.group(`TibetanTEI ⚠ ${errors.length} Fehler — bitte im XML beheben`);
        errors.forEach(e => console.warn(e));
        console.groupEnd();
    }

    /* Datenlücken — blau, eingeklappt */
    if (infos.length > 0) {
        console.groupCollapsed(
            `TibetanTEI ℹ ${infos.length} fehlende BUDA-Links — ` +
            `können später ergänzt werden`
        );
        infos.forEach(i => console.info(i));
        console.groupEnd();
    }
}

/**
 * Baut das Dropdown-Menü für die Seitenauswahl auf,
 * befüllt den Seitenzähler und rendert die erste Seite.
 */
function initializeUI() {
    const select    = el("selectPage");
    const pageCount = el("pageCount");

    if (!select) return;

    select.innerHTML = projectData.pages
        .map(p => `<option value="${escapeXml(p.n)}">${escapeXml(p.n)}</option>`)
        .join("");

    /* KORREKTUR: pageCount wird jetzt korrekt befüllt */
    if (pageCount) {
        pageCount.textContent = projectData.pages.length;
    }

    /* Textname in der Seitennavigation anzeigen */
    const titleSpan = el("textTitle");
    if (titleSpan && currentEntry && currentEntry.name) {
        titleSpan.textContent = currentEntry.name;
    }

    select.onchange = (e) => renderPage(e.target.value);

    setupSearch();

    /* pendingNavigation: nach Text-Switch zur gewünschten Seite springen */
    if (window.tibetanTEIPendingNav) {
        const nav = window.tibetanTEIPendingNav;
        window.tibetanTEIPendingNav = null;
        const sel = el('selectPage');
        if (sel) sel.value = nav.n;
        renderPage(nav.n, nav.query);
    } else if (projectData.pages.length > 0) {
        renderPage(projectData.pages[0].n);
    }
}

/* =========================================================
   Seite rendern
   ========================================================= */

/**
 * Füllt einen Pane-Container mit Inhalt.
 * Wenn der Inhalt leer oder nur ein Kommentar ist,
 * wird "Wird noch bearbeitet" angezeigt.
 *
 * @param {HTMLElement} pane   Ziel-Pane
 * @param {string}      html   HTML-Inhalt
 * @param {string}      lang   Sprache für lang-Attribut (optional)
 */
function fillPane(pane, html, lang) {
    if (!pane) return;
    const trimmed = html ? html.trim() : '';
    if (!trimmed ||
        trimmed.match(/^<!--[^>]*-->$/) ||
        trimmed.match(/^<p[^>]*>\s*<!--[^>]*-->\s*<\/p>$/)) {
        pane.innerHTML =
            `<p class="pane-placeholder">⏳ Wird noch bearbeitet.</p>`;
    } else {
        pane.innerHTML = html;
    }
    if (lang) pane.setAttribute('lang', lang);

    /* Legende mit Toggle-Checkboxen unter Tibetisch-Pane — 2026-05-29 */
    if (lang === 'bo') {
        pane.insertAdjacentHTML('beforeend',
            '<div class="wtype-legende">' +
            '<label><input type="checkbox" class="wtype-cb-verb"' +
            (typeof wtypeVerbenAn !== 'undefined' && wtypeVerbenAn ? ' checked' : '') +
            '> <span class="verb-demo">བྱ་བ་</span> Verb</label>' +
            '<label><input type="checkbox" class="wtype-cb-part"' +
            (typeof wtypePartikelAn !== 'undefined' && wtypePartikelAn ? ' checked' : '') +
            '> <span class="part-demo">ཀྱི་</span> Partikel</label>' +
            '<label><input type="checkbox" class="wtype-cb-vok"' +
            (typeof wtypeVokAn !== 'undefined' && wtypeVokAn ? ' checked' : '') +
            '> <span class="vok-demo">ཆོས་</span> Vok.</label>' +
            '</div>');

        /* Event-Handler für neue Checkboxen */
        pane.querySelectorAll('.wtype-cb-verb').forEach(cb => {
            cb.addEventListener('change', () => {
                wtypeVerbenAn = cb.checked;
                wtypeAktualisieren();
            });
        });
        pane.querySelectorAll('.wtype-cb-part').forEach(cb => {
            cb.addEventListener('change', () => {
                wtypePartikelAn = cb.checked;
                wtypeAktualisieren();
            });
        });
        pane.querySelectorAll('.wtype-cb-vok').forEach(cb => {
            cb.addEventListener('change', () => {
                wtypeVokAn = cb.checked;
                wtypeAktualisieren();
            });
        });

        /* Initiale Markierung setzen */
        if (typeof wtypeAktualisieren === 'function') wtypeAktualisieren();
    }
}

/**
 * Rendert den Inhalt einer Seite in alle Panes beider Spalten.
 *
 * @param {string} pageNum  Seitenkennzeichen (z. B. "1a", "1b")
 * @param {string} [query]  Optionaler Suchbegriff zur Hervorhebung
 */
function renderPage(pageNum, query = "") {
    const page = projectData.pages.find(p => p.n === pageNum.toString());
    if (!page) return;

    /* --- Faksimile ---
     * src des <img>-Elements setzen; Hinweistext für Zoom ergänzen.
     */
    [left.facsimile, right.facsimile].forEach(div => {
        if (!div) return;
        div.style.height = '';   /* Inline-Style zurücksetzen */
        div.style.backgroundColor = '';
        let img = div.querySelector("img");
        if (!img) {
            img = document.createElement("img");
            img.alt = `Faksimile Seite ${pageNum}`;
            div.appendChild(img);
        }
        img.src = page.facsimile;
        console.log("TibetanTEI facs:", page.facsimile, "→ img.src:", img.src);
        img.style.width  = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';

        /* Hinweistext — nur einmal einfügen */
        if (!div.querySelector(".facsimile-hint")) {
            const hint = document.createElement("p");
            hint.className   = "facsimile-hint";
            hint.textContent = "Scrollrad zum Zoomen · Maustaste halten zum Verschieben · Doppelklick zum Zurücksetzen";
            div.appendChild(hint);
        }
    });

    /* --- Texte (Tibetisch, Deutsch, Englisch, Wylie) --- */
    const langToPane = {
        "de":      "german",
        "en":      "english",
        "bo":      "tibetan",
        "bo-Latn": "wylie",
        "wylie":   "wylie",
        "sa-Latn": "sanskrit"
    };

    /* Alle Text-Panes zuerst mit Platzhalter füllen und data-filled zurücksetzen */
    ['german', 'tibetan', 'wylie', 'english', 'sanskrit'].forEach(paneName => {
        ['left', 'right'].forEach(side => {
            const col = side === 'left' ? left : right;
            const pane = col[paneName];
            if (!pane) return;
            const lang = paneName === 'tibetan' ? 'bo' : paneName === 'wylie' ? 'bo-Latn' : paneName === 'sanskrit' ? 'sa-Latn' : paneName === 'english' ? 'en' : 'de';
            fillPane(pane, '', lang);
            delete pane.dataset.filled;
        });
    });

    page.translations.forEach(tr => {
        /* Zeilenumbrüche: <lb .../> → <br /> */
        const formatted = tr.text.replace(/<lb\s[^>]*\/>/gi, "<br />");

        /* Für bo-Latn: führende Unterstriche entfernen (pyewts-Artefakt) — 2026-05-22
         * NACH Tag-Entfernung anwenden damit _gnyen nach <br/> auch erfasst wird */
        const formattedClean = formatted;

        /* TEI <s>-Tags → <span> damit HTML-<s> das OpenType-Shaping
         * des Tibetan-Fonts nicht unterbricht — 2026-05-19
         * Einfachste Lösung: öffnende und schließende Tags direkt ersetzen */
        const formatted2 = formattedClean
            /* <s ... xml:id="X" ... corresp="Y" ...> → <span class="tei-s" data-sid="X" data-corresp="Y"> */
            .replace(/<s\b[^>]*\bxml:id="([^"]+)"[^>]*\bcorresp="([^"]+)"[^>]*>/g,
                (_, id, corresp) => `<span class="tei-s" data-sid="${id}" data-corresp="${corresp}">`)
            .replace(/<s\b[^>]*\bcorresp="([^"]+)"[^>]*\bxml:id="([^"]+)"[^>]*>/g,
                (_, corresp, id) => `<span class="tei-s" data-sid="${id}" data-corresp="${corresp}">`)
            /* <s ... xml:id="X" ...> ohne corresp → <span class="tei-s" data-sid="X"> */
            .replace(/<s\b[^>]*\bxml:id="([^"]+)"[^>]*>/g,
                (_, id) => `<span class="tei-s" data-sid="${id}">`)
            /* verbleibende <s...> → <span class="tei-s"> */
            .replace(/<s\b[^>]*>/g, '<span class="tei-s">')
            /* </s> → </span> */
            .replace(/<\/s>/g, '</span>')
            /* <persName corresp="#id"> → <span class="tei-pers" data-pid="id"> — 2026-05-29 */
            .replace(/<persName\b[^>]*\bcorresp="#([^"]+)"[^>]*>/g,
                (_, pid) => `<span class="tei-pers" data-pid="${pid}">`)
            .replace(/<\/persName>/g, '</span>')
            /* <placeName corresp="#id"> → <span class="tei-place" data-pid="id"> — 2026-05-29 */
            .replace(/<placeName\b[^>]*\bcorresp="#([^"]+)"[^>]*>/g,
                (_, pid) => `<span class="tei-place" data-pid="${pid}">`)
            .replace(/<\/placeName>/g, '</span>');
        /* Für tibetischen Text: <w>-Tags verarbeiten — 2026-05-22
         * Reihenfolge: 1. <w xml:id="X" ana="#Y"> → <span data-wid="X" data-ana="Y">
         *              2. verbleibende <w> ohne xml:id entfernen
         *              3. </w> → </span> */
        const formatted3 = (tr.lang === 'bo')
            ? formatted2
                /* <w xml:id="X" type="Y" ana="#Z" ...> → <span data-wid data-type data-ana>
                   data-type für visuelle Markierung von Verben/Partikeln — 2026-05-29 */
                .replace(/<w\b[^>]*\bxml:id="([^"]+)"[^>]*>/g, (tag, wid) => {
                    const anaMatch  = tag.match(/\bana="#([^"]+)"/);
                    const typeMatch = tag.match(/\btype="([^"]+)"/);
                    const ana  = anaMatch  ? ` data-ana="${anaMatch[1]}"` : '';
                    const typ  = typeMatch ? ` data-type="${typeMatch[1]}"` : '';
                    return `<span data-wid="${wid}"${ana}${typ}>`;
                })
                /* </w> → </span> */
                .replace(/<\/w>/g, '</span>')
                /* verbleibende <w> ohne xml:id entfernen */
                .replace(/<w\b[^>]*>/g, '')
                .replace(/<pc\b[^>]*>/g, '')
                .replace(/<\/pc>/g, '')
                .replace(/<cl\b[^>]*>/g, '')
                .replace(/<\/cl>/g, '')
                .replace(/<phr\b[^>]*>/g, '')
                .replace(/<\/phr>/g, '')
            : formatted2;
        /* formatted4: bo-Latn bekommt dieselbe data-wid-Konvertierung wie bo — 2026-05-22 */
        const formatted4 = (tr.lang === 'bo')
            ? formatted3
            : (tr.lang === 'bo-Latn')
            ? formatted3
                .replace(/<w\b[^>]*\bxml:id="([^"]+)"[^>]*>/g, (tag, wid) => {
                    const anaMatch = tag.match(/\bana="#([^"]+)"/);
                    const ana = anaMatch ? ` data-ana="${anaMatch[1]}"` : '';
                    return `<span data-wid="${wid}"${ana}>`;
                })
                .replace(/<\/w>/g, '</span>')
                .replace(/<w\b[^>]*>/g, '')
                .replace(/<pc\b[^>]*>/g, '')
                .replace(/<\/pc>/g, '')
                .replace(/<cl\b[^>]*>/g, '')
                .replace(/<\/cl>/g, '')
                .replace(/<phr\b[^>]*>/g, '')
                .replace(/<\/phr>/g, '')
            : formatted3.replace(
                /<w\b[^>]*\bxml:id="([^"]+)"[^>]*>/g,
                (tag, wid) => tag.replace('>', ` data-wid="${wid}">`)
            );
        /* bo-Latn: führende Unterstriche entfernen nach Tag-Bereinigung — 2026-05-22
         * pyewts fügt _ vor Silben ein die im Tibetischen keinen Anfangskonsonanten haben
         * Regex nach Tag-Entfernung damit auch _gnyen nach <br/> erfasst wird */
        const formatted5 = (tr.lang === 'bo-Latn')
            ? formatted4.replace(/_(?=[a-zA-Z'"])/g, '')
            : formatted4;
        const html = (tr.lang === 'bo-Latn')
            ? applyHighlightEx(formatted5, query, true)
            : applyHighlight(formatted5, query);
        const paneName  = langToPane[tr.lang];
        if (!paneName) return;
        /* Mehrere <p> derselben Sprache: anhängen statt überschreiben — 2026-05-22 */
        [left, right].forEach(col => {
            const pane = col[paneName];
            if (!pane) return;
            if (pane.dataset.filled === 'true') {
                pane.innerHTML += html;
            } else {
                fillPane(pane, html, tr.lang);
                pane.dataset.filled = 'true';
            }
        });
    });

    /* --- XML-Rohtext --- */
    const xmlEscaped = escapeXml(page.xmlRaw);
    /* Tibetische Suchbegriffe nicht im XML hervorheben da Text auf
       <w>-Tags verteilt ist und nicht zusammenhängend gefunden wird.
       Stattdessen: persName/placeName mit corresp="#id" hervorheben — 2026-05-17 */
    /* Tibetisch im XML-Pane: applyHighlightEx mit crossLine=true — 2026-05-29 */
    let xmlQuery = query || "";
    if (xmlQuery && /[\u0F00-\u0FFF]/.test(xmlQuery)) {
        xmlQuery = xmlQuery.replace(/་+$/, ''); /* Tseg am Ende entfernen */
    }
    let xmlHighlighted = applyHighlightEx(xmlEscaped, xmlQuery, true);

    /* corresp-Highlight im XML-Pane deaktiviert — wird vom Register-Highlight
       in jumpToPage übernommen — 2026-05-28 */
    const xmlHtml = `<div class="xml-content-wrapper">${xmlHighlighted}</div>`;

    [left.xml, right.xml].forEach(div => {
        if (!div) return;
        div.innerHTML = xmlHtml;

        /* Erstes Suchergebnis sichtbar scrollen */
        if (query) {
            setTimeout(() => {
                const mark = div.querySelector(".search-highlight");
                if (mark) mark.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 150);
        }
    });

    updateRegisters(page);
    attachInteractivity();
    attachParallelText(page);
}

/**
 * Macht tibetische <s corresp="...">-Elemente anklickbar.
 * Ein Klick zeigt den deutschen/englischen Parallelsatz in einem
 * dezenten Panel unter dem Satz. — 2026-05-19
 *
 * @param {Object} page  Seitenobjekt aus projectData.pages
 */
function attachParallelText(page) {
    /* Für alle Tibetan-Panes in beiden Spalten */
    document.querySelectorAll('.pane[lang="bo"]').forEach(pane => {
        pane.querySelectorAll('span.tei-s[data-corresp]').forEach(sEl => {
            const sId    = sEl.dataset.sid     || '';
            const corrId = sEl.dataset.corresp || '';
            if (!corrId) return;

            sEl.style.cursor = 'pointer';
            sEl.title        = corrId.replace(/#/g, '').replace(/\s+/g, ', ');

            sEl.addEventListener('click', function (e) {
                e.stopPropagation();

                /* Vorheriges Tooltip entfernen */
                document.querySelectorAll('.parallel-tooltip').forEach(t => t.remove());
                /* Vorherige Hervorhebung entfernen */
                document.querySelectorAll('span.tei-s.parallel-active').forEach(s => {
                    s.classList.remove('parallel-active');
                });

                /* Diesen Satz hervorheben */
                sEl.classList.add('parallel-active');

                /* Ziel-IDs aus @corresp (#s65a01_de #s65a01_en) */
                const targets = corrId.trim().split(/\s+/)
                    .map(t => t.replace(/^#/, ''));

                /* Paralleltexte aus page.translations sammeln */
                const lines = [];
                targets.forEach(tid => {
                    /* Sprache aus Suffix ermitteln: _de → de, _en → en */
                    const langMatch = tid.match(/_([a-z]{2})$/);
                    const lang      = langMatch ? langMatch[1] : '';
                    const langLabel = { de: 'Deutsch', en: 'English', fr: 'Français' }[lang] || lang;

                    /* In allen Übersetzungs-<p> nach der <s xml:id="tid"> suchen */
                    page.translations.forEach(tr => {
                        if (tr.lang !== lang) return;
                        /* Im HTML-String nach der ID suchen */
                        const idRegex = new RegExp(`<s[^>]*\\bxml:id=["']${tid}["'][^>]*>(.*?)</s>`, 's');
                        const m = tr.text.match(idRegex);
                        if (m) {
                            const text = m[1].replace(/<[^>]+>/g, '').trim();
                            if (text) lines.push({ label: langLabel, text });
                        }
                    });
                });

                if (lines.length === 0) return;

                /* Tooltip erstellen */
                const tooltip = document.createElement('div');
                tooltip.className = 'parallel-tooltip';
                tooltip.innerHTML = lines.map(l =>
                    `<span class="parallel-lang">${l.label}:</span> ${escapeHtml(l.text)}`
                ).join('<br>');

                /* Nach dem <s>-Element einfügen */
                sEl.insertAdjacentElement('afterend', tooltip);
            });
        });

        /* Klick außerhalb entfernt Tooltip */
        pane.addEventListener('click', function () {
            document.querySelectorAll('.parallel-tooltip').forEach(t => t.remove());
            document.querySelectorAll('span.tei-s.parallel-active').forEach(s => {
                s.classList.remove('parallel-active');
            });
        });
    });
}

/**
 * Escapes HTML special characters for safe insertion.
 */
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* =========================================================
   Suche
   ========================================================= */

/**
 * Initialisiert die Suche: Bindet Ereignishandler an Eingabefeld,
 * Lösch-Button und Suchergebnis-Liste.
 *
 * KORREKTUR: Der Lösch-Button hat in detail.html id="searchClear" (nicht
 * die Klasse .search-clear), daher wird hier mit #searchClear selektiert.
 */
/* ══════════════════════════════════════════════════════════════════════════
   SUCHE ÜBER ALLE TEXTZEUGEN — 2026-05-30
   Cache: { textId: { pages: [{n, xmlRaw}] } }
   ══════════════════════════════════════════════════════════════════════════ */

/* Cache für geladene Textzeugen-Seiten */
window.tibetanTEIAllTextsCache = {};

/* ── Dauerhaftes Ergebnispanel für Alle-Textzeugen-Suche — 2026-05-30 ── */
function alleErgebnisPanel_erstellen() {
    if (document.getElementById('alleErgebnisPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'alleErgebnisPanel';
    panel.innerHTML =
        '<div class="ae-header">' +
        '<span id="ae-titel">Suchergebnisse</span>' +
        '<button onclick="alleErgebnisPanel_schliessen()" title="Schließen">✕</button>' +
        '</div>' +
        '<div id="ae-liste"></div>';
    document.body.appendChild(panel);
}

function alleErgebnisPanel_aktualisieren(matches, aktIdx) {
    alleErgebnisPanel_erstellen();
    const panel  = document.getElementById('alleErgebnisPanel');
    const titel  = document.getElementById('ae-titel');
    const liste  = document.getElementById('ae-liste');
    if (!panel || !liste) return;

    if (titel) titel.textContent =
        `${matches.length} Ergebnis${matches.length !== 1 ? 'se' : ''} in allen Textzeugen`;

    liste.innerHTML = matches.map((m, idx) => {
        const isTib = /[\u0F00-\u0FFF]/.test(m.snippet);
        return `<div class="ae-item${idx === aktIdx ? ' ae-aktiv' : ''}"
            onclick="alleErgebnisPanel_navigiere(${idx})"
            id="ae-item-${idx}">
            <span class="ae-textname">${escapeXml(m.textName)}</span>
            <span class="ae-seite">S. ${escapeXml(m.n)}</span>
            <span class="ae-snippet ${isTib ? 'u-chen-search' : ''}">${m.snippet}</span>
        </div>`;
    }).join('');

    panel.style.display = 'block';

    /* Aktiven Eintrag ins Sichtfeld scrollen */
    const aktItem = document.getElementById('ae-item-' + aktIdx);
    if (aktItem) aktItem.scrollIntoView({ block: 'nearest' });
}

window.alleErgebnisPanel_navigiere = function(idx) {
    if (idx < 0 || idx >= searchMatches.length) return;
    currentMatchIndex = idx;
    alleErgebnisPanel_aktualisieren(searchMatches, idx);
    const m     = searchMatches[idx];
    const aktId = currentEntry?.id || texts[0]?.id;
    if (m.entry && m.entry.id !== aktId) {
        window.tibetanTEIPendingNav = { n: m.n, query: m.query };
        const selTxt = el('selectText');
        if (selTxt) {
            selTxt.value = m.entry.id;
            selTxt.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            loadText(m.entry.id);
        }
    } else {
        const sel = el('selectPage');
        if (sel) sel.value = m.n;
        renderPage(m.n, m.query);
    }
    updateMatchDisplay();
};

function alleErgebnisPanel_schliessen() {
    const panel = document.getElementById('alleErgebnisPanel');
    if (panel) panel.style.display = 'none';
    /* Wie × Button: zurück zum Ursprung */
    const orig = window.tibetanTEIOriginalEntry;
    window.tibetanTEIOriginalEntry = null;
    searchMatches     = [];
    currentMatchIndex = -1;
    updateMatchDisplay();
    const input = el('searchInput');
    if (input) input.value = '';
    const ctrl = el('searchControls');
    if (ctrl) ctrl.style.display = 'none';
    if (orig && orig.id !== currentEntry?.id) {
        loadText(orig.id);
    } else {
        renderPage(el('selectPage')?.value || '', '');
    }
}

/* Seiten aus XML extrahieren (vereinfacht) */
function extractPagesForSearch(xmlText) {
    const TEI_NS2 = 'http://www.tei-c.org/ns/1.0';
    const parser  = new DOMParser();
    const xmlDoc  = parser.parseFromString(xmlText, 'application/xml');
    const bodyArr = xmlDoc.getElementsByTagNameNS(TEI_NS2, 'body');
    const bodyEl  = bodyArr.length > 0 ? bodyArr[0] : xmlDoc.querySelector('body');
    if (!bodyEl) return [];

    const pages = [];
    Array.from(bodyEl.children).forEach(div => {
        if (div.localName !== 'div') return;
        const pbs = div.getElementsByTagNameNS(TEI_NS2, 'pb');
        const pb  = pbs.length > 0 ? pbs[0] : null;
        if (!pb || !pb.getAttribute('n')) return;
        pages.push({
            n:      (pb.getAttribute('n') || '').trim(),
            xmlRaw: xmlInnerHTML(div)
        });
    });
    return pages;
}

/* Textzeuge für Suche laden (mit Cache) */
async function ladeTextzeugeForSearch(entry) {
    if (window.tibetanTEIAllTextsCache[entry.id]) {
        return window.tibetanTEIAllTextsCache[entry.id].pages;
    }
    try {
        const r = await fetch(entry.url);
        if (!r.ok) return [];
        const txt   = await r.text();
        const pages = extractPagesForSearch(txt);
        window.tibetanTEIAllTextsCache[entry.id] = { pages, entry };
        return pages;
    } catch(e) {
        console.warn('TibetanTEI: Konnte nicht laden:', entry.url, e);
        return [];
    }
}

/* Suche über eine Seite */
function suchteInPage(p, q) {
    const isTibetan = /[\u0F00-\u0FFF]/.test(q);
    const searchIn  = p.xmlRaw.replace(/<[^>]+>/g, '');
    const qLower    = q.toLowerCase();
    try {
        if (isTibetan) {
            const qEsc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/་+$/, '');
            return new RegExp(qEsc, 'g').test(searchIn);
        } else {
            const qEsc = qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
            return new RegExp(qEsc, 'gi').test(searchIn.toLowerCase());
        }
    } catch(e) {
        return searchIn.toLowerCase().includes(qLower);
    }
}

/* Alle Textzeugen durchsuchen */
async function sucheAlleTextzeugen(q, resultsEl, ladestatus) {
    if (ladestatus) ladestatus.style.display = 'inline';
    const alleMatches = [];

    /* Aktuellen Textzeugen aus projectData.pages (bereits im RAM) */
    const aktEntry = (typeof currentEntry !== 'undefined' && currentEntry)
                   || texts.find(t => t.id === el('selectText')?.value)
                   || texts[0];

    for (const entry of texts) {
        let pages;
        if (entry.id === aktEntry.id) {
            /* Aktueller Textzeuge — projectData.pages direkt verwenden */
            pages = projectData.pages;
        } else {
            pages = await ladeTextzeugeForSearch(entry);
        }

        pages.forEach(p => {
            if (suchteInPage(p, q)) {
                alleMatches.push({
                    n:        p.n,
                    query:    q,
                    snippet:  getSnippet(p.xmlRaw.replace(/<[^>]+>/g, ''), q),
                    textId:   entry.id,
                    textName: entry.name,
                    entry:    entry
                });
            }
        });
    }

    if (ladestatus) ladestatus.style.display = 'none';
    return alleMatches;
}

/* Checkbox „Alle Textzeugen" injizieren */
(function() {
    /* Wird aufgerufen sobald DOM ready */
    const injectCheckbox = () => {
        if (document.getElementById('cbAlleTextzeugen')) return;
        const input = document.getElementById('searchInput');
        if (!input) return;

        const wrapper = input.closest('div, form, header') || input.parentElement;
        const cb = document.createElement('label');
        cb.id    = 'lbl-alle-textzeugen';
        cb.style.cssText = [
            'display:inline-flex', 'align-items:center', 'gap:4px',
            'font-size:0.78rem', 'color:#555', 'cursor:pointer',
            'white-space:nowrap', 'margin-left:8px'
        ].join(';');
        cb.innerHTML =
            '<input type="checkbox" id="cbAlleTextzeugen" style="cursor:pointer;accent-color:#5a3e2b">' +
            '<span>Alle Textzeugen</span>' +
            '<span id="alleTextzeugenLaden" style="display:none;margin-left:4px;font-size:0.7rem;color:#888">⏳</span>';

        /* Checkbox nach dem Input einfügen */
        input.insertAdjacentElement('afterend', cb);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCheckbox);
    } else {
        injectCheckbox();
        setTimeout(injectCheckbox, 500); /* Fallback */
    }
})();

/* pendingNavigation: nach Text-Switch zu Seite springen */
window.tibetanTEIPendingNav = null;

function setupSearch() {
    const input   = el("searchInput");
    const results = el("searchResults");
    const clear   = el("searchClear");       /* KORREKTUR: ID statt Klasse */
    const ctrl    = el("searchControls");

    if (!input) return;

    ['input', 'change', 'keyup'].forEach(evtName => {
    input.addEventListener(evtName, function () {
        const q = input.value.trim();

        if (q.length < 1) {
            if (results) results.style.display = "none";
            if (ctrl)    ctrl.style.display    = "none";
            renderPage(el("selectPage").value, "");
            return;
        }

        if (ctrl) ctrl.style.display = "flex";

        if (q.length < 2) {
            if (results) results.style.display = "none";
            updateMatchDisplay();
            return;
        }

        /* Checkbox: Alle Textzeugen? — 2026-05-30 */
        const cbAlle  = document.getElementById('cbAlleTextzeugen');
        const alleAn  = cbAlle && cbAlle.checked;
        const laden   = document.getElementById('alleTextzeugenLaden');

        if (alleAn) {
            /* ── Suche über alle Textzeugen (async) ── */
            /* Ursprungs-Textzeugen merken (für Rückkehr via ×/Escape) */
            if (!window.tibetanTEIOriginalEntry) {
                window.tibetanTEIOriginalEntry = currentEntry;
            }
            sucheAlleTextzeugen(q, results, laden).then(alleMatches => {
                searchMatches = alleMatches;

                if (searchMatches.length > 0) {
                    if (results) {
                        results.innerHTML = searchMatches.map((m, idx) => {
                            const isTib = /[\u0F00-\u0FFF]/.test(m.snippet);
                            const anderer = m.textId !== (currentEntry?.id || texts[0].id);
                            return `<div class="search-result" onclick="jumpToMatch(${idx})">
                                <strong style="color:${anderer ? '#5a3e2b' : '#333'}">
                                    ${escapeXml(m.textName)} · Seite ${escapeXml(m.n)}
                                </strong>:<br>
                                <span class="${isTib ? 'u-chen-search' : ''}">${m.snippet}</span>
                            </div>`;
                        }).join("");
                        results.style.display = "block";
                    }
                    currentMatchIndex = 0;
                    updateMatchDisplay();
                    /* Dauerhaftes Panel anzeigen — 2026-05-30 */
                    alleErgebnisPanel_aktualisieren(searchMatches, 0);
                    /* Erste Seite anzeigen ohne Dropdown zu schließen */
                    const m0 = searchMatches[0];
                    if (m0) {
                        const aktId0 = currentEntry?.id || texts[0]?.id;
                        if (m0.entry && m0.entry.id !== aktId0) {
                            window.tibetanTEIPendingNav = { n: m0.n, query: m0.query };
                            const selTxt = el('selectText');
                            if (selTxt) {
                                selTxt.value = m0.entry.id;
                                selTxt.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        } else {
                            const sel = el('selectPage');
                            if (sel) sel.value = m0.n;
                            renderPage(m0.n, m0.query);
                        }
                    }
                } else {
                    if (results) results.style.display = "none";
                    currentMatchIndex = -1;
                    updateMatchDisplay();
                }
            });
            return; /* async → vorzeitig zurück */
        }

        /* ── Suche nur im aktuellen Textzeugen (synchron, wie bisher) ── */
        searchMatches = [];
        const qLower    = q.toLowerCase();
        const isTibetan = /[\u0F00-\u0FFF]/.test(q);

        projectData.pages.forEach(p => {
            const searchIn = p.xmlRaw.replace(/<[^>]+>/g, '');
            let gefunden = false;
            if (isTibetan) {
                const qEsc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/་+$/, '');
                try { gefunden = new RegExp(qEsc, 'g').test(searchIn); }
                catch(e) { gefunden = searchIn.includes(q); }
            } else {
                const qEsc = qLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
                try { gefunden = new RegExp(qEsc, 'gi').test(searchIn.toLowerCase()); }
                catch(e) { gefunden = searchIn.toLowerCase().includes(qLower); }
            }
            if (gefunden) {
                searchMatches.push({
                    n: p.n, query: q,
                    snippet: getSnippet(searchIn, q),
                    textId: (currentEntry?.id || texts[0].id),
                    entry:  currentEntry || texts[0]
                });
            }
        });

        if (searchMatches.length > 0) {
            if (results) {
                results.innerHTML = searchMatches.map((m, idx) => {
                    const isTib = /[\u0F00-\u0FFF]/.test(m.snippet);
                    return `<div class="search-result" onclick="jumpToMatch(${idx})">
                        <strong>Seite ${escapeXml(m.n)}</strong>:
                        <span class="${isTib ? 'u-chen-search' : ''}">${m.snippet}</span>
                    </div>`;
                }).join("");
                results.style.display = "block";
            }
            currentMatchIndex = 0;
            updateMatchDisplay();
        } else {
            if (results) results.style.display = "none";
            searchMatches  = [];
            currentMatchIndex = -1;
            updateMatchDisplay();
        }

        renderPage(el("selectPage").value, q);
    });
    }); /* Ende forEach(['input','change','keyup']) */

    /* Lösch-Button × — kehrt zum Ursprungs-Textzeugen zurück — 2026-05-30 */
    if (clear) {
        clear.addEventListener("click", () => {
            input.value = "";
            if (results) results.style.display = "none";
            if (ctrl)    ctrl.style.display    = "none";
            searchMatches     = [];
            currentMatchIndex = -1;
            updateMatchDisplay();
            const orig3 = window.tibetanTEIOriginalEntry;
            window.tibetanTEIOriginalEntry = null;
            const panel3 = document.getElementById('alleErgebnisPanel');
            if (panel3) panel3.style.display = 'none';
            if (orig3 && orig3.id !== currentEntry?.id) {
                loadText(orig3.id);
            } else {
                renderPage(el("selectPage").value, "");
            }
        });
    }

    /* Escape-Taste: Suche schließen und zurück — 2026-05-30 */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (results && results.style.display !== "none") {
            results.style.display = "none";
            return;
        }
        if (input && input.value) {
            input.value = "";
            if (results) results.style.display = "none";
            if (ctrl)    ctrl.style.display    = "none";
            searchMatches     = [];
            currentMatchIndex = -1;
            updateMatchDisplay();
            const orig = window.tibetanTEIOriginalEntry;
            window.tibetanTEIOriginalEntry = null;
            if (orig && orig.id !== currentEntry?.id) {
                loadText(orig.id);
            } else {
                renderPage(el("selectPage").value, "");
            }
        }
    });

    /* Klick außerhalb des Suchfelds: Dropdown schließen — 2026-05-30 */
    document.addEventListener("click", (e) => {
        if (!results) return;
        const searchArea = input?.closest(".search-wrapper, .search-container, header, nav")
                        || input?.parentElement;
        if (searchArea && !searchArea.contains(e.target) &&
            !results.contains(e.target)) {
            results.style.display = "none";
        }
    });
}

/**
 * Springt zu einem bestimmten Suchergebnis.
 * Wird als globale Funktion exportiert, da sie direkt aus
 * onclick-Attributen in den Suchergebnis-Divs aufgerufen wird.
 *
 * @param {number} idx  Index in searchMatches
 */
window.jumpToMatch = function (idx) {
    if (idx < 0 || idx >= searchMatches.length) return;
    currentMatchIndex = idx;
    const m      = searchMatches[idx];
    const aktId  = currentEntry?.id || texts[0]?.id;

    /* Anderer Textzeuge → erst wechseln, dann Seite anzeigen */
    if (m.entry && m.entry.id !== aktId) {
        window.tibetanTEIPendingNav = { n: m.n, query: m.query };
        const selectText = el('selectText');
        if (selectText) {
            selectText.value = m.entry.id;
            selectText.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            /* Fallback: loadText direkt aufrufen */
            loadText(m.entry.id);
        }
        const results = el('searchResults');
        if (results) results.style.display = 'none';
        updateMatchDisplay();
        return;
    }

    /* Gleicher Textzeuge → normal navigieren */
    const select = el('selectPage');
    if (select) select.value = m.n;
    renderPage(m.n, m.query);
    /* Dropdown nach Klick auf Ergebnis schließen */
    const results2 = el('searchResults');
    if (results2) results2.style.display = 'none';
    updateMatchDisplay();
};

/**
 * Springt zum nächsten Suchergebnis (zyklisch).
 */
window.nextMatch = function () {
    if (searchMatches.length === 0) return;
    /* Panel-Navigation wenn Alle-Textzeugen-Suche aktiv */
    const panel = document.getElementById('alleErgebnisPanel');
    if (panel && panel.style.display !== 'none') {
        const idx = (currentMatchIndex + 1) % searchMatches.length;
        alleErgebnisPanel_navigiere(idx);
        return;
    }
    currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
    jumpToMatch(currentMatchIndex);
};

/**
 * Springt zum vorherigen Suchergebnis (zyklisch).
 */
window.prevMatch = function () {
    if (searchMatches.length === 0) return;
    const panel = document.getElementById('alleErgebnisPanel');
    if (panel && panel.style.display !== 'none') {
        const idx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        alleErgebnisPanel_navigiere(idx);
        return;
    }
    currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    jumpToMatch(currentMatchIndex);
};

/**
 * Aktualisiert die Anzeige „n/gesamt" neben den Navigationspfeilen.
 */
function updateMatchDisplay() {
    const info = el("matchInfo");
    if (info) {
        info.textContent = searchMatches.length > 0
            ? `${currentMatchIndex + 1}/${searchMatches.length}`
            : "0/0";
    }
}

/**
 * Hebt alle Vorkommen eines Suchbegriffs in einem HTML-String hervor.
 * Setzt die Klasse .search-highlight auf <mark>-Elemente.
 *
 * @param {string} html  Eingabe-HTML
 * @param {string} q     Suchbegriff
 * @returns {string}     HTML mit <mark>-Tags
 */
function applyHighlightEx(html, q, crossLine) {
    if (!q || q.length < 2) return html;
    const isTibetan = /[\u0F00-\u0FFF]/.test(q);

    if (isTibetan) {
        /* Tibetisch: Suchbegriff kann über <w>-Tag-Grenzen und Zeilenumbrüche
         * verteilt sein. Strategie:
         * 1. Direkter Match (Text steht zusammenhängend)
         * 2. Silben-basierter Match: nach Tseg (་) aufteilen,
         *    zwischen Silben Tags/Whitespace erlauben — 2026-05-29 */
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        /* 1. Direkter Match */
        const directRegex = new RegExp(`(${escaped})`, 'g');
        if (directRegex.test(html)) {
            return html.replace(directRegex,
                `<mark class="search-highlight">$1</mark>`);
        }

        /* 2. Silben-basierter Match: nach Tseg aufteilen
         * Tseg U+0F0B als Trennzeichen, Tags/Whitespace zwischen Silben erlaubt */
        const ZWISCHEN = '(?:(?:<[^>]+>|\\s)*)';
        const silben = escaped.split('་');  /* Tseg als Trennzeichen */
        if (silben.length > 1) {
            const flexPattern = silben
                .filter(s => s.length > 0)
                .map(s => s + '་')          /* Tseg wieder anhängen */
                .join(ZWISCHEN);
            try {
                const flexRegex = new RegExp(flexPattern, 'g');
                if (flexRegex.test(html)) {
                    return html.replace(new RegExp(flexPattern, 'g'),
                        `<mark class="search-highlight">$&</mark>`);
                }
            } catch(e) { /* ungültige Regex → weiter */ }
        }

        /* 3. Letzter Fallback: ohne Tseg suchen */
        const ohneKeine = escaped.replace(/་/g, '');
        try {
            return html.replace(new RegExp(`(${ohneKeine})`, 'g'),
                `<mark class="search-highlight">$1</mark>`);
        } catch(e) { return html; }
    }

    /* Lateinisch/Wylie: Leerzeichen matchen auch Zeilenumbrüche — 2026-05-29 */
    const escaped = q
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/"/g, '(&quot;|")');
    /* Immer Leerzeichen → \s+ damit Zeilenumbrüche gefunden werden */
    const pattern = escaped.replace(/ /g, '\\s+');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return html.replace(regex, `<mark class="search-highlight">$1</mark>`);
}

function applyHighlight(html, q) {
    return applyHighlightEx(html, q, false);
}

/* =========================================================
   Register
   ========================================================= */

/**
 * Füllt die Personen- und Orts-Register-Panes in beiden Spalten.
 *
 * Jeder Eintrag zeigt:
 *   • Name (anklickbar → externe URL wenn vorhanden)
 *   • Häufigkeit (Anzahl der Seiten auf denen die Entität vorkommt)
 *   • Seitenlinks (jede Seite anklickbar → springt zur Seite)
 *
 * Einträge ohne Vorkommen im Text werden ans Ende sortiert
 * und grau dargestellt.
 */
function updateRegisters(page) {

    /**
     * Baut einen einzelnen Registereintrag als HTML-String.
     *
     * @param {RegisterEntry} item
     * @param {string}        type  "person" | "place"
     * @returns {string}
     */
    function buildEntry(item, type) {
        const pages  = projectData.occurrences[item.id] || [];
        const count  = pages.length;
        const color  = type === "person" ? "var(--color-person)" : "var(--color-place)";

        /* Name: anklickbar wenn URL vorhanden */
        const hasUrl  = item.url && isValidUrl(item.url);
        const nameHtml = hasUrl
            ? `<a class="reg-name reg-link" href="${escapeXml(item.url)}"
                  target="_blank" rel="noopener"
                  title="${escapeXml(item.url)}"
                  style="color:${color}">${escapeXml(item.name)}</a>`
            : `<span class="reg-name" style="color:${color}"
                     title="Kein Nachweis verfügbar">${escapeXml(item.name)}</span>`;

        /* Häufigkeitsanzeige */
        const countHtml = count > 0
            ? `<span class="reg-count">${count}&times;</span>`
            : `<span class="reg-count reg-absent">—</span>`;

        /* Seitenlinks */
        const pageLinks = pages.length > 0
            ? `<span class="reg-pages">${
                pages.map(p =>
                    `<button class="reg-page-btn" 
                             onclick="event.stopPropagation(); jumpToPage('${escapeXml(p)}', '${escapeXml(item.id)}', '${escapeXml(item.name)}', '${escapeXml((item.wylie || '').replace(/'/g, "\\'"))}')"
                             title="Gehe zu Seite ${escapeXml(p)}">${escapeXml(p)}</button>`
                ).join("")
              }</span>`
            : "";

        /* Wylie-Transliteration (aus xml:id oder <persName xml:lang="wylie">) */
        const wylieHtml = item.wylie
            ? `<div class="reg-wylie">${escapeXml(item.wylie)}</div>`
            : "";

        return `<li class="reg-entry${count === 0 ? " reg-entry--absent" : ""}"
                    data-id="${escapeXml(item.id)}">
                    <div class="reg-row">
                        ${nameHtml}
                        ${countHtml}
                    </div>
                    ${wylieHtml}
                    ${pageLinks}
                </li>`;
    }

    /**
     * Sortiert Einträge: primär alphabetisch aufsteigend nach Wylie-Transliteration,
     * sekundär nach Häufigkeit absteigend.
     */
    function sortEntries(items) {
        return [...items].sort((a, b) => {
            const wa = (a.wylie || a.name).toLowerCase();
            const wb = (b.wylie || b.name).toLowerCase();
            if (wa !== wb) return wa.localeCompare(wb);
            /* Bei gleichem Namen: häufigere zuerst */
            const ca = (projectData.occurrences[a.id] || []).length;
            const cb = (projectData.occurrences[b.id] || []).length;
            return cb - ca;
        });
    }

    const buildList = (items, type) => {
        if (items.length === 0) {
            return `<p class="reg-empty">Kein Eintrag vorhanden.</p>`;
        }
        const sorted = sortEntries(items);
        return `<ul class="reg-list">${sorted.map(i => buildEntry(i, type)).join("")}</ul>`;
    };

    [left, right].forEach(col => {
        if (col.persons) col.persons.innerHTML = buildList(projectData.listPerson, "person");
        if (col.places)  col.places.innerHTML  = buildList(projectData.listPlaces, "place");
        if (col.roles)   col.roles.innerHTML   = buildRoleList();
        if (col.vocab)   col.vocab.innerHTML   = buildVocabList(page);
    });

    /* Highlight wird ausschliesslich von jumpToPage gesteuert — 2026-05-28 */
    pendingHighlightId = null;
}

/**
 * Baut die Vokabelliste für eine Seite. — 2026-05-21
 */
function buildVocabList(page) {
    if (!page || !projectData.vocab || projectData.vocab.length === 0) {
        return '<p class="pane-placeholder">⏳ Kein Vokabelregister für diesen Text.</p>';
    }

    /* Sammle alle @ana-Referenzen auf dieser Seite */
    const anaRefs = new Map();
    const anaRegex = /xml:id="([^"]+)"[^>]*ana="#([^"]+)"/g;
    let m;
    while ((m = anaRegex.exec(page.xmlRaw)) !== null) {
        const wId = m[1], lexId = m[2];
        if (!anaRefs.has(lexId)) anaRefs.set(lexId, []);
        anaRefs.get(lexId).push(wId);
    }

    if (anaRefs.size === 0) {
        return '<p class="pane-placeholder">⏳ Keine Vokabeleinträge auf dieser Seite.</p>';
    }

    const rows = [];
    anaRefs.forEach((wIds, lexId) => {
        const interp = projectData.vocab.find(v => v.id === lexId);
        if (!interp) return;

        const links = wIds.map(wId =>
            `<button class="reg-page-btn word-ref-btn"
                     onclick="highlightWord('${escapeXml(wId)}', this)"
                     title="${escapeXml(wId)}">[→]</button>`
        ).join(' ');

        rows.push(`<tr data-lexid="${escapeXml(lexId)}">
            <td class="vocab-uchen" lang="bo">${escapeXml(interp.lemmaUchen)}</td>
            <td class="vocab-wylie">${escapeXml(interp.lemmaWylie)} ${links}</td>
            <td class="vocab-de">${escapeXml(interp.defDe)}</td>
            <td class="vocab-en">${escapeXml(interp.defEn)}</td>
        </tr>`);
    });

    if (rows.length === 0) {
        return '<p class="pane-placeholder">⏳ Keine Vokabeleinträge auf dieser Seite.</p>';
    }

    return `<table class="vocab-table">
        <thead><tr>
            <th lang="bo">དབུ་ཅན་</th>
            <th>Wylie</th>
            <th>Deutsch</th>
            <th>English</th>
        </tr></thead>
        <tbody>${rows.join('')}</tbody>
    </table>`;
}

/**
 * Hebt ein <w>-Element im tibetischen Text hervor. — 2026-05-21
 */
window.highlightWord = function(wId, sourceBtn) {
    /* Alte Hervorhebungen entfernen */
    document.querySelectorAll('.word-highlight').forEach(el => {
        el.classList.remove('word-highlight');
    });

    /* Quell-Spalte ermitteln */
    const sourceColumn = sourceBtn ? sourceBtn.closest('.column') : null;

    /* Alle Elemente mit dieser wId finden (Tibetan + Wylie) */
    const targets = document.querySelectorAll(`[data-wid="${wId}"]`);
    if (!targets.length) return;

    targets.forEach(target => {
        const column = target.closest('.column');
        if (!column) return;

        /* Tab nicht wechseln in der Quell-Spalte — 2026-05-22 */
        if (sourceColumn && column === sourceColumn) return;

        const pane   = target.closest('.pane');
        const paneId = pane ? pane.id : null;

        /* Tab nur aktivieren wenn Pane nicht bereits aktiv */
        if (pane && !pane.classList.contains('active')) {
            const tabsGroup      = column.querySelector('.tabs');
            const panesContainer = tabsGroup ? tabsGroup.nextElementSibling : null;
            if (tabsGroup && panesContainer) {
                tabsGroup.querySelectorAll('.tab-button').forEach(b => {
                    b.classList.toggle('active', b.dataset.id === paneId);
                    b.setAttribute('aria-selected', b.dataset.id === paneId ? 'true' : 'false');
                });
                panesContainer.querySelectorAll('.pane').forEach(p => {
                    p.classList.toggle('active', p.id === paneId);
                });
            }
        }

        requestAnimationFrame(() => {
            target.classList.add('word-highlight');
            if (column) {
                const rect    = target.getBoundingClientRect();
                const colRect = column.getBoundingClientRect();
                column.scrollTo({ top: rect.top - colRect.top + column.scrollTop - 80, behavior: 'smooth' });
            }
        });
    });
};

/**
 * Baut das Rollenregister als HTML-String auf.
 * Gruppiert Personen nach ihrer Rolle, sortiert Rollen alphabetisch.
 *
 * @returns {string}
 */
function buildRoleList() {
    const roles = Object.keys(projectData.listRoles).sort((a, b) => {
        /* "unbekannt" immer ans Ende */
        if (a === "unbekannt") return 1;
        if (b === "unbekannt") return -1;
        return a.localeCompare(b, "de");
    });

    if (roles.length === 0) {
        return `<p class="reg-empty">Keine Rollen vorhanden.</p>`;
    }

    return roles.map(role => {
        const persons = projectData.listRoles[role];

        const personItems = persons.map(p => {
            const hasUrl = isValidUrl(p.url);
            const nameHtml = hasUrl
                ? `<a class="role-person-name reg-link" href="${escapeXml(p.url)}"
                      target="_blank" rel="noopener"
                      style="color:var(--color-person)"
                      title="${escapeXml(p.url)}">${escapeXml(p.name)}</a>`
                : `<span class="role-person-name"
                         style="color:var(--color-person)"
                         title="Kein Nachweis verfügbar">${escapeXml(p.name)}</span>`;

            const wylieHtml = p.wylie
                ? `<span class="reg-wylie">${escapeXml(p.wylie)}</span>`
                : "";

            /* Seitenlinks — aus occurrences */
            const pages = projectData.occurrences[p.id] || [];
            const pageLinks = pages.length > 0
                ? `<span class="reg-pages">${
                    pages.map(pg =>
                        `<button class="reg-page-btn" 
                                 onclick="event.stopPropagation(); jumpToPage('${escapeXml(pg)}', '${escapeXml(p.id)}', '${escapeXml(p.name)}', '${escapeXml((p.wylie || '').replace(/'/g, "\\'"))}')"
                                 title="Gehe zu Seite ${escapeXml(pg)}">${escapeXml(pg)}</button>`
                    ).join("")
                  }</span>`
                : "";

            return `<li class="role-person-item" data-id="${escapeXml(p.id)}">${nameHtml}${wylieHtml}${pageLinks}</li>`;
        }).join("");

        const isUnknown = role === "unbekannt";
        const count     = persons.length;

        return `<details class="role-group${isUnknown ? ' role-group--unknown' : ''}"${isUnknown ? '' : ' open'}>
            <summary class="role-heading">
                ${escapeXml(role)}
                <span class="role-count">${count}</span>
            </summary>
            <ul class="role-person-list">${personItems}</ul>
        </details>`;
    }).join("");
}

/** Ausstehender Highlight-Eintrag nach nächstem Register-Update */
let pendingHighlightId = null;

/**
 * Springt zu einer bestimmten Seite und hebt den Eintrag mit der
 * gegebenen ID dauerhaft farbig hervor.
 * Geändert: 2026-05-16 — Highlight permanent, korrekte Timing-Logik
 *
 * @param {string} pageN  Seitenbezeichnung (z. B. "65a")
 * @param {string} [id]   xml:id des Eintrags für Highlight (optional)
 */
window.jumpToPage = function (pageN, id, name, wylie) {
    const select = el("selectPage");
    if (select) select.value = pageN;
    pendingHighlightId = id || null;

    /* Aktive Tabs und Panes merken — 2026-05-17 */
    const activeStates = [];
    document.querySelectorAll('.panes-container').forEach(container => {
        const activePane = container.querySelector('.pane.active');
        const tabsGroup  = container.previousElementSibling;
        const activeBtn  = tabsGroup ? tabsGroup.querySelector('.tab-button.active') : null;
        activeStates.push({ container, activePane, activeBtn });
    });

    renderPage(pageN, wylie || name || "");

    /* Aktive Tabs und Panes wiederherstellen — 2026-05-29
       Wenn Register-Pane aktiv: auf Tibetisch der anderen Spalte wechseln */
    const REGISTER_PANES = ['persons', 'places', 'roles', 'vocab',
                             'pers', 'orte', 'rolle', 'vok'];
    const isRegisterPane = (pane) => pane && REGISTER_PANES.some(r =>
        pane.id && pane.id.toLowerCase().includes(r));

    activeStates.forEach(({ container, activePane, activeBtn }) => {
        let zielPane = activePane;
        let zielBtn  = activeBtn;

        /* Wenn Register-Pane aktiv: anderen Container prüfen — 2026-05-29 */
        const TEXT_PANE_PREFIXES = ['bo-', 'xml-', 'wylie-', 'de-', 'en-', 'tib'];
        const isTextPane = (pane) => pane && TEXT_PANE_PREFIXES.some(t =>
            pane.id && pane.id.startsWith(t));

        if (isRegisterPane(activePane)) {
            const andereContainers = [...document.querySelectorAll('.panes-container')]
                .filter(c => c !== container);
            for (const andererContainer of andereContainers) {
                const andererAktiv = andererContainer.querySelector('.pane.active');

                /* Andere Spalte zeigt bereits einen Text-Pane → nicht überschreiben */
                if (isTextPane(andererAktiv)) {
                    /* Register-Spalte unverändert lassen */
                    if (activePane) {
                        container.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
                        activePane.classList.add('active');
                    }
                    return;
                }

                /* Andere Spalte zeigt Register → auf Bo wechseln */
                const boPane = [...andererContainer.querySelectorAll('.pane')]
                    .find(p => p.id && (p.id.startsWith('bo-') || p.id.startsWith('tib')));
                if (boPane) {
                    if (activePane) {
                        container.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
                        activePane.classList.add('active');
                    }
                    andererContainer.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
                    boPane.classList.add('active');
                    const andererTabsGroup = andererContainer.previousElementSibling;
                    if (andererTabsGroup) {
                        andererTabsGroup.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                        const boBtn = [...andererTabsGroup.querySelectorAll('.tab-button')]
                            .find(b => b.textContent.trim().toLowerCase().includes('bo') ||
                                       b.dataset.pane === boPane.id);
                        if (boBtn) boBtn.classList.add('active');
                    }
                    return;
                }
            }
        }

        /* Normaler Fall: aktiven Pane wiederherstellen */
        if (zielPane) {
            container.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
            zielPane.classList.add('active');
        }
        if (zielBtn) {
            const tabsGroup = container.previousElementSibling;
            if (tabsGroup) {
                tabsGroup.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                zielBtn.classList.add('active');
            }
        }
    });

    /* Suchfeld befüllen — Wylie-Tab bekommt Wylie-Namen, sonst tibetischen Namen */
    /* searchTerm: Wylie hat Vorrang (lateinisch, findet mehr),
       Tibetischer Name als Fallback — 2026-05-29 */
    const searchTerm = wylie || name || '';

    /* Highlight-Funktion — wird nach allen anderen Events aufgerufen — 2026-05-28 */
    function setzeHighlight() {
        /* 1. Register-Einträge hervorheben */
        document.querySelectorAll('li.reg-entry--active').forEach(e => {
            e.classList.remove('reg-entry--active');
        });
        const targets = document.querySelectorAll(`li[data-id="${id}"]`);
        targets.forEach(elem => {
            elem.classList.add('reg-entry--active');
            const pane = elem.closest('.pane');
            const isRegisterPane = pane && (
                pane.id.startsWith('persons-') ||
                pane.id.startsWith('places-')
            );
            if (isRegisterPane && pane.classList.contains('active')) {
                const column = pane.closest('.column');
                if (column) {
                    const elemRect    = elem.getBoundingClientRect();
                    const colRect     = column.getBoundingClientRect();
                    const istSichtbar = elemRect.top >= colRect.top &&
                                        elemRect.bottom <= colRect.bottom;
                    if (!istSichtbar) {
                        column.scrollTo({
                            top: elem.offsetTop - column.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });

        /* 2. XML-Pane: Wylie-Begriff → Fallback auf bo-Namen — 2026-05-29
           Wylie aus standOff stimmt nicht immer mit Textvorkommen überein
           (z.B. rnam grol sde ≠ dkon mchog gsum gyi 'bang im body) */
        const xmlBegriff = (wylie && !/[\u0F00-\u0FFF]/.test(wylie)) ? wylie
                         : (name && !/[\u0F00-\u0FFF]/.test(name))   ? name
                         : name || null;  /* Fallback: bo-Namen (Tibetisch) */

        const macheXmlHighlight = (suchbegriff) => {
            if (!suchbegriff) return false;
            const isTib = /[\u0F00-\u0FFF]/.test(suchbegriff);
            let esc, regex;
            if (isTib) {
                esc   = suchbegriff.replace(/་+$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                regex = new RegExp(esc, 'g');
            } else {
                esc   = suchbegriff.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
                regex = new RegExp(esc, 'gi');
            }
            let gefunden = false;
            [left.xml, right.xml].forEach(div => {
                if (!div) return;
                const wrapper = div.querySelector('.xml-content-wrapper') || div;
                wrapper.innerHTML = wrapper.innerHTML
                    .replace(/<mark class="search-highlight">([\s\S]*?)<\/mark>/g, '$1');
                const neu = wrapper.innerHTML.replace(regex, match => {
                    gefunden = true;
                    return `<mark class="search-highlight">${match}</mark>`;
                });
                wrapper.innerHTML = neu;
                const xmlPane = div.closest('.pane');
                if (xmlPane && xmlPane.classList.contains('active')) {
                    const mark = wrapper.querySelector('.search-highlight');
                    if (mark) mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            return gefunden;
        };

        /* Erst Wylie versuchen, dann bo-Namen als Fallback */
        if (!macheXmlHighlight(xmlBegriff) && name && name !== xmlBegriff) {
            macheXmlHighlight(name);
        }

        /* 3. Tibetan-Pane: persName/placeName spans markieren — 2026-05-29
           Inline-Style statt CSS-Klasse damit kein main.css-Eintrag nötig */
        if (id) {
            document.querySelectorAll('.tei-pers, .tei-place').forEach(span => {
                span.style.backgroundColor = '';
                span.style.borderRadius    = '';
            });
            const aktivSpans = document.querySelectorAll(
                `.tei-pers[data-pid="${id}"], .tei-place[data-pid="${id}"]`
            );
            aktivSpans.forEach(span => {
                span.style.backgroundColor = 'var(--color-highlight, #fff3cd)';
                span.style.borderRadius    = '2px';
            });
            const erster = aktivSpans[0];
            if (erster) {
                const tibPane = erster.closest('.pane');
                if (tibPane && tibPane.classList.contains('active')) {
                    erster.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }

    if (searchTerm) {
        const input = el("searchInput");
        const ctrl  = el("searchControls");
        if (input) input.value = searchTerm;
        if (ctrl)  ctrl.style.display = "flex";
        /* Search-Event feuern, danach Highlight setzen — 2026-05-28 */
        setTimeout(() => {
            if (input) input.dispatchEvent(new Event('input', { bubbles: true }));
            /* Highlight nach Search-Event — Register ist jetzt stabil */
            if (id) setTimeout(() => {
                setzeHighlight();
                /* Suchergebnis-Dropdown ausblenden nach Register-Navigation
                   Highlight und Zähler (▲▼) bleiben erhalten — 2026-05-29 */
                const results = el("searchResults");
                if (results) results.style.display = "none";
            }, 350);
        }, 500);
    } else if (id) {
        /* Kein Suchterm — Highlight direkt nach renderPage — 2026-05-28 */
        setTimeout(setzeHighlight, 300);
    }
};

/* =========================================================
   Interaktivität (Klick auf Namen/Orte)
   ========================================================= */

/**
 * Verknüpft alle persname-, placename- und Listenelemente
 * mit externen URLs (Wikidata, BUDA, …) aus dem Register.
 *
 * Klick auf ein verknüpftes Element öffnet die URL im neuen Tab.
 */
/**
 * Prüft ob eine URL tatsächlich nutzbar ist
 * (nicht leer, nicht nur "https://" oder "https://>").
 *
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
    if (!url) return false;
    const trimmed = url.trim();
    if (trimmed === "" || trimmed === "https://" || trimmed === "https://>" ||
        trimmed === "http://" || trimmed.endsWith("://")) return false;
    try {
        const u = new URL(trimmed);
        return u.hostname.length > 0;
    } catch {
        return false;
    }
}

function attachInteractivity() {
    /* --- Wörter mit @ana im Tibetan-Tab → Vok.-Tab — 2026-05-22 */
    document.querySelectorAll('[data-wid][data-ana]').forEach(span => {
        if (span.dataset.interactive) return;
        span.dataset.interactive = 'true';
        span.classList.add('vocab-linked');
        span.style.cursor        = 'pointer';
        span.addEventListener('click', (e) => {
            e.stopPropagation(); /* initTabs nicht auslösen */
            const lexId = span.dataset.ana;
            const column = span.closest('.column');
            if (!column) return;

            /* Gegenüberliegende Spalte finden */
            const oppSide   = column.classList.contains('left') ? 'right' : 'left';
            const tabId     = `vocab-${oppSide}`;
            const oppColumn = document.querySelector(`.column.${oppSide}`);
            if (!oppColumn) return;

            const tabsGroup      = oppColumn.querySelector('.tabs');
            const panesContainer = tabsGroup ? tabsGroup.nextElementSibling : null;
            if (tabsGroup && panesContainer) {
                tabsGroup.querySelectorAll('.tab-button').forEach(b => {
                    b.classList.toggle('active', b.dataset.id === tabId);
                    b.setAttribute('aria-selected', b.dataset.id === tabId ? 'true' : 'false');
                });
                panesContainer.querySelectorAll('.pane').forEach(p => {
                    p.classList.toggle('active', p.id === tabId);
                });
            }

            /* Zeile im Vok.-Tab hervorheben und scrollen */
            requestAnimationFrame(() => {
                const vocPane = document.getElementById(tabId);
                if (!vocPane) return;
                const row = vocPane.querySelector(`tr[data-lexid="${lexId}"]`);
                if (row) {
                    vocPane.querySelectorAll('tr.vocab-highlight')
                           .forEach(r => r.classList.remove('vocab-highlight'));
                    row.classList.add('vocab-highlight');
                    row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        });
    });
    /* --- Personen, Orte und Werktitel im Lesetext --- */
    document.querySelectorAll("persname, placename, title").forEach(elem => {
        const rawId  = (elem.getAttribute("corresp") || "").replace(/^#/, "");
        const key    = elem.getAttribute("key")  || "";
        const type   = elem.getAttribute("type") || "";

        /* 1. Versuche URL aus dem Register */
        let url = "";
        if (rawId) {
            const data = projectData.listPerson.find(p => p.id === rawId)
                      || projectData.listPlaces.find(p => p.id === rawId);
            if (data && isValidUrl(data.url)) url = data.url;
        }

        /* 2. Fallback: URL aus key + type */
        if (!url && key && key !== "???") {
            const ref = typeof references !== "undefined"
                ? references.find(r => r.type === type)
                : null;
            if (ref && ref.url) url = ref.url + key;
        }

        if (isValidUrl(url)) {
            elem.style.cursor = "pointer";
            elem.title        = url;
            if (!elem.dataset.interactive) {
                elem.dataset.interactive = "true";
                elem.addEventListener("click", () => window.open(url, "_blank"));
            }
        } else {
            /* Kein Nachweis vorhanden → informativer Tooltip */
            elem.title        = "Kein Nachweis verfügbar";
            elem.style.cursor = "default";
        }
    });

    /* --- Registerlisteneinträge (Klick → URL) --- */
    document.querySelectorAll("li[data-id]").forEach(elem => {
        const id   = (elem.getAttribute("data-id") || "").replace(/^#/, "");
        const data = projectData.listPerson.find(p => p.id === id)
                  || projectData.listPlaces.find(p => p.id === id);
        if (data) {
            if (isValidUrl(data.url) && !elem.dataset.interactive) {
                elem.dataset.interactive = "true";
                elem.style.cursor        = "pointer";
                elem.title               = data.url;
                elem.addEventListener("click", (e) => {
                    /* Seitenbuttons sollen nicht den externen Link öffnen */
                    if (e.target.classList.contains('reg-page-btn')) return;
                    window.open(data.url, "_blank");
                });
            } else if (!isValidUrl(data.url)) {
                elem.title = "Kein Nachweis verfügbar";
            }
        }
    });
}

/* =========================================================
   Tab-Steuerung
   ========================================================= */

/**
 * Initialisiert das Tab-Interface für beide Spalten.
 *
 * KORREKTUR: Der Tab-Kontext wird über .panes-container ermittelt
 * (das direkte Geschwisterelement von .tabs), nicht über .column,
 * was bei verschachtelten Strukturen fehlerträchtig war.
 *
 * Funktionsweise: Klick auf einen .tab-button:
 *   1. Alle Tab-Buttons der gleichen .tabs-Gruppe → active entfernen
 *   2. Geklickter Button → active setzen
 *   3. Alle .pane im zugehörigen .panes-container → active entfernen
 *   4. Ziel-Pane (data-id) → active setzen
 */
/* =========================================================
   Tab-Steuerung
   ========================================================= */

/**
 * Initialisiert das Tab-Interface für beide Spalten.
 *
 * KORREKTUR: Der Tab-Kontext wird über .panes-container ermittelt
 * (das direkte Geschwisterelement von .tabs), nicht über .column,
 * was bei verschachtelten Strukturen fehlerträchtig war.
 *
 * Funktionsweise: Klick auf einen .tab-button:
 *   1. Alle Tab-Buttons der gleichen .tabs-Gruppe → active entfernen
 *   2. Geklickter Button → active setzen
 *   3. Alle .pane im zugehörigen .panes-container → active entfernen
 *   4. Ziel-Pane (data-id) → active setzen
 */
function initTabs() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".tab-button");
        if (!btn) return;

        const tabsGroup      = btn.closest(".tabs");
        const panesContainer = tabsGroup
            ? tabsGroup.nextElementSibling
            : null;

        if (!tabsGroup || !panesContainer) return;

        /* Tab-Buttons umschalten */
        tabsGroup.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        /* Panes umschalten */
        panesContainer.querySelectorAll(".pane").forEach(p => p.classList.remove("active"));
        const targetPane = document.getElementById(btn.dataset.id);
        if (targetPane) {
            targetPane.classList.add("active");
            /* Zoom zurücksetzen wenn Faksimile-Tab aktiviert wird */
            if (targetPane.classList.contains("facsimile")) {
                window.resetFacsimileZoom();
            }
        }
    });
}

/* =========================================================
   Faksimile-Zoom (Scrollrad) und Pan (Maus-Drag)
   ========================================================= */

/**
 * Zoom mit Scrollrad, Pan via Maus-Drag.
 *
 * Technik:
 *   - Das Bild wird per CSS transform skaliert.
 *   - Das Faksimile-Pane hat overflow: auto → beim Vergrößern
 *     entsteht eine Scrollbar; der Nutzer kann mit der Maus
 *     den sichtbaren Ausschnitt verschieben (scrollLeft/scrollTop).
 *   - Doppelklick oder Tab-Wechsel → Reset.
 */

window.resetFacsimileZoom = function () {
    document.querySelectorAll(".facsimile").forEach(pane => {
        const img = pane.querySelector("img");
        if (img) {
            img.style.transform       = "";
            img.style.transformOrigin = "";
            img.style.width           = "";
            img.style.height          = "";
        }
        pane.style.height   = "";
        pane.style.overflow = "";
        pane.style.removeProperty('--pane-zoom-height');
        pane.scrollLeft     = 0;
        pane.scrollTop      = 0;
        pane.style.cursor = "";
        pane.classList.remove("zoomed");
        pane._zoomScale   = 1.0;
    });
};

function initFacsimileZoom() {
    /* Welches Faksimile-Pane ist gerade unter der Maus? */
    let activeFacsimile = null;

    document.querySelectorAll(".facsimile").forEach(pane => {
        pane._zoomScale = 1.0;

        pane.addEventListener("mouseenter", () => { activeFacsimile = pane; });
        pane.addEventListener("mouseleave", () => { activeFacsimile = null; });

        /* --- Pan via Maus-Drag --- */
        let isDragging      = false;
        let dragStartX      = 0;
        let dragStartY      = 0;
        let scrollStartLeft = 0;
        let scrollStartTop  = 0;

        pane.addEventListener("mousedown", (e) => {
            if (pane._zoomScale <= 1.0) return;
            isDragging        = true;
            dragStartX        = e.clientX;
            dragStartY        = e.clientY;
            scrollStartLeft   = pane.scrollLeft;
            scrollStartTop    = pane.scrollTop;
            pane.style.cursor = "grabbing";
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            pane.scrollLeft = scrollStartLeft - (e.clientX - dragStartX);
            pane.scrollTop  = scrollStartTop  - (e.clientY - dragStartY);
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging        = false;
            pane.style.cursor = pane._zoomScale > 1.0 ? "grab" : "";
        });

        /* --- Doppelklick → Reset --- */
        pane.addEventListener("dblclick", () => {
            window.resetFacsimileZoom();
        });
    });

    /* --- Zoom via Scrollrad (ohne Strg) --- */
    document.addEventListener("wheel", (e) => {
        if (!activeFacsimile) return;
        e.preventDefault();

        const pane = activeFacsimile;
        const img  = pane.querySelector("img");
        if (!img) return;

        const rect      = pane.getBoundingClientRect();
        const mouseX    = e.clientX - rect.left + pane.scrollLeft;
        const mouseY    = e.clientY - rect.top  + pane.scrollTop;
        const prevScale = pane._zoomScale;

        if (e.deltaY < 0) {
            pane._zoomScale = Math.min(4.0, pane._zoomScale + 0.15);
        } else {
            pane._zoomScale = Math.max(1.0, pane._zoomScale - 0.15);
        }

        if (pane._zoomScale <= 1.0) {
            img.style.width   = "";
            img.style.height  = "";
            pane.style.height   = "";
            pane.style.overflow = "";
            pane.style.removeProperty('--pane-zoom-height');
            pane.scrollLeft     = 0;
            pane.scrollTop      = 0;
            pane.style.cursor = "";
            pane.classList.remove("zoomed");
        } else {
            const naturalW    = img.naturalWidth  || img.offsetWidth;
            const naturalH    = img.naturalHeight || img.offsetHeight;
            if (prevScale <= 1.0) {
                const h = pane.offsetHeight;
                pane.style.setProperty('--pane-zoom-height', h + 'px');
                pane.style.height = h + "px";
                pane.style.overflow = 'hidden';
            }
            img.style.width   = `${naturalW * pane._zoomScale}px`;
            img.style.height  = `${naturalH * pane._zoomScale}px`;
            pane.style.cursor = "grab";
            pane.classList.add("zoomed");

            const ratio     = pane._zoomScale / prevScale;
            pane.scrollLeft = mouseX * ratio - (e.clientX - rect.left);
            pane.scrollTop  = mouseY * ratio - (e.clientY - rect.top);
        }
    }, { passive: false });
}

