# Neural graph kit

A small, dependency-free kit that draws relationship diagrams in a "neural network" style: frosted-glass cards, curved connectors, and light that travels along the connectors like signals. Light and dark modes, click a node for its details, zoom and pan, reduced-motion friendly.

Open `index.html` in a browser to see the example.

## Use it

```html
<link rel="stylesheet" href="src/neural-graph.css">
<div id="map" style="height:100vh"></div>
<script src="src/neural-graph.js"></script>
<script>NeuralGraph.render(document.getElementById('map'), myGraphData);</script>
```

`myGraphData` follows `docs/DATA-SCHEMA.md`. To start from a spreadsheet, see the CSV section there.

## Use it with GitHub Copilot

Give Copilot these files as context (attach them in chat, or copy them into your own repository at the same paths):

| File | What it gives Copilot |
|---|---|
| `.github/copilot-instructions.md` | How to restyle any diagram to this look (Copilot reads it automatically when it sits in a repository's `.github` folder) |
| `docs/DESIGN-SPEC.md` | The ten look rules, colour tokens, and how to carry the look into Mermaid, draw.io, Visio or Power BI |
| `docs/DATA-SCHEMA.md` | The data shape to convert a diagram into |
| `src/neural-graph.js`, `src/neural-graph.css` | The reference build to reuse for web pages |
| `.github/prompts/restyle-diagram.prompt.md` | A ready prompt: "restyle this diagram" |

## Files

```
index.html                         demo page
src/neural-graph.js, .css          the renderer
data/example.json, example.js      sample data (example.js is the same data as a script, so the demo opens straight from disk)
docs/DESIGN-SPEC.md                look rules and tokens
docs/DATA-SCHEMA.md                data shape
tools/csv_to_graph.py              spreadsheet to JSON
.github/                           Copilot instructions and prompt
```

## Credits

The beam technique follows the open "animated beam" pattern (a gradient window sliding along an SVG path). Fonts: Young Serif and Nunito, both under the SIL Open Font License, loaded from Google Fonts with system fallbacks.

MIT licensed.
