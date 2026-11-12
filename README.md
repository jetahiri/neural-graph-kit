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

## Use it with GitHub Copilot in VS Code

Only one file is needed: `.github/copilot-instructions.md`. Put it at the same path in your project and VS Code adds it to every Copilot chat there. It holds the whole look (layout, colours, the light effect, interaction, other tools), so Copilot writes the diagram code itself. Then ask: "Restyle this diagram to the neural graph look", with your diagram attached.

Everything else in this repo is a working reference (`index.html` demo, `src/` renderer, `docs/` long-form spec) and is optional.

## Files

```
index.html                         demo page
src/neural-graph.js, .css          the renderer
data/example.json, example.js      sample data (example.js is the same data as a script, so the demo opens straight from disk)
docs/DESIGN-SPEC.md                look rules and tokens
docs/DATA-SCHEMA.md                data shape
tools/csv_to_graph.py              spreadsheet to JSON
.github/copilot-instructions.md    the one file Copilot needs
```

## Credits

The beam technique follows the open "animated beam" pattern (a gradient window sliding along an SVG path). Fonts: Young Serif and Nunito, both under the SIL Open Font License, loaded from Google Fonts with system fallbacks.

MIT licensed.
