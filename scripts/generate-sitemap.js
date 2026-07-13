#!/usr/bin/env node
/**
 * scripts/generate-sitemap.js
 *
 * Baut sitemap.xml neu aus dem aktuellen Inhalt von texts.html.
 * Liest alle "detail.html?id=N"-Links aus, dedupliziert sie, sortiert
 * sie numerisch und fügt sie zu den drei statischen Seiten hinzu.
 *
 * Aufruf:  node scripts/generate-sitemap.js
 * (wird auch vom GitHub Action .github/workflows/sitemap.yml genutzt)
 *
 * Deterministisch: bei unverändertem texts.html erzeugt der Lauf
 * byte-identischen Output — wichtig, damit der Workflow nur dann
 * committet, wenn sich wirklich etwas geändert hat (kein Zeitstempel
 * im Output, kein Grund für "false positive"-Commits).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TEXTS_HTML = path.join(ROOT, "texts.html");
const SITEMAP_XML = path.join(ROOT, "sitemap.xml");
const BASE_URL = "https://www.brugnara.at";

function main() {
    if (!fs.existsSync(TEXTS_HTML)) {
        console.error(`FEHLER: ${TEXTS_HTML} nicht gefunden.`);
        process.exit(1);
    }
    const textsHtml = fs.readFileSync(TEXTS_HTML, "utf-8");

    /* Alle detail.html?id=N-Links extrahieren, deduplizieren, numerisch sortieren */
    const ids = new Set();
    for (const m of textsHtml.matchAll(/detail\.html\?id=(\d+)/g)) {
        ids.add(Number(m[1]));
    }
    const sortedIds = [...ids].sort((a, b) => a - b);

    if (sortedIds.length === 0) {
        console.error("WARNUNG: Keine detail.html?id=-Links in texts.html gefunden — sitemap.xml würde nur die drei statischen Seiten enthalten. Abbruch zur Sicherheit.");
        process.exit(1);
    }

    /* Statische Seiten (fest, ändern sich nicht mit den Textzeugen) */
    const staticUrls = [
        { loc: `${BASE_URL}/`, priority: "1.0" },
        { loc: `${BASE_URL}/texts.html`, priority: "0.8" },
    ];
    const detailUrls = sortedIds.map(id => ({
        loc: `${BASE_URL}/detail.html?id=${id}`,
        priority: "0.7",
    }));
    const trailingUrls = [
        { loc: `${BASE_URL}/impressum.html`, priority: "0.3" },
    ];

    const allUrls = [...staticUrls, ...detailUrls, ...trailingUrls];

    const body = allUrls
        .map(u => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`)
        .join("\n");

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${body}\n` +
        `</urlset>\n`;

    fs.writeFileSync(SITEMAP_XML, xml, "utf-8");
    console.log(`sitemap.xml geschrieben: ${allUrls.length} URLs (${sortedIds.length} Textzeugen: ${sortedIds.join(", ")}).`);
}

main();
