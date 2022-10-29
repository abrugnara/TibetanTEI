# Welcome to the TibetanTEI repository - a solution for TEI students to render Tibetan TEI without xslt transformation

This repository is part of the teaching material for the course
**[142016 PS Introduction to digital methods and tools for Tibetan studies (2021W)](https://ufind.univie.ac.at/en/course.html?lv=142016&semester=2021W)** at the University of Vienna.

## Tibetan TEI-xml examples

To display Tibetan TEI editions directly in your browser with TEI Boilerplate directly run the xml files from the static GitHub page:

* **[SRC r103](https://sakyaresearchcentre.github.io/TibetanTEI/content/r103_BP_2021-10-03.xml)**
Example for a TEI-xml Tibetan diplomatic edition, SRC etext ID: [r103](https://sakyaresearch.org/etexts/103/)

* **[TEI-xml for reading class WS2021](https://sakyaresearchcentre.github.io/TibetanTEI/content/TEI%20Ganden%20History_BP_excersise%20WS2021_2021-10-03.xml)**
TEI-xml template for creating a digital edition from a text passage in sDe srid Sangs rgyas rgya mtsho's [_dGa' ldan chos 'byung_](https://sakyaresearch.org/sources/2559)

* **[TEI-xml template for Tibetan text](https://sakyaresearchcentre.github.io/TibetanTEI/content/TEI%20header_BP_2021-10-03.xml)**
TEI header with TEI-bp encoding description


### Basic TEI-Markup for Tibetan historical texts (diplomatic editions)

```
page breaks: <pb/>; e.g. <pb ed="A" n="1a"/>
divisions: <div>...</div>
paragraphs: <p>...</p>
line breaks: <lb/> 
lines: <l>...</l>
line groups: <lg>...</lg>
headings: <head>...</head>

gaps: <gap></gap>; e.g. <gap extent="4" unit="letters"></gap>
unclear sections: <unclear>...</unclear>
translation part: <trans>...</trans>; e.g. <trans xml:lang="en">...</trans>
special terminology in the translation (Sanskrit or Tibetan): <term>...</term>; e.g. <term>pravrajyā</term>
corrections: <choice><sic>...</sic><corr>...</corr></choice>; e.g. བསམ་<choice><sic>གྱི་</sic><corr>གྱིས་</corr></choice>མི་ཁྱག་་་་
regulations: <choice><orig>...</orig><reg>...</reg></choice>

annotations (by the author/scribe): <gloss>...</gloss>
dates: <date>...</date>; e.g. <date when="1446">མེ་ཕོ་སྟག་གི་ལོ</date>
persons: <persName>...</persName>; e.g. <persName type="BUDA" key="P3183">རྡོ་རྗེ་གདན་པ་ཀུན་དགའ་རྣམ་རྒྱལ་དཔལ་བཟང་པོ</persName>
places: <placeName>...</placeName>; e.g. <placeName type="BUDA" key="G2800">ལྷ་ས</placeName>
work titles: <title>...</title>; e.g. <title type="RKTS" key="3219">བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པའི་ལེགས་པར་སྦྱར་བ</title>། 

```
