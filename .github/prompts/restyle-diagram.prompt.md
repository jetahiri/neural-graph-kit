---
mode: agent
description: "Restyle an existing relationship diagram to the neural graph look"
---
Restyle the diagram in ${file} (or the one I describe) to the neural graph look.

1. Read `docs/DESIGN-SPEC.md`, `docs/DATA-SCHEMA.md` and `.github/copilot-instructions.md`.
2. Extract every node, group and connection from the diagram, keeping names and connections exactly as they are.
3. Output the graph JSON in the schema, then either:
   - a web page that renders it with `src/neural-graph.js` and `src/neural-graph.css`, or
   - the same diagram in its own format (Mermaid, draw.io, and so on) styled with the matching row of the design spec's tool table.
4. List anything in the source you could not map (for example a connection with no clear direction) instead of guessing.
