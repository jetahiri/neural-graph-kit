# Design spec: the neural graph look

This is the look to reproduce in any relationship or architecture diagram. The reference build is `src/neural-graph.css` and `src/neural-graph.js`; this file states the rules so they can be carried into other tools.

## The idea in one line

Frosted-glass cards float over a soft, lit background. Curved connectors join them, and light travels along the connectors like signals in a nervous system.

## Rules

1. **Layout reads left to right.** Columns follow the flow: sources on the left, outputs on the right. Each node sits one column after the furthest thing that feeds it.
2. **Groups are soft regions, not boxes.** A group is a large, very faint rounded shape (radius 40) behind its members, labelled top left in the heading font. No hard borders.
3. **Nodes are glass cards.** White at 62% opacity (dark mode: deep blue at 58%), heavy background blur, a bright 1 px inner rim, a soft long drop shadow, radius 24. Name in the heading font, a one-line kind under it, then a status line.
4. **Status is never colour alone.** A 4 px bar on the card's left edge and a dot both take the status colour, and the status word is always written next to the dot. Broken and needs-a-look dots pulse; healthy stays calm.
5. **Connectors are cubic curves.** Leave from the side facing the target, enter the side facing the source. Control length is 42% of the distance, clamped between 44 and 160. Normal flow is solid; oversight (watches, checks) is dashed. Small arrowhead at the end.
6. **Light travels the connectors.** Each connector carries a beam: a short gradient window (sky blue to azure, transparent at both ends) slides from source to target in 2.8 s with an ease-out-expo curve, with a blurred 8 px copy underneath as glow. At rest every connector fires on its own slow, uneven rhythm (a gap of 1.8 to 6 s), so the whole map looks alive.
7. **Focus lights one neighbourhood.** Hovering or selecting a node brightens its connectors, loops their beams fast, shows their labels, and dims everything unrelated.
8. **Details live in a side panel.** Clicking a node opens a glass panel: name, kind, status, description, then "Gets input from" and "Sends output to" as clickable chips.
9. **Light and dark are the same objects in different light.** Same layout; only glass, ink, glow and background change. Dark is a night scene, not an inversion.
10. **Respect reduced motion.** No beams or pulses; lit connectors are drawn solid instead.

## Tokens

| Token | Light | Dark |
|---|---|---|
| Ink, ink 2, ink 3 | #10202f, #34506a, #4a647c | #eef4fa, #c3d2e2, #a5b8cc |
| Accent | #175285 (text), #1b5f9e (fill) | #a9d4f7 |
| Beam | #4a9ad2 into #1b5f9e | #7fc1f5 into #a9d4f7 |
| Glass | rgba(255,255,255,.62), blur 28 | rgba(20,32,52,.58), blur 28 |
| Connector | rgba(23,82,133,.32) | rgba(190,214,255,.34) |
| Background | #eef3f8 to #dfe8f1, warm glow top right, cool glow bottom left | #0b1626 to #08101c, ember glow, blue glow |
| Healthy | rgb(46,158,102), word ink #12603a | rgb(92,214,150), #a5e8c2 |
| Needs a look | rgb(230,158,44), #744500 | rgb(255,186,84), #ffd48f |
| Broken | rgb(224,84,68), #9a2c23 | rgb(255,120,104), #ffb8ae |
| Off or not run | rgb(118,136,153), #43586b | rgb(160,178,196), #c3d0dc |

Type: headings and numbers in Young Serif (fallback Georgia), everything else in Nunito (fallback the system sans). Sentence case everywhere.

## Carrying the look into other tools

| Tool | What carries over | How |
|---|---|---|
| Any web page | Everything | Use `src/` as is and feed it JSON in the schema (`docs/DATA-SCHEMA.md`). |
| Mermaid | Colours, curves, dashed oversight | `%%{init: {"theme":"base","flowchart":{"curve":"basis"},"themeVariables":{"primaryColor":"#ffffff","primaryBorderColor":"#c7d6e4","lineColor":"#5b84a8","fontFamily":"Nunito"}}}%%`, `flowchart LR`, `subgraph` per group, `-.->` for oversight, `classDef ok/warn/error/idle` for the status bar colour. No animation. |
| draw.io / diagrams.net | Colours, curves, groups | Rounded rectangles (arc 24) with white fill at 62% opacity and a soft shadow; edges with style `curved=1`; containers with fill opacity 30% and no stroke. Flow animation is available as `flowAnimation=1` on edges. |
| Visio, PowerPoint | Colours, curves, groups | Rounded cards, curved connectors, a soft transparent shape per group, status word plus coloured dot. Static. |
| Power BI and similar | Colours and status words | Use the token table for theme colours; keep the word beside every status colour. |
