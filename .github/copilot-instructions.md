# Instructions for Copilot: the neural graph look

When asked to create, update or restyle a relationship, dependency, lineage or architecture diagram, make it match the neural graph look in this kit.

Read first:
- `docs/DESIGN-SPEC.md` for the ten rules and the colour tokens.
- `docs/DATA-SCHEMA.md` for the data shape.
- `src/neural-graph.js` and `src/neural-graph.css` as the reference build.

How to work:
1. Find the diagram's things and connections in the existing source (Mermaid, draw.io XML, HTML, D3, a table, a CSV) and list them as nodes and edges in the schema. Keep every name and connection exactly as the source has it; do not invent nodes, statuses or descriptions.
2. If the target is a web page, render it with `src/neural-graph.js` and `src/neural-graph.css` and the JSON. Do not add libraries.
3. If the target is another tool, apply the matching row of the "Carrying the look into other tools" table in the design spec.
4. Group nodes the way the source groups them (subgraphs, swimlanes, containers, schemas).
5. Use `oversee` edges only for monitoring or checking relationships; everything else is `flow`.
6. Status: use `ok`, `warn`, `error`, `idle` only when the source says so; otherwise leave status out (it shows as idle).
7. Keep it accessible: the status word stays beside every status colour, and reduced motion turns the beams off.
