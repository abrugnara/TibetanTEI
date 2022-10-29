# TibetianTEI Albert Brugnara
Institut für Südasien-, Tibet- und Buddhismuskunde (ISTB); https://stb.univie.ac.at)

Grundlegendes TEI-Markup für tibetische historische Texte (diplomatische Editionen)
     
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
    work titles: <title>...</title>; e.g. <title type="RKTS" key="3219">བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པའི་ལེགས་པར་སྦྱར་བ</title>།"
