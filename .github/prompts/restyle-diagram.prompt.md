---
name: restyle-diagram
description: "Restyle an existing relationship diagram to the neural graph look"
argument-hint: "the diagram file, or a description of the diagram"
agent: agent
---
Restyle the diagram I point to (an attached or open file, or the one I describe) to the neural graph look.

Follow [the Copilot instructions](../copilot-instructions.md), [the design spec](../../docs/DESIGN-SPEC.md) and [the data schema](../../docs/DATA-SCHEMA.md). The reference build is [neural-graph.js](../../src/neural-graph.js) with [neural-graph.css](../../src/neural-graph.css).

1. Extract every node, group and connection from the diagram, keeping names and connections exactly as they are.
2. Output the graph JSON in the schema, then either:
   - a web page that renders it with `src/neural-graph.js` and `src/neural-graph.css`, or
   - the same diagram in its own format (Mermaid, draw.io, and so on) styled with the matching row of the design spec's tool table.
3. List anything in the source you could not map (for example a connection with no clear direction) instead of guessing.
