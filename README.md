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

Copy these into the root of your work repository at the same paths (VS Code picks them up from there):

| File | What VS Code does with it |
|---|---|
| `.github/copilot-instructions.md` | Added to every Copilot chat in that workspace automatically |
| `.github/instructions/diagrams.instructions.md` | Added automatically when Copilot works on diagram files (Mermaid, draw.io, SVG, HTML, JSON, CSV) |
| `.github/prompts/restyle-diagram.prompt.md` | Type `/restyle-diagram` in Copilot chat, then attach or name your diagram |
| `docs/DESIGN-SPEC.md`, `docs/DATA-SCHEMA.md` | The look rules and data shape the files above point to |
| `src/neural-graph.js`, `src/neural-graph.css` | The working renderer, for diagrams that live on a web page |

Keep the paths as they are: the instruction and prompt files link to the docs and source by relative path.
If `copilot-instructions.md` is not picked up, check that the VS Code setting `github.copilot.chat.codeGeneration.useInstructionFiles` is on.

## Files

```
index.html                         demo page
src/neural-graph.js, .css          the renderer
data/example.json, example.js      sample data (example.js is the same data as a script, so the demo opens straight from disk)
docs/DESIGN-SPEC.md                look rules and tokens
docs/DATA-SCHEMA.md                data shape
tools/csv_to_graph.py              spreadsheet to JSON
.github/                           VS Code Copilot instructions, scoped instructions and prompt
```

## Credits

The beam technique follows the open "animated beam" pattern (a gradient window sliding along an SVG path). Fonts: Young Serif and Nunito, both under the SIL Open Font License, loaded from Google Fonts with system fallbacks.

MIT licensed.
