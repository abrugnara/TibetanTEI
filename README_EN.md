# TibetanTEI — Albert Brugnara

Digital edition of classical Tibetan texts in the browser.
Live: **[www.brugnara.at](https://www.brugnara.at)**

---

## Project Description

This repository was developed as part of the seminar *Digital Editing* at the
[Institute for South Asian, Tibetan and Buddhist Studies (ISTB)](https://stb.univie.ac.at/)
at the University of Vienna, under the supervision of Prof. Viehhauser
(Chair of Digital Editing, Institute for European and Comparative Language and
Literary Studies, University of Vienna) and Horst Lasic (ISTB).

The project provides diplomatic editions of Tibetan historical texts. The texts
are encoded according to the TEI-P5 standard and presented in a browser-based
interface with tab navigation, facsimile display and zoom functionality. The
interface provides indexes of persons, places, roles and vocabulary, as well as
full-text search. The design is inspired by the online TEI edition of the
Austrian National Library
([Peter Handke's Notebooks](https://edition.onb.ac.at/context:hnb)).

---

## Witnesses

The edition currently comprises seven witnesses from various literary genres
of the Tibetan Buddhist tradition:

| ID | File | Content |
|----|------|---------|
| 1 | 1_gompopa.xml | Gampopa |
| 2 | 2_dignaga.xml | Biography of the logician Dignāga (Tāranātha) |
| 3 | 3_ganden.xml | Ganden |
| 4 | 4_shrisena.xml | Śrīsena |
| 5 | 5_klong_chen_ran_'byam.xml | Klong chen ran 'byam |
| 6 | 6_shantideva_bca.xml | Śāntideva, Bodhicaryāvatāra |
| 7 | 7_r103.xml | r103 |

---

## Technical Foundation

- **Encoding:** TEI-P5 XML
- **Frontend:** HTML5, CSS3, JavaScript (native `fetch()` + `DOMParser`, no framework)
- **Fonts:** Yagpo Tibetan Sambhota Uni (primary), Microsoft Himalaya, Jomolhari (fallbacks)
- **Hosting:** GitHub Pages
- **XSLT:** Saxon-PE 12.9 / XSLT 2.0 for static HTML output
- **Validation:** Oxygen XML Editor with TEI-P5 schema

---

## File Structure

```
TibetanTEI/
├── index.html               Start page
├── texts.html               Overview of all witnesses
├── detail.html              Text view (main interface)
├── impressum.html           Legal notice
├── favicon.png
├── assets/
│   ├── css/main.css         Central stylesheet
│   ├── app/
│   │   ├── detail.js        Core logic of the text view
│   │   └── texts.js         Data list of witnesses
│   └── fonts/
│       └── Jomolhari.woff2  Tibetan fallback font
└── content/
    ├── 1_gompopa.xml
    ├── 2_dignaga.xml
    ├── 3_ganden.xml
    ├── 4_shrisena.xml
    ├── 5_klong_chen_ran_'byam.xml
    ├── 6_shantideva_bca.xml
    ├── 7_r103.xml
    ├── tibetantei.xsl       Generic XSLT stylesheet
    ├── 2_dignaga.xsl        Witness-specific XSLT
    └── images/              Facsimile images per witness
```

---

## Adding a New Witness

### 1. Create the XML file

The XML file is placed in the `content/` directory, following the naming
convention of existing files (e.g. `content/8_mytext.xml`). Facsimile images
go into a subdirectory `content/images/8_mytext/`.

### 2. Register the witness

Add a new entry to `assets/app/texts.js`:

```javascript
const texts = [
    { id: 1, url: "content/1_gompopa.xml",           title: "...", pages: 71 },
    { id: 2, url: "content/2_dignaga.xml",           title: "...", pages: 5  },
    // ...
    { id: 8, url: "content/8_mytext.xml",            title: "...", pages: N  },
];
```

### 3. Update the overview page

Add a `<div class="text-item">` to `texts.html`:

```html
<div class="text-item">
  <a href="detail.html?id=8">
    <h2>
      <span lang="bo"><!-- Tibetan title --></span>
      Short title
    </h2>
    <img src="content/images/8_mytext/page_1.jpg" />
  </a>
</div>
```

---

## TEI-P5 Encoding Schema

The encoding schema follows the TEI-P5 guidelines for diplomatic editions of
Tibetan historical texts based on a single witness. Where multiple witnesses
are available, divergences have been recorded.

### Basic Structure

```xml
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>...</teiHeader>   <!-- Metadata         -->
  <standOff>...</standOff>     <!-- Registers         -->
  <text>
    <body>
      <div>                    <!-- One page          -->
        <pb n="65a" facs="content/images/..." ed="A"/>
        <p xml:lang="bo">...</p>        <!-- Tibetan   -->
        <p xml:lang="bo-Latn">...</p>   <!-- Wylie     -->
        <p xml:lang="de">...</p>        <!-- German    -->
        <p xml:lang="en">...</p>        <!-- English   -->
      </div>
    </body>
  </text>
</TEI>
```

### Structural Elements

| Element | Function |
|---------|----------|
| `<div>` | Page section |
| `<p xml:lang="bo">` | Tibetan paragraph |
| `<pb n="65a" facs="..." ed="A"/>` | Page break with facsimile reference |
| `<lb/>` | Line break in the original |
| `<l>...</l>` | Verse line |
| `<lg>...</lg>` | Verse group |
| `<head>...</head>` | Heading |

### Textual Criticism

| Element | Function | Example |
|---------|----------|---------|
| `<gap extent="4" unit="letters"/>` | Lacuna in the text | |
| `<unclear>...</unclear>` | Uncertain reading | |
| `<choice><sic>...</sic><corr>...</corr></choice>` | Emendation | `བསམ་<choice><sic>གྱི་</sic><corr>གྱིས་</corr></choice>མི་ཁྱག` |
| `<choice><orig>...</orig><reg>...</reg></choice>` | Regularisation | |

### Content Annotation

| Element | Function | Example |
|---------|----------|---------|
| `<persName corresp="#xml_id">` | Person name | `<persName corresp="#vasubandhu">དབྱིག་གཉེན་</persName>` |
| `<placeName corresp="#xml_id">` | Place name | `<placeName corresp="#kashmir">ཁ་ཆེ་</placeName>` |
| `<date when="1446">` | Date | `<date when="1446">མེ་ཕོ་སྟག་གི་ལོ</date>` |
| `<title corresp="#xml_id">` | Work title | |
| `<gloss>...</gloss>` | Scribal gloss | |
| `<term>...</term>` | Technical terminology in translation | `<term>pravrajyā</term>` |

### Syntactic Annotation

The syntactic annotation follows Schwieger (2006) and Bialek (Lec. 21–42):

| Element | Function |
|---------|----------|
| `<s xml:id="s65a01">` | Sentence boundary with unique ID |
| `<s corresp="#s65a01_de #s65a01_en">` | Parallel text linking |
| `<cl>...</cl>` | Clause |
| `<phr>...</phr>` | Phrase |
| `<w xml:id="w65a01_01" pos="N">` | Word with POS tag |
| `<w ana="#lex_btang">` | Vocabulary linking |
| `<pc type="shad">།</pc>` | Punctuation (shad) |

#### POS Tagset

The tagset is based on the Stuttgart-Tübingen Tagset (STTS) and adapted for
classical Tibetan (Schiller et al. 1999):

| Tag | Category |
|-----|----------|
| `N` | Noun |
| `N.prop` | Proper name |
| `N.hon` | Noun (honorific) |
| `N.v.past / N.v.pres / N.v.fut` | Verbal noun |
| `V.past / V.pres / V.fut / V.imp` | Verb by stem form |
| `V.cop` | Copula |
| `V.exist` | Existential verb |
| `V.past.hon / V.pres.hon` | Honorific verb |
| `ADJ` | Adjective |
| `ADJ.hon` | Adjective (honorific) |
| `ADV` | Adverb |
| `PART` | Particle (general) |
| `PART.case` | Case particle |
| `PART.final` | Final particle |
| `PART.cv` | Converbal particle |
| `PART.neg` | Negative particle |
| `PART.quot` | Quotative particle |
| `PART.top` | Topic particle |
| `PART.pl` | Plural particle |
| `PART.indef` | Indefinite particle |
| `PART.inter` | Interrogative particle |
| `PART.imp` | Imperative particle |
| `NUM` | Numeral |
| `PRON` | Pronoun |
| `QUANT` | Quantifier |
| `DET` | Determiner |
| `INT` | Interrogative |
| `PC` | Punctuation |

#### Verb Classification (after Bialek / Schwieger)

| Abbreviation | Meaning |
|-------------|---------|
| `tdV` | *tha dad pa* — direct verb (Schwieger p. 75) |
| `tmdV` | *tha mi dad pa* — indirect verb |
| `VG1–VG6` | Verb groups after Bialek (Lec. 21) |

**Note:** The transitive/intransitive distinction is inadmissible as a primary
classification category (*pauschal unzulässig*, Schwieger p. 75).

---

## standOff — Registers

The `<standOff>` section contains all register data separate from the text.

### Person Register

```xml
<standOff>
  <listPerson>
    <person xml:id="vasubandhu">
      <persName xml:lang="bo">དབྱིག་གཉེན་</persName>
      <persName xml:lang="bo-Latn">dbyig gnyen</persName>
      <note type="role">Philosopher</note>
      <idno type="URI">https://library.bdrc.io/show/bdr:P6119</idno>
      <birth notBefore="0300" notAfter="0400"/>
    </person>
  </listPerson>
```

### Place Register

```xml
  <listPlace>
    <place xml:id="kashmir">
      <placeName xml:lang="bo">ཁ་ཆེ་</placeName>
      <placeName xml:lang="bo-Latn">kha che</placeName>
      <idno type="URI">https://legacy.tbrc.org/#!rid=G2DB25458</idno>
    </place>
  </listPlace>
```

### Vocabulary Register (fvLib)

The vocabulary register is encoded as a TEI-P5-compliant Feature Value Library
(`<fvLib>`) within `<standOff>`. In the text body, `@ana` references the
`xml:id` of the corresponding entry:

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

Reference in the text:

```xml
<w xml:id="w65b03_05" pos="V.past" ana="#lex_btang">བཏང་</w>
```

**Rules:**

- `xml:id` format: `lex_[wylie_no_spaces]`, e.g. `lex_btang`, `lex_slob_dpon`
- Stem forms (`stem1`–`stem4`) for verbs only
- Particles (`PART.*`) are not recorded
- `@ana` must reference an existing `xml:id` in `<fvLib>`

---

## External Reference Systems

| Abbreviation | System | URL Base |
|---|---|---|
| BUDA | Buddhist Digital Resource Center | `https://library.bdrc.io/show/bdr:` |
| TBRC | Tibet Buddhist Resource Center (Legacy) | `https://legacy.tbrc.org/#!rid=` |
| SRC | Sakya Research Centre | `http://www.sakyaresearch.org` |
| RKTS | Resources for Kanjur & Tanjur Studies | `https://www.istb.univie.ac.at/kanjur/rktsneu/sub/` |
| WikiData | Wikidata | `https://www.wikidata.org/wiki/` |

---

## Browser Interface

The interface provides ten tabs per text column:

| Tab | Content |
|-----|---------|
| Facs. | Facsimile with zoom and drag |
| XML | TEI-XML raw text |
| Tibetan | Tibetan text (OpenType shaping) |
| Wylie | Wylie transliteration |
| De | German translation |
| En | English translation |
| Pers. | Person register with BUDA links |
| Places | Place register with BUDA links |
| Role | Role register |
| Voc. | Vocabulary register with definitions |

**Interaction:**

- Click on person name / place name → register tab opens, entry highlighted
- Click on Tibetan sentence with `@corresp` → parallel sentence as tooltip
- Click on word with `@ana` → vocabulary tab opens, lemma highlighted
- Click on `[→]` in the vocabulary tab → Tibetan tab opens, word highlighted in text
- Full-text search across all languages and all pages

---

## Debugging (F12 Console)

After loading, `detail.js` automatically runs a consistency check
(F12 → Console). Output in three groups:

- **Yellow:** Errors — must be corrected
- **Blue, collapsed:** Missing BUDA links
- **Blue, collapsed:** Vocabulary register notices (incomplete annotation)

Detailed documentation: `TibetanTEI_Debugging_F12.docx`

---

## XSLT Output

For static HTML output, XSLT stylesheets are available:

| File | Function |
|------|----------|
| `content/tibetantei.xsl` | Generic stylesheet for all witnesses |
| `content/2_dignaga.xsl` | Witness-specific stylesheet (parallel text) |

Usage in Oxygen XML Editor:
Document → Transformation → Configure Transformation Scenarios →
New → XML Transformation with XSLT → Saxon-PE 12.9

---

## Rationale: JavaScript Instead of XSLT

The primary rendering is implemented via JavaScript (`fetch()` + `DOMParser`)
rather than client-side XSLT, for the following reasons:

1. **Browser compatibility:** Client-side XSLT is no longer reliably supported
   by modern browsers.
2. **Digital sustainability:** JavaScript is more stable in the long term than
   XSLT browser implementations.
3. **Interactivity:** Bidirectional linking (text ↔ registers ↔ vocabulary),
   facsimile zoom and full-text search are more readily implemented in
   JavaScript.

XSLT remains available as a secondary output for offline use and PDF/ePub
export.

---

## References

- Bialek, Joanna: *Teaching Materials for Tibetan Grammar* (Lec. 21–42).
  University of Vienna.
- Schwieger, Peter: *Handbuch zur Grammatik der klassischen tibetischen
  Schriftsprache*. Halle 2006.
- TEI Consortium: *TEI P5: Guidelines for Electronic Text Encoding and
  Interchange*. Version 4.x.
  [https://www.tei-c.org/guidelines/p5/](https://www.tei-c.org/guidelines/p5/)
- Schiller, Anne et al.: *Guidelines for the Tagging of German Text Corpora
  with STTS*. Stuttgart/Tübingen 1999.
  [https://www.ims.uni-stuttgart.de/documents/ressourcen/lexika/tagsets/stts-1999.pdf](https://www.ims.uni-stuttgart.de/documents/ressourcen/lexika/tagsets/stts-1999.pdf)

---

## Licence

© 2026 Albert Brugnara, University of Vienna.
The source code is released under the MIT Licence. The edited texts are subject
to their respective copyright conditions.
