# Digraph naar SVG

Open `index.html` in je browser (dubbelklikken volstaat, geen server nodig).

- **Plakken / typen** in de editor: de graaf wordt automatisch getekend (of Ctrl/Cmd + Enter).
- **Bestand-menu**: uploaden, digraph-code downloaden als `.dot` (ook Ctrl/Cmd + S) en leegmaken.
- **Uploaden** van een `.dot`, `.gv` of `.txt` bestand, via de knop of door het in de editor te slepen.
- **Snippets** (knop of Ctrl/Cmd + J): kant-en-klare stukjes code voor knopen, pijlen, clusters, automaten, … met zoekveld. Ze worden op de cursorpositie ingevoegd; eigen snippets voeg je toe in `js/snippets.js`. Onderaan staan links naar de Graphviz-handleiding.
- **Engine** kiezen: dot, neato, circo, fdp, sfdp, twopi, osage, patchwork.
- **Bekijken**: zoomen met − / + / Passend of Ctrl/Cmd + scrollwiel, slepen om te verschuiven.
- **Export-menu**: downloaden als SVG of PNG, of de SVG-code kopiëren.
- **Bewaren** in de browser (localStorage). Later kan dit naar PHP/MySQL.

Alles draait lokaal: `lib/viz-global.js` (Viz.js 3.25.0, Graphviz in WebAssembly) en `lib/jquery-3.7.1.min.js`.
