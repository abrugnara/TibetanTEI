# TibetanTEI — Albert Brugnara

Digitale Edition klassisch-tibetischer Texte im Browser.
Live: **[www.brugnara.at](https://www.brugnara.at)**

---

## Projektbeschreibung

Dieses Repository entstand im Rahmen des Seminars *Digitale Edition* am
[Institut für Südasien-, Tibet- und Buddhismuskunde (ISTB)](https://stb.univie.ac.at/)
der Universität Wien unter der Leitung von Prof. Viehhauser
(Professur für Digitales Edieren, Institut für Europäische und Vergleichende
Sprach- und Literaturwissenschaft, Universität Wien) und Horst Lasic (ISTB).

Das Projekt stellt diplomatische Editionen tibetischer historischer Texte
bereit. Die Texte sind nach dem TEI-P5-Standard kodiert und werden in einem
browserbasierten Interface mit Tab-Navigation, Faksimile-Anzeige und
Zoom-Funktion präsentiert. Das Interface bietet Personen-, Orts-, Rollen- und
Vokabelregister sowie eine Volltext-Suche. Die Darstellung ist von der
Online-TEI-Ausgabe der Österreichischen Nationalbibliothek inspiriert
([Peter Handkes Notizbücher](https://edition.onb.ac.at/context:hnb)).

---

## Textzeugen

Die Edition umfasst derzeit nuen Textzeugen aus verschiedenen
literarischen Gattungen der tibetisch-buddhistischen Tradition:

| ID | Datei | Inhalt |
|----|-------|--------|
| 1 | 1_gompopa.xml | Gampopa |
| 2 | 2_dignaga.xml | Biographie des Logikers Dignāga (Tāranātha) |
| 3 | 3_ganden.xml | Ganden |
| 4 | 4_shrisena.xml | Śrīsena |
| 5 | 5_klong_chen_ran_'byam.xml | Klong chen ran 'byam |
| 6 | 6_shantideva_bca.xml | Śāntideva, Bodhicaryāvatāra |
| 7 | 7_r103.xml | r103 |
| 8 | 8_bu_ston_dignag | Dignāga (Bu ston) |
| 9 | 9_Vimalaprabha | Vimalaprabha Himmel und Höllen, und wie man dahin gelangt |
---

## Technische Grundlage

- **Kodierung:** TEI-P5 XML
- **Frontend:** HTML5, CSS3, JavaScript (native `fetch()` + `DOMParser`, kein Framework)
- **Fonts:** Yagpo Tibetan Sambhota Uni (primär), Microsoft Himalaya, Jomolhari (Fallbacks)
- **Hosting:** GitHub Pages
- **XSLT:** Saxon-PE 12.9 / XSLT 2.0 für statische HTML-Ausgabe
- **Validierung:** Oxygen XML Editor mit TEI-P5-Schema

---

## Dateistruktur

```
TibetanTEI/
├── index.html               Startseite
├── texts.html               Übersicht aller Textzeugen
├── detail.html              Textansicht (Hauptoberfläche)
├── impressum.html           Impressum
├── favicon.png
├── assets/
│   ├── css/main.css         Zentrales Stylesheet
│   ├── app/
│   │   ├── detail.js        Kernlogik der Textansicht
│   │   └── texts.js         Datenliste der Textzeugen
│   └── fonts/
│       └── Jomolhari.woff2  Tibetan-Fallback-Font
└── content/
    ├── 1_gompopa.xml
    ├── 2_dignaga.xml
    ├── 3_ganden.xml
    ├── 4_shrisena.xml
    ├── 5_klong_chen_ran_'byam.xml
    ├── 6_shantideva_bca.xml
    ├── 7_r103.xml
    ├── tibetantei.xsl       Generisches XSLT-Stylesheet
    ├── 2_dignaga.xsl        Textzeugenbezogenes XSLT
    └── images/              Faksimile-Bilder je Textzeuge
```

---

## Neuen Textzeugen einpflegen

### 1. XML-Datei anlegen

Die XML-Datei kommt in den Ordner `content/`. Benennung analog zu den
bestehenden Dateien (z. B. `content/8_meintext.xml`). Faksimile-Bilder
kommen in einen Unterordner `content/images/8_meintext/`.

### 2. Textzeugen registrieren

In `assets/app/texts.js` einen neuen Eintrag hinzufügen:

```javascript
const texts = [
    { id: 1, url: "content/1_gompopa.xml",           title: "...", pages: 71 },
    { id: 2, url: "content/2_dignaga.xml",           title: "...", pages: 5  },
    // ...
    { id: 8, url: "content/8_meintext.xml",          title: "...", pages: N  },
];
```

### 3. Übersichtsseite ergänzen

In `texts.html` einen `<div class="text-item">` hinzufügen:

```html
<div class="text-item">
  <a href="detail.html?id=8">
    <h2>
      <span lang="bo"><!-- Tibetischer Titel --></span>
      Kurztitel
    </h2>
    <img src="content/images/8_meintext/seite_1.jpg" />
  </a>
</div>
```

---

## TEI-P5-Kodierungsschema

Das Kodierungsschema folgt den TEI-P5-Richtlinien für diplomatische
Editionen tibetischer historischer Texte mit einem Textzeugen. Wo
mehrere Textzeugen vorliegen, wurden Abweichungen markiert.

### Grundstruktur

```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>...</teiHeader>   <!-- Metadaten        -->
  <standOff>...</standOff>     <!-- Register         -->
  <text>
    <body>
      <div>                    <!-- Eine Seite        -->
        <pb n="65a" facs="content/images/..." ed="A"/>
        <p xml:lang="bo">...</p>        <!-- Tibetisch  -->
        <p xml:lang="bo-Latn">...</p>   <!-- Wylie      -->
        <p xml:lang="de">...</p>        <!-- Deutsch    -->
        <p xml:lang="en">...</p>        <!-- Englisch   -->
      </div>
    </body>
  </text>
</TEI>
```

### Strukturelemente

| Element | Funktion |
|---------|----------|
| `<div>` | Seitenabschnitt |
| `<p xml:lang="bo">` | Tibetischer Absatz |
| `<pb n="65a" facs="..." ed="A"/>` | Seitenumbruch mit Faksimile-Referenz |
| `<lb/>` | Zeilenwechsel im Original |
| `<l>...</l>` | Verszeile |
| `<lg>...</lg>` | Versgruppe |
| `<head>...</head>` | Überschrift |

### Textkritik

| Element | Funktion | Beispiel |
|---------|----------|---------|
| `<gap extent="4" unit="letters"/>` | Lücke im Text | |
| `<unclear>...</unclear>` | Unsichere Lesung | |
| `<choice><sic>...</sic><corr>...</corr></choice>` | Emendation | `བསམ་<choice><sic>གྱི་</sic><corr>གྱིས་</corr></choice>མི་ཁྱག` |
| `<choice><orig>...</orig><reg>...</reg></choice>` | Normalisierung | |

### Inhaltliche Annotation

| Element | Funktion | Beispiel |
|---------|----------|---------|
| `<persName corresp="#xml_id">` | Personenname | `<persName corresp="#vasubandhu">དབྱིག་གཉེན་</persName>` |
| `<placeName corresp="#xml_id">` | Ortsname | `<placeName corresp="#kashmir">ཁ་ཆེ་</placeName>` |
| `<date when="1446">` | Datum | `<date when="1446">མེ་ཕོ་སྟག་གི་ལོ</date>` |
| `<title corresp="#xml_id">` | Werktitel | |
| `<gloss>...</gloss>` | Glosse des Schreibers | |
| `<term>...</term>` | Fachterminologie in der Übersetzung | `<term>pravrajyā</term>` |

### Syntaktische Annotation

Die syntaktische Annotation folgt Schwieger (2006) und Bialek (Lek. 21–42):

| Element | Funktion |
|---------|----------|
| `<s xml:id="s65a01">` | Satzgrenze mit eindeutiger ID |
| `<s corresp="#s65a01_de #s65a01_en">` | Paralleltext-Verlinkung |
| `<cl>...</cl>` | Klausel |
| `<phr>...</phr>` | Phrase |
| `<w xml:id="w65a01_01" pos="N">` | Wort mit POS-Tag |
| `<w ana="#lex_btang">` | Vokabular-Verlinkung |
| `<pc type="shad">།</pc>` | Satzzeichen (Shad) |

#### POS-Tagset

Das Tagset ist an das Stuttgart-Tübingen-Tagset (STTS) angelehnt und für
das klassische Tibetisch adaptiert (Schiller et al. 1999):

| Tag | Kategorie |
|-----|-----------|
| `N` | Nomen |
| `N.prop` | Eigenname |
| `N.hon` | Nomen (Honorific) |
| `N.v.past / N.v.pres / N.v.fut` | Verbalnomen |
| `V.past / V.pres / V.fut / V.imp` | Verb nach Stammform |
| `V.cop` | Kopula |
| `V.exist` | Existenzverb |
| `V.past.hon / V.pres.hon` | Verbum honorificum |
| `ADJ` | Adjektiv |
| `ADJ.hon` | Adjektiv (Honorific) |
| `ADV` | Adverb |
| `PART` | Partikel (allgemein) |
| `PART.case` | Kasuspartikel |
| `PART.final` | Finalpartikel |
| `PART.cv` | Konverbpartikel |
| `PART.neg` | Negationspartikel |
| `PART.quot` | Quotativpartikel |
| `PART.top` | Topikpartikel |
| `PART.pl` | Pluralpartikel |
| `PART.indef` | Indefinitpartikel |
| `PART.inter` | Interrogativpartikel |
| `PART.imp` | Imperativpartikel |
| `NUM` | Numeral |
| `PRON` | Pronomen |
| `QUANT` | Quantor |
| `DET` | Determinator |
| `INT` | Interrogativum |
| `PC` | Satzzeichen |

#### Verbklassifikation (nach Bialek / Schwieger)

| Kürzel | Bedeutung |
|--------|-----------|
| `tdV` | *tha dad pa* — direktes Verb (Schwieger S. 75) |
| `tmdV` | *tha mi dad pa* — indirektes Verb |
| `VG1–VG6` | Verbgruppen nach Bialek (Lek. 21) |

**Hinweis:** Die Unterscheidung transitiv/intransitiv ist als primäre
Klassifikationskategorie unzulässig (*pauschal unzulässig*, Schwieger S. 75).

---

## standOff — Register

Der `<standOff>`-Bereich enthält alle Register getrennt vom Text.

### Personenregister

```xml
<standOff>
  <listPerson>
    <person xml:id="vasubandhu">
      <persName xml:lang="bo">དབྱིག་གཉེན་</persName>
      <persName xml:lang="bo-Latn">dbyig gnyen</persName>
      <note type="role">Philosoph</note>
      <idno type="URI">https://library.bdrc.io/show/bdr:P6119</idno>
      <birth notBefore="0300" notAfter="0400"/>
    </person>
  </listPerson>
```

### Ortsregister

```xml
  <listPlace>
    <place xml:id="kashmir">
      <placeName xml:lang="bo">ཁ་ཆེ་</placeName>
      <placeName xml:lang="bo-Latn">kha che</placeName>
      <idno type="URI">https://legacy.tbrc.org/#!rid=G2DB25458</idno>
    </place>
  </listPlace>
```

### Vokabelregister (fvLib)

Das Vokabelregister ist als TEI-P5-konforme Feature Value Library (`<fvLib>`)
im `<standOff>` codiert. Im Text verweist `@ana` auf die `xml:id` des Eintrags:

```xml
  <fvLib n="vocab">
    <fs xml:id="lex_btang" type="vocab">
      <f name="wylie">       <string>btang</string></f>
      <f name="uchen">       <string>བཏང་</string></f>
      <f name="lemma_wylie"> <string>gtong ba</string></f>
      <f name="lemma_uchen"> <string>གཏོང་བ་</string></f>
      <f name="stem1">       <string>gtong</string></f>
      <f name="stem2">       <string>btang</string></f>
      <f name="stem3">       <string>gtong</string></f>
      <f name="stem4">       <string>thong</string></f>
      <f name="pos">         <string>V.past</string></f>
      <f name="subc">        <string>tdV</string></f>
      <f name="def_de">      <string>schicken, loslassen</string></f>
      <f name="def_en">      <string>to send, to release</string></f>
    </fs>
  </fvLib>
</standOff>
```

Verweis im Text:

```xml
<w xml:id="w65b03_05" pos="V.past" ana="#lex_btang">བཏང་</w>
```

**Regeln:**

- `xml:id`-Format: `lex_[wylie_ohne_leerzeichen]`, z. B. `lex_btang`, `lex_slob_dpon`
- Stammformen (`stem1`–`stem4`) nur bei Verben
- Partikeln (`PART.*`) werden nicht erfasst
- `@ana` muss auf eine vorhandene `xml:id` in `<fvLib>` verweisen

---

## Externe Referenzsysteme

| Kürzel | System | URL-Basis |
|--------|--------|-----------|
| BUDA | Buddhist Digital Resource Center | `https://library.bdrc.io/show/bdr:` |
| TBRC | Tibet Buddhist Resource Center (Legacy) | `https://legacy.tbrc.org/#!rid=` |
| SRC | Sakya Research Centre | `http://www.sakyaresearch.org` |
| RKTS | Resources for Kanjur & Tanjur Studies | `https://www.istb.univie.ac.at/kanjur/rktsneu/sub/` |
| WikiData | Wikidata | `https://www.wikidata.org/wiki/` |

---

## Browser-Interface

Das Interface bietet je Textspalte zehn Reiter:

| Reiter | Inhalt |
|--------|--------|
| Faks. | Faksimile mit Zoom und Drag |
| XML | TEI-XML-Rohtext |
| Tibetan | Tibetischer Text (OpenType-Shaping) |
| Wylie | Wylie-Transliteration |
| De | Deutsche Übersetzung |
| En | Englische Übersetzung |
| Pers. | Personenregister mit BUDA-Links |
| Orte | Ortsregister mit BUDA-Links |
| Rolle | Rollenregister |
| Vok. | Vokabelregister mit Definitionen |

**Interaktion:**

- Klick auf Personennamen/Ortsnamen → Register-Tab öffnet, Eintrag hervorgehoben
- Klick auf tibetischen Satz mit `@corresp` → Parallelsatz als Tooltip
- Klick auf Wort mit `@ana` → Vok.-Tab öffnet, Lemma hervorgehoben
- Klick auf `[→]` im Vok.-Tab → Tibetan-Tab öffnet, Wort im Text hervorgehoben
- Volltext-Suche über alle Sprachen und alle Seiten

---

## Debugging (F12-Konsole)

Nach dem Laden führt `detail.js` automatisch eine Konsistenzprüfung durch
(F12 → Console). Ausgabe in drei Gruppen:

- **Gelb:** Fehler — müssen behoben werden
- **Blau, eingeklappt:** Fehlende BUDA-Links
- **Blau, eingeklappt:** Vokabelregister-Hinweise (unvollständige Annotation)

Ausführliche Dokumentation: `TibetanTEI_Debugging_F12.docx`

---

## XSLT-Ausgabe

Für die statische HTML-Ausgabe stehen XSLT-Stylesheets bereit:

| Datei | Funktion |
|-------|----------|
| `content/tibetantei.xsl` | Generisches Stylesheet für alle Textzeugen |
| `content/2_dignaga.xsl` | Textzeugenbezogenes Stylesheet (Paralleltext) |

Verwendung in Oxygen XML Editor:
Document → Transformation → Configure Transformation Scenarios →
New → XML Transformation with XSLT → Saxon-PE 12.9

---

## Wissenschaftliche Begründung: JavaScript statt XSLT

Die Primärdarstellung erfolgt über JavaScript (`fetch()` + `DOMParser`)
statt client-seitigem XSLT, weil:

1. **Browser-Kompatibilität:** Client-seitiges XSLT wird von modernen Browsern
   nicht mehr zuverlässig unterstützt.
2. **Digitale Nachhaltigkeit:** JavaScript ist langfristig stabiler als
   XSLT-Browser-Implementierungen.
3. **Interaktivität:** Bidirektionale Verlinkung (Text ↔ Register ↔ Vokabular),
   Faksimile-Zoom und Volltext-Suche sind in JavaScript direkt implementierbar.

XSLT bleibt als sekundäre Ausgabe für Offline-Verwendung und PDF/ePub-Export
verfügbar.

---

## Literatur

- Bialek, Joanna: *Lehrmaterialien zur Tibetischen Grammatik* (Lek. 21–42).
  Universität Wien.
- Schwieger, Peter: *Handbuch zur Grammatik der klassischen tibetischen
  Schriftsprache*. Halle 2006.
- TEI Consortium: *TEI P5: Guidelines for Electronic Text Encoding and
  Interchange*. Version 4.x.
  [https://www.tei-c.org/guidelines/p5/](https://www.tei-c.org/guidelines/p5/)
- Schiller, Anne et al.: *Guidelines für das Tagging deutscher Textcorpora
  mit STTS*. Stuttgart/Tübingen 1999.
  [https://www.ims.uni-stuttgart.de/documents/ressourcen/lexika/tagsets/stts-1999.pdf](https://www.ims.uni-stuttgart.de/documents/ressourcen/lexika/tagsets/stts-1999.pdf)

---

## Lizenz

© 2026 Albert Brugnara, Universität Wien.
Der Quellcode steht unter der MIT-Lizenz. Die edierten Texte unterliegen
den jeweiligen Urheberrechtsbedingungen.
