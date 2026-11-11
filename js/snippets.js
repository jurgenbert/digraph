/* Snippets voor het pop-upmenu.
 * whole: true  -> volledige graaf, vervangt de code in de editor (na bevestiging)
 * anders       -> wordt ingevoegd op de cursorpositie
 * Voeg gerust je eigen snippets toe: { t: 'Titel', d: 'uitleg', c: 'code' }
 */
window.DOT_SNIPPETS = [
  {
    group: 'Sjablonen (volledige graaf)',
    items: [
      { t: 'Lege digraph', whole: true, d: 'Startpunt met standaardstijlen',
        c: 'digraph G {\n    graph [fontname="Helvetica"];\n    node  [fontname="Helvetica"];\n    edge  [fontname="Helvetica"];\n\n    a -> b;\n}\n' },
      { t: 'Ongerichte graaf', whole: true, d: 'graph + -- in plaats van digraph + ->',
        c: 'graph G {\n    node [shape=circle];\n    a -- b -- c -- a;\n}\n' },
      { t: 'Eindige automaat (DFA)', whole: true, d: 'Starttoestand, overgangen en eindtoestand',
        c: 'digraph DFA {\n    rankdir=LR;\n    node [shape=circle, fontname="Helvetica"];\n    edge [fontname="Helvetica"];\n\n    start [shape=point, width=0.15];\n    q2 [shape=doublecircle];\n\n    start -> q0;\n    q0 -> q1 [label="a"];\n    q1 -> q2 [label="b"];\n    q1 -> q1 [label="a"];\n    q2 -> q0 [label="a, b"];\n}\n' },
      { t: 'Stroomdiagram', whole: true, d: 'Start/einde, stappen en beslissing',
        c: 'digraph Flow {\n    node [fontname="Helvetica", shape=box, style="rounded,filled", fillcolor="#eef3fb"];\n    edge [fontname="Helvetica"];\n\n    start [label="Start", shape=oval, fillcolor="#d7f5dd"];\n    stap  [label="Gegevens inlezen"];\n    keuze [label="Geldig?", shape=diamond, fillcolor="#fff3c4"];\n    fout  [label="Foutmelding tonen"];\n    einde [label="Einde", shape=oval, fillcolor="#f9d6d5"];\n\n    start -> stap -> keuze;\n    keuze -> einde [label="ja"];\n    keuze -> fout  [label="nee"];\n    fout  -> stap;\n}\n' },
      { t: 'Boomstructuur', whole: true, d: 'Hiërarchie / organigram',
        c: 'digraph Boom {\n    node [shape=box, style="rounded,filled", fillcolor="#eef3fb", fontname="Helvetica"];\n    edge [arrowhead=none];\n\n    root -> {kind1 kind2 kind3};\n    kind1 -> {k1a k1b};\n    kind3 -> {k3a};\n}\n' },
      { t: 'Databank (ER) met tabellen', whole: true, d: 'HTML-labels als tabellen',
        c: 'digraph ER {\n    rankdir=LR;\n    node [shape=plain, fontname="Helvetica"];\n\n    klant [label=<\n      <table border="0" cellborder="1" cellspacing="0" cellpadding="4">\n        <tr><td bgcolor="#dbe6f7"><b>klant</b></td></tr>\n        <tr><td port="id" align="left">id (PK)</td></tr>\n        <tr><td align="left">naam</td></tr>\n      </table>>];\n\n    bestelling [label=<\n      <table border="0" cellborder="1" cellspacing="0" cellpadding="4">\n        <tr><td bgcolor="#dbe6f7"><b>bestelling</b></td></tr>\n        <tr><td align="left">id (PK)</td></tr>\n        <tr><td port="klant" align="left">klant_id (FK)</td></tr>\n      </table>>];\n\n    bestelling:klant -> klant:id [arrowhead=crow, arrowtail=tee, dir=both];\n}\n' }
    ]
  },
  {
    group: 'Graaf-instellingen',
    items: [
      { t: 'Van links naar rechts', d: 'rankdir: TB (standaard), LR, BT, RL', c: 'rankdir=LR;' },
      { t: 'Titel boven de graaf', d: 'labelloc: t (boven) of b (onder)', c: 'label="Titel"; labelloc=t; fontsize=20;' },
      { t: 'Lettertype voor alles', d: 'Zelfde font voor graaf, knopen en pijlen',
        c: 'graph [fontname="Helvetica"];\nnode  [fontname="Helvetica"];\nedge  [fontname="Helvetica"];' },
      { t: 'Meer of minder ruimte', d: 'nodesep = naast elkaar, ranksep = tussen niveaus (inch)', c: 'nodesep=0.6; ranksep=0.9;' },
      { t: 'Rechte hoeken (orthogonaal)', d: 'splines: ortho, polyline, line, curved, spline', c: 'splines=ortho;' },
      { t: 'Transparante achtergrond', d: 'Handig voor SVG in een website', c: 'bgcolor=transparent;' },
      { t: 'Geen dubbele pijlen', d: 'Zet strict vóór digraph', c: 'strict digraph G {\n    \n}' },
      { t: 'Uitlijning in volgorde', d: 'Pijlen verlaten een knoop in de geschreven volgorde', c: 'ordering=out;' }
    ]
  },
  {
    group: 'Knopen',
    items: [
      { t: 'Standaardstijl voor knopen', d: 'Geldt voor alle knopen hierna',
        c: 'node [shape=box, style="rounded,filled", fillcolor="#eef3fb", color="#4a6fa5", fontname="Helvetica"];' },
      { t: 'Knoop met eigen tekst', d: 'id blijft kort, label is wat je ziet', c: 'n1 [label="Mijn tekst"];' },
      { t: 'Tekst op meerdere regels', d: '\\n = gecentreerd, \\l = links, \\r = rechts', c: 'n1 [label="Regel 1\\nRegel 2"];' },
      { t: 'Ingekleurde knoop', d: 'style=filled is nodig voor fillcolor', c: 'n1 [style=filled, fillcolor="#ffe08a", color="#b38600"];' },
      { t: 'Kleurverloop', d: 'Twee kleuren gescheiden door :', c: 'n1 [style=filled, fillcolor="#cfe0ff:#ffffff", gradientangle=90];' },
      { t: 'Ruit (beslissing)', c: 'n1 [shape=diamond, label="Ja of nee?"];' },
      { t: 'Cilinder (databank)', c: 'db [shape=cylinder, label="MySQL"];' },
      { t: 'Notitie / document', d: 'Ook: folder, tab, component', c: 'n1 [shape=note, label="Opmerking"];' },
      { t: 'Cirkel zonder tekst', d: 'Vaste grootte, label leeg', c: 'n1 [shape=circle, label="", width=0.4, fixedsize=true];' },
      { t: 'Dubbele rand', d: 'peripheries = aantal randen', c: 'n1 [shape=circle, peripheries=2];' },
      { t: 'Klein punt', d: 'Bv. als begin- of kruispunt', c: 'p [shape=point, width=0.12];' },
      { t: 'Vaste grootte', d: 'width/height in inch, fixedsize negeert de tekstlengte', c: 'n1 [width=1.5, height=0.6, fixedsize=true];' },
      { t: 'Record met velden', d: 'Velden met | scheiden, <poort> om naar te verwijzen',
        c: 'rec [shape=record, label="{Naam|<f1> veld 1|<f2> veld 2}"];' },
      { t: 'HTML-label (vet, cursief, kleur)', d: 'Labels tussen < > in plaats van " "',
        c: 'n1 [label=<<b>Vet</b> en <i>cursief</i><br/><font color="red" point-size="10">klein en rood</font>>];' },
      { t: 'Onzichtbare knoop', d: 'Neemt plaats in, handig voor uitlijning', c: 'dummy [style=invis];' },
      { t: 'Klikbare knoop (in SVG)', d: 'Link en tooltip werken in de SVG', c: 'n1 [URL="https://graphviz.org", tooltip="Open de website", target="_blank"];' },
      { t: 'Meerdere knopen tegelijk', d: 'Zelfde attributen voor een lijst', c: 'a, b, c [shape=box, color=blue];' }
    ]
  },
  {
    group: 'Pijlen (edges)',
    items: [
      { t: 'Pijl met label', c: 'a -> b [label="tekst"];' },
      { t: 'Keten', d: 'Meerdere pijlen in één regel', c: 'a -> b -> c -> d;' },
      { t: 'Eén naar meerdere', d: 'Accolades = groep knopen', c: 'a -> {b c d};' },
      { t: 'Lus naar zichzelf', c: 'a -> a [label="x"];' },
      { t: 'Standaardstijl voor pijlen', c: 'edge [color="#555555", penwidth=1.2, arrowsize=0.8, fontname="Helvetica", fontsize=11];' },
      { t: 'Gestreept / gestippeld', d: 'style: dashed, dotted, bold, invis', c: 'a -> b [style=dashed];' },
      { t: 'Dik en gekleurd', c: 'a -> b [color=red, penwidth=2.5];' },
      { t: 'Pijl in twee richtingen', d: 'dir: forward, back, both, none', c: 'a -> b [dir=both];' },
      { t: 'Zonder pijlpunt', c: 'a -> b [arrowhead=none];' },
      { t: 'Andere pijlpunt', d: 'normal, empty, vee, diamond, odiamond, dot, odot, tee, crow, box',
        c: 'a -> b [arrowhead=empty];' },
      { t: 'Labels aan de uiteinden', d: 'Bv. voor 1..n relaties', c: 'a -> b [taillabel="1", headlabel="n"];' },
      { t: 'Vanaf een bepaalde kant', d: 'Kompas: n, ne, e, se, s, sw, w, nw', c: 'a:e -> b:w;' },
      { t: 'Pijl zonder invloed op layout', d: 'Bepaalt het niveau niet mee', c: 'a -> b [constraint=false];' },
      { t: 'Kortere / langere pijl', d: 'minlen = minimum aantal niveaus', c: 'a -> b [minlen=2];' }
    ]
  },
  {
    group: 'Groepen en layout',
    items: [
      { t: 'Kader rond een groep (cluster)', d: 'De naam moet met cluster beginnen',
        c: 'subgraph cluster_groep {\n    label="Groep";\n    style="rounded,filled";\n    fillcolor="#f3f5f8";\n    color="#aab4c3";\n    a; b;\n}' },
      { t: 'Op dezelfde hoogte', d: 'rank: same, min, max, source, sink', c: '{ rank=same; a; b; c; }' },
      { t: 'Pijl naar een kader', d: 'compound=true op graafniveau; b moet in cluster_groep zitten',
        c: 'compound=true;\na -> b [lhead=cluster_groep];' },
      { t: 'Stijl voor een deel van de graaf', d: 'Zonder kader, enkel gedeelde attributen',
        c: '{\n    node [shape=box, color=gray];\n    x; y; z;\n}' },
      { t: 'Vaste volgorde afdwingen', d: 'Onzichtbare pijlen ordenen knopen', c: 'a -> b -> c [style=invis];' }
    ]
  },
  {
    group: 'Automaten',
    items: [
      { t: 'Toestanden als cirkels', c: 'node [shape=circle, fontname="Helvetica"];' },
      { t: 'Startpijl', d: 'Onzichtbaar punt met pijl naar de begintoestand',
        c: 'start [shape=point, width=0.15];\nstart -> q0;' },
      { t: 'Eindtoestand', d: 'doublecircle = aanvaardende toestand', c: 'q1 [shape=doublecircle];' },
      { t: 'Overgang met symbolen', c: 'q0 -> q1 [label="a, b"];' },
      { t: 'Epsilon-overgang', d: 'Griekse letters gewoon als tekst of &epsilon;', c: 'q0 -> q1 [label="ε"];' }
    ]
  },
  {
    group: 'Commentaar',
    items: [
      { t: 'Commentaar op één regel', c: '// opmerking' },
      { t: 'Commentaarblok', c: '/*\n   opmerking\n*/' }
    ]
  }
];

window.DOT_MANUAL_LINKS = [
  { t: 'DOT-taal', u: 'https://graphviz.org/doc/info/lang.html' },
  { t: 'Alle attributen', u: 'https://graphviz.org/doc/info/attrs.html' },
  { t: 'Vormen', u: 'https://graphviz.org/doc/info/shapes.html' },
  { t: 'Pijlpunten', u: 'https://graphviz.org/doc/info/arrows.html' },
  { t: 'Kleurnamen', u: 'https://graphviz.org/doc/info/colors.html' },
  { t: 'Galerij', u: 'https://graphviz.org/gallery/' }
];
